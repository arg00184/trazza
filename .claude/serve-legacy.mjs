// Servidor estatico minimo para consultar la app legada (legacy/app.html + app.js + styles.css
// + i18n.js) y la landing que tuvo hasta septiembre de 2026 (legacy/index.html). No tiene build
// ni dev server propio. Solo para desarrollo local: sirve legacy/ en http://localhost:5178.
//
// El legado ya NO se despliega: produccion sirve web/dist (landing en "/" y app React en
// "/app"). Esto existe para poder mirar como hacia algo la version anterior, no para trabajar
// en ella.
//
// La raiz se resuelve desde la ruta de este fichero y no desde process.cwd() a proposito: el
// lanzador de .claude/launch.json arranca el proceso sin un cwd utilizable en el Mac.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = normalize(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const ROOT = join(REPO, "legacy");
// La pagina legal se movio con la app nueva (web/public/legal.html) porque es la que se sirve
// hoy, pero el legado la enlaza desde su pie. Se busca ahi como segunda opcion para que esos
// enlaces no den 404 al revisar el archivo, en vez de duplicar un texto contractual.
const FALLBACK = join(REPO, "web", "public");
const PORT = Number(process.env.PORT || 5178);

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

async function readFrom(base, requestPath) {
  const filePath = normalize(join(base, requestPath));
  // Sigue comprobandose por base y no solo por ROOT: son dos raices, y una ruta con ".."
  // podria escaparse de una aunque cayera dentro de la otra.
  if (!filePath.startsWith(base + sep)) return null;

  try {
    return { body: await readFile(filePath), filePath };
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const wanted = requestPath === "/" ? "/app.html" : requestPath;

  const hit = (await readFrom(ROOT, wanted)) ?? (await readFrom(FALLBACK, wanted));

  if (!hit) {
    response.statusCode = 404;
    response.end("404");
    return;
  }

  response.setHeader("content-type", MIME[extname(hit.filePath)] || "application/octet-stream");
  response.setHeader("cache-control", "no-store");
  response.end(hit.body);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Legado servido en http://localhost:${PORT} (raiz: ${ROOT})`);
  console.log(`  app legada     http://localhost:${PORT}/`);
  console.log(`  landing legada http://localhost:${PORT}/index.html`);
});
