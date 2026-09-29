// frontend/server.js
// Archivo de arranque para cPanel "Setup Node.js App" (Passenger).
// Passenger no ejecuta "npm start"/"next start"; requiere un archivo .js
process.env.NODE_ENV = "production";
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT && !/^\d+$/.test(process.env.PORT)
  ? process.env.PORT
  : Number(process.env.PORT || 3000);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("Error al procesar la solicitud:", error);
      if (res.headersSent) return res.destroy();
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
  });
  server.on("error", (error) => {
    console.error("No se pudo iniciar el frontend:", error);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(`> Frontend listo en el puerto ${port}`);
  });
}).catch((error) => {
  console.error("No se pudo preparar Next.js:", error);
  process.exit(1);
});
