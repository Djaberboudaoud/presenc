import worker from "../dist/server/index.js";
import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("Generating static index.html via server SSR...");
// Use /login because the root route redirects, and we need the full HTML body
const req = new Request("http://localhost/login");

// Call the server worker to render the HTML
const res = await worker.fetch(req, {}, { waitUntil: () => {} });
const html = await res.text();

const outPath = resolve(__dirname, "../dist/client/index.html");
await writeFile(outPath, html, "utf8");
console.log("✅ dist/client/index.html generated successfully (Length: " + html.length + ")");


