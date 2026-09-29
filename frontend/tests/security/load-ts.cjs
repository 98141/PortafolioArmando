// Execute project TS/TSX with the installed TypeScript compiler, without new test dependencies.
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
module.exports = function loadTs(relative, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, "../..", relative);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  const localRequire = createRequire(filename);
  const requireDependency = (id) => Object.hasOwn(mocks, id) ? mocks[id] : localRequire(id);
  const run = vm.runInNewContext(`(function(exports, require, module) { ${source}\n})`,
    { console, URL, FormData, Blob, File, Response, setTimeout, clearTimeout, ...globals }, { filename });
  run(compiledModule.exports, requireDependency, compiledModule);
  return compiledModule.exports;
};
