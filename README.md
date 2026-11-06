# MS EMotion Cars – Astro Website-Prototyp

Ein funktionsfähiger, statischer Astro-Prototyp für einen exklusiven Automotive-Showroom.

## Starten

Voraussetzung: Node.js 20.3+ (empfohlen aktuelle LTS) und npm.

```bash
npm install
npm run dev
```

Die angezeigte lokale Adresse im Browser öffnen (meist http://localhost:4321).

## Produktions-Build

```bash
npm run build
npm run preview
```

Der Ordner `dist/` enthält die statischen Dateien. Für GitHub Pages muss die GitHub-Pages-Konfiguration für Repository-Pfad/Domain ergänzt werden. Bei einem Projekt-Repository z.B. `site` und `base` in `astro.config.mjs` konfigurieren. Eine GitHub Actions Workflow-Datei sollte Astro bauen und `dist/` veröffentlichen. Nicht einfach die Astro-Quelldateien als Pages-Website verwenden.

## Inhalte pflegen

- Fahrzeug-Demodaten: `src/data/cars.js`
- Fahrzeugbilder: `public/images/`
- Seiten: `src/pages/`
- Wiederverwendbare Komponenten: `src/components/`
- Globale Styles: `src/styles/global.css`

## WICHTIG – vor Livegang

- Sämtliche Fahrzeuge, Preise und Angaben sind **fiktive Demodaten**.
- Die SVGs sind **illustrative Platzhalter**, keine realen Fahrzeugfotos.
- Das Logo ist vorläufig und rein typografisch.
- Formulare **senden keine Daten**. Sicheren Versand mit Spam-Schutz und Datenschutzhinweisen integrieren.
- Impressum und Datenschutz sind nur Platzhalter und müssen rechtlich geprüft werden.
- Echte Kontaktdaten, Unternehmensinformationen, Fotos und Bildrechte ergänzen.
- `site` in `astro.config.mjs` auf endgültige Domain ändern.
- Keine erfundenen Referenzen, Bewertungen oder Qualitätsversprechen veröffentlichen.
- Optional später: Headless CMS oder Git-basiertes CMS für Fahrzeuge und Seiteninhalte.
