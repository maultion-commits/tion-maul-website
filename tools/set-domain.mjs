#!/usr/bin/env node
/**
 * Trägt die endgültige Domain in die Seite ein:
 *   - canonical-Link, og:url, og:image, twitter:card/-image und WebSite-JSON-LD in index.html
 *   - sitemap.xml (neu) und die Sitemap-Zeile in robots.txt
 *
 * Aufruf (im Projektordner):
 *   node tools/set-domain.mjs https://tionmaul.de
 *   oder für GitHub Pages: node tools/set-domain.mjs https://maultion-commits.github.io/tion-maul-website
 *
 * Das Skript kann beliebig oft laufen: es ersetzt nur den Bereich zwischen
 * <!-- domain:start --> und <!-- domain:end --> in index.html.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (process.argv[2] || '').trim();

let url;
try {
  url = new URL(arg);
} catch {
  fail('Bitte eine vollständige Adresse angeben, zum Beispiel: node tools/set-domain.mjs https://tionmaul.de');
}
if (url.protocol !== 'https:') fail('Die Adresse muss mit https:// beginnen.');
if (url.search || url.hash) fail('Bitte ohne Suchteil und Anker angeben.');
// Ein Pfad ist nur für GitHub-Pages-Projektseiten nötig (https://name.github.io/projekt); bei einer eigenen Domain bleibt er leer.
const origin = url.origin + url.pathname.replace(/\/+$/, '');

const title = 'Tion Maul – Webdesign aus Stadtroda';
const alt = 'Tion Maul – Webdesign: Websites, die Ihr Unternehmen sichtbar machen, mit Vorschau auf zwei Referenzprojekte';

const block = `<!-- domain:start -->
  <link rel="canonical" href="${origin}/">
  <meta property="og:url" content="${origin}/">
  <meta property="og:image" content="${origin}/assets/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:image" content="${origin}/assets/og-image.jpg">
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "WebSite", "name": "Tion Maul – Webdesign", "url": "${origin}/", "inLanguage": "de-DE" }
  </script>
  <!-- domain:end -->`;

const indexPath = join(root, 'index.html');
const html = readFileSync(indexPath, 'utf8');
const re = /<!-- domain:start -->[\s\S]*?<!-- domain:end -->/;
if (!re.test(html)) fail('Die Markierungen <!-- domain:start --> / <!-- domain:end --> fehlen in index.html.');
writeFileRetry(indexPath, html.replace(re, block));

const today = new Date().toISOString().slice(0, 10);
writeFileRetry(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${origin}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`
);

const robotsPath = join(root, 'robots.txt');
const robots = readFileSync(robotsPath, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !/^sitemap:/i.test(l));
writeFileRetry(robotsPath, robots.join('\n') + `\n\nSitemap: ${origin}/sitemap.xml\n`);

console.log(`Domain eingetragen: ${origin}`);
console.log('Geändert: index.html, sitemap.xml, robots.txt');

/** Schreibt eine Datei und versucht es bei kurzzeitigen Windows-Sperren (EBUSY/EPERM, z. B. durch Virenscanner) erneut. */
function writeFileRetry(path, data) {
  for (let attempt = 1; ; attempt++) {
    try {
      writeFileSync(path, data);
      return;
    } catch (err) {
      if (!['EBUSY', 'EPERM', 'EACCES'].includes(err.code) || attempt >= 8) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150 * attempt);
    }
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
