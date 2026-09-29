import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

// Runs a verification script against an existing build and always stops its server.
// Usage: node scripts/with-production.mjs scripts/measure-public.mjs [output] [--check]
const [script, ...args] = process.argv.slice(2);
if (!script) throw new Error("A verification script is required");
const cwd = fileURLToPath(new URL("../", import.meta.url));
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3100"], {
  cwd, windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "production" },
});
const stopped = once(server, "exit");
server.stderr.pipe(process.stderr);
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Production server startup timed out")), 30000);
    server.once("error", reject);
    server.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Production server exited: ${code}`)); });
    server.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Ready")) { clearTimeout(timer); resolve(); }
    });
  });
  const child = spawn(process.execPath, [script, "http://127.0.0.1:3100", ...args], { cwd, windowsHide: true, stdio: "inherit" });
  const [code] = await once(child, "exit");
  process.exitCode = code ?? 1;
} finally {
  if (server.exitCode === null && server.signalCode === null) server.kill();
  const force = setTimeout(() => server.kill("SIGKILL"), 5000);
  await stopped;
  clearTimeout(force);
}
