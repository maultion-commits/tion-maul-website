# Tion Maul – Webdesign (Firmenwebsite / Portfolio)

Statische Website ohne Build-Schritt: reines HTML, CSS und JavaScript. Keine Cookies, kein Tracking,
keine externen Schriften oder Skripte (Schriften liegen lokal in `assets/fonts`, Lizenz: OFL).

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite (Hero, Leistungen, Referenzen, Ablauf, Über mich, FAQ, Kontakt) |
| `impressum.html`, `datenschutz.html` | Rechtliche Seiten (bitte vor dem Livegang prüfen) |
| `404.html` | Fehlerseite |
| `assets/styles.css`, `assets/main.js`, `assets/boot.js` | Gestaltung und Verhalten |
| `assets/img/` | Vorschaubilder der Referenzen (WebP, 1200 × 750) |
| `assets/og-image.jpg` | Link-Vorschaubild (1200 × 630) für WhatsApp, LinkedIn & Co. |
| `tools/og-image.html` | Vorlage für das Link-Vorschaubild |
| `tools/set-domain.mjs` | Trägt die Domain ein (canonical, og:image, Sitemap, robots.txt) |
| `_headers` | Sicherheits- und Cache-Header für Netlify |
| `serve.py` | Lokaler Vorschau-Server (Port 8815, ohne Cache) |

## Lokal ansehen

```bash
python serve.py 8815
```

Dann `http://localhost:8815` öffnen.

## Anpassen

- **Name / Marke:** „Tion Maul · Webdesign“ steht im Header, Footer, `<title>` und im JSON-LD von `index.html` sowie in den Rechtsseiten.
- **Startangebot (100 % Rabatt auf die klassische Homepage, 50 % auf alle anderen Leistungen, ausgenommen Hosting im Abo und Flyer & Druck):** Texte stehen in `index.html` an mehreren Stellen (Banner `.offer-banner` und Sticker `.offer-sticker` im Hero, Karte `#startangebot` mit `.offer-tiers` über den Leistungen, Zeile `.form-offer` im Formular, FAQ „Was kostet eine Website?“) und in `assets/main.js` (`OFFER_FULL`, `OFFER_EXCLUDED`, Zeile in der E-Mail-Vorlage). Zum Ändern oder Beenden überall suchen nach „Startangebot“.
- **Referenz hinzufügen:** In `index.html` einen `<article class="case">` im Abschnitt „Referenzen“ kopieren, Bild nach `assets/img/` legen.
- **Neues Vorschaubild:** Screenshot mit 1440 × 900 aufnehmen, auf 1200 × 750 skalieren, als WebP speichern.
- **Domain:** Sobald sie feststeht, einmal ausführen (Node.js genügt):

  ```bash
  node tools/set-domain.mjs https://deine-domain.de
  ```

  Das ergänzt in `index.html` canonical, `og:url`, `og:image`, Twitter-Karte und WebSite-Daten, legt `sitemap.xml` an und trägt die Sitemap in `robots.txt` ein. Das Skript darf beliebig oft laufen. Ohne Domain bleiben diese Tags weg, denn Link-Vorschaubilder brauchen eine absolute Adresse.
- **Link-Vorschaubild ändern:** `tools/og-image.html` bearbeiten, den Vorschau-Server starten (`python serve.py 8815`) und mit Edge oder Chrome rendern:

  ```bash
  msedge --headless=new --window-size=1200,630 --force-device-scale-factor=1 --timeout=6000 --screenshot=og.png http://localhost:8815/tools/og-image.html
  ```

  Das PNG danach als JPEG (Qualität ca. 88) nach `assets/og-image.jpg` speichern.

## Veröffentlichen

**Aktuell (seit 2026-11-24):** GitHub Pages aus dem öffentlichen Repo, Branch `main`, Ordner `/` → https://maultion-commits.github.io/tion-maul-website/ . Jeder Push nach `main` baut die Seite neu. `404.html` nutzt `<base href="/tion-maul-website/">`; bei einer eigenen Domain (Wurzel) diese Zeile entfernen und `node tools/set-domain.mjs https://<domain>` ausführen. Die Datei `_headers` gilt nur bei Netlify.

### Alternative: Netlify (wie bei den anderen Projekten)

```bash
npx --yes netlify-cli sites:create --name <subdomain> --disable-linking
npx --yes netlify-cli deploy --prod --dir . --site <Project-ID>
```
