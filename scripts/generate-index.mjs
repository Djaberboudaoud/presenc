/**
 * Post-build script: generates a minimal SPA index.html inside dist/client
 * so Vercel can serve the app as a static single-page application.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Always resolve relative to the project root (where package.json lives)
const projectRoot = process.cwd();
const clientDir = resolve(projectRoot, "dist/client");
const manifestPath = resolve(projectRoot, "dist/server/.vite/manifest.json");

console.log("📁 Project root:", projectRoot);
console.log("📁 Looking for manifest at:", manifestPath);

if (!existsSync(manifestPath)) {
  console.error("❌ manifest.json not found at", manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

// Collect CSS files from the server manifest
const cssFiles = new Set();
for (const [key, entry] of Object.entries(manifest)) {
  if (key.endsWith(".css") && entry.file) {
    cssFiles.add(entry.file);
  }
  if (entry.assets) {
    entry.assets.forEach((a) => {
      if (a.endsWith(".css")) cssFiles.add(a);
    });
  }
}

// Find the client entry JS from dist/client/assets
let entryJS = "";
const clientAssetsDir = resolve(clientDir, "assets");
if (existsSync(clientAssetsDir)) {
  const assets = readdirSync(clientAssetsDir);
  // Look for the smallest index-*.js file (the entry point, not the large bundle)
  const indexFiles = assets
    .filter((f) => f.startsWith("index-") && f.endsWith(".js"))
    .sort();
  if (indexFiles.length > 0) {
    // The entry point is typically the smallest index file
    entryJS = `assets/${indexFiles[0]}`;
  }
}

const cssLinks = [...cssFiles]
  .map((f) => `    <link rel="stylesheet" href="/${f}" />`)
  .join("\n");

const jsScript = entryJS
  ? `    <script type="module" src="/${entryJS}"></script>`
  : "";

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>حاضر — منصة إدارة الحضور</title>
    <meta name="description" content="منصة احترافية لإدارة حضور الطلاب في الامتحانات" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" />
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
${jsScript}
  </body>
</html>
`;

writeFileSync(resolve(clientDir, "index.html"), html, "utf-8");
console.log("✅ dist/client/index.html generated successfully");
console.log("   CSS:", [...cssFiles].join(", "));
console.log("   JS entry:", entryJS || "(none found)");
