# Activar el contacto con Resend

El formulario envía al backend y este llama a Resend. El destinatario solicitado es **armandomora14115@gmail.com**. El visitante queda como `Reply-To`: responder desde Gmail dirige la respuesta al visitante. No necesitas una contraseña de Gmail ni configurar SMTP.

## Configuración pendiente en tu cuenta

1. Crear o abrir tu cuenta de [Resend](https://resend.com).
2. En **Domains**, agregar un dominio propio, por ejemplo `armandomora.com.co`, y publicar en su DNS los registros que indique Resend. Esperar a que aparezca verificado. Copiar los valores exactos del panel; no sustituir registros de correo existentes sin revisar su función.
3. Crear una API key con permiso de envío, limitada al dominio cuando sea posible. Guardarla directamente en las variables privadas del backend. No pegarla en el chat, Git ni variables `NEXT_PUBLIC_*`.
4. Configurar estas variables en el alojamiento de la API:

```dotenv
RESEND_API_KEY=<clave privada de Resend>
CONTACT_FROM=Portafolio Armando Mora <contacto@armandomora.com.co>
CONTACT_TO=armandomora14115@gmail.com
```

El remitente mostrado arriba es un **ejemplo pendiente de autorizar**, no una cuenta ya creada ni verificada. Debe pertenecer al dominio verificado en Resend. Gmail es el destino; no utilizar `@gmail.com` como remitente de Resend. El correo `onboarding@resend.dev` permite pruebas restringidas al correo de la cuenta de Resend, no reemplaza la verificación del dominio para publicar. [Restricciones de prueba](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

5. Reiniciar el backend y publicar este release del frontend. Mantener `FRONTEND_URL=https://armandomora.com.co` y `NEXT_PUBLIC_API_URL=https://api.armandomora.com.co/api`.
6. Hacer un envío propio desde `/contact`, verificar el evento de entrega en Resend y la recepción en Gmail, incluyendo spam. Comprobar que “Responder” apunta al correo del visitante. Esta prueba real **todavía no se ha realizado**.

El plan gratuito publicado al 29-09-2026 incluye 3.000 emails/mes y 100/día. No se ha contratado ningún plan ni modificado tu cuenta. Consultar los [límites actuales](https://resend.com/pricing) antes de activarlo.

## Comportamiento y límites

- Sin configuración, la API devuelve 503 y el formulario conserva los campos. Nunca informa un éxito simulado.
- HTTP 202 significa que Resend aceptó el mensaje para enviarlo; no confirma entrega en Gmail. Rechazos, cuota agotada y fallos del proveedor devuelven 503.
- Se envía texto plano, con remitente y destinatario fijados en el servidor. El visitante no controla esos encabezados. Los campos se validan con Zod; hay honeypot y límite de cinco intentos por IP/hora, además del límite general de API.
- El límite por IP está en memoria del proceso: se reinicia con el servidor y no se comparte entre varias instancias. Para mayor volumen se necesitará un almacén compartido y control adicional de abuso. No equivale a protección completa contra bots distribuidos ni garantiza no consumir la cuota gratuita.
- No hay reintentos automáticos ni almacenamiento de mensajes en MongoDB. Un timeout puede dejar incierto si el proveedor aceptó el envío; se advierte antes de reintentar. Los logs no guardan cuerpo del mensaje, email del visitante ni API key.
- La información se procesa por Resend y llega al buzón de destino. El formulario informa ese uso; la política de privacidad y retención debe ajustarse antes de publicar si el sitio requiere condiciones adicionales.

## Pruebas locales sin enviar correos

`npm test --prefix backend` prueba el endpoint con un proveedor simulado. `npm run test:public --prefix frontend` levanta una API de fixtures y Next en localhost:3110 para verificar SSR, filtros, códigos HTTP y sitemap. Instalar primero las dependencias de ambos proyectos.

Para revisión visual: `node frontend/scripts/verify-public.mjs --serve`. El formulario de esa vista usa exclusivamente un proveedor simulado. Un asunto que contenga `rechazo` simula un fallo; cualquier otro asunto válido simula aceptación. El servidor imprime la URL local para detenerlo y se cierra automáticamente a los 15 minutos. Los fixtures no se importan desde el código de la aplicación.
