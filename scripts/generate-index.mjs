import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distClient = new URL("../dist/client/assets/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

// Find the CSS and main JS bundle
const assets = await readdir(distClient);

const cssFile = assets.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const mainJs  = assets.find((f) => f.startsWith("index-") && f.endsWith(".js") && f.length > 20 && f.includes("c5Cotrc") );

// Fallback: find the largest JS file (the main bundle)
const allJs = assets.filter((f) => f.endsWith(".js")).sort((a, b) => {
  // sort by name length desc to find hashed ones
  return b.length - a.length;
});

// The client entry is the one that contains hydrateRoot — index-c5Cotrc8.js
// Use the first index-*.js that is NOT the tiny ones
const entryJs = mainJs || allJs.find((f) => f.startsWith("index-") && !["index-DtqBFgK5.js", "index-D7txDF9b.js"].includes(f));

const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>نظام إدارة الحضور</title>
    <meta name="description" content="نظام الحضور والغياب للمراكز التكوينية" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${entryJs ? `<script type="module" src="/assets/${entryJs}"></script>` : ""}
  </body>
</html>`;

const outPath = join(distClient, "..", "index.html");
await writeFile(outPath, html, "utf8");
console.log(`✓ Generated dist/client/index.html (css=${cssFile}, js=${entryJs})`);
