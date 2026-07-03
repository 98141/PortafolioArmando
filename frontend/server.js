// frontend/server.js
// Archivo de arranque para cPanel "Setup Node.js App" (Passenger).
// Passenger no ejecuta "npm start"/"next start"; requiere un archivo .js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Frontend listo en el puerto ${port}`);
  });
});
