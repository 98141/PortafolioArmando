const express = require("express");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const singleLine = (max) => z.string().trim().min(2).max(max).regex(/^[^\r\n]+$/);
const contactSchema = z.object({
  name: singleLine(100),
  email: z.string().trim().email().max(254),
  subject: singleLine(150),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

// Dependencies can be replaced in HTTP tests without contacting an email service.
function createContactRouter({ send = (...args) => fetch(...args), env = process.env } = {}) {
  const router = express.Router();
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.post("/", rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { status: "error", message: "Has alcanzado el límite de mensajes. Inténtalo en una hora." },
  }), catchAsync(async (req, res, next) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError("Revisa los campos: nombre, correo, asunto y mensaje (10 a 5000 caracteres).", 400));
    if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !z.string().email().safeParse(env.CONTACT_TO).success) {
      return next(new AppError("El formulario de contacto no está disponible por el momento. Inténtalo más tarde.", 503));
    }
    const { name, email, subject, message } = parsed.data;
    let response;
    let result;
    try {
      response = await send("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          from: env.CONTACT_FROM,
          to: [env.CONTACT_TO],
          reply_to: email,
          subject: `[Portafolio] ${subject}`,
          text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}`,
        }),
      });
      result = await response.json();
    } catch {
      return next(new AppError("No pudimos confirmar el envío. Espera unos minutos antes de volver a intentarlo.", 503));
    }
    if (!response.ok || typeof result?.id !== "string" || !result.id) {
      // Never log the API key, visitor details or provider response body.
      console.error("contact_provider_rejected", { status: response.status, requestId: req.requestId });
      return next(new AppError("No se pudo enviar el mensaje. Inténtalo más tarde.", 503));
    }
    res.status(202).json({ status: "success", message: "Tu mensaje fue aceptado para envío. Gracias por contactar." });
  }));
  return router;
}

module.exports = { createContactRouter };
