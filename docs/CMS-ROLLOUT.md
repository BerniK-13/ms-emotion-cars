# MS EMotion Cars — CMS-Einführung ohne Layoutänderungen

## Schutz der bestehenden Website
- Astro 5, GitHub Pages, Deploy-Workflow, Design und alle bestehenden Seiten bleiben in Phase 1 unverändert.
- Originale Fahrzeugfotos werden weder konvertiert noch umbenannt oder gelöscht.
- Aktuelle Datenquellen `src/data/cars.js` und `src/data/vehicleSpecs.js` bleiben bis zu einem geprüften Wechsel allein maßgeblich.
- `cms/config.yml` ist eine **Staging-Konfiguration** und wird nicht unter `/admin` veröffentlicht.
- Der OAuth-Platzhalter darf niemals als fertige Anmeldung betrachtet werden.

## Phase 1: Bestand sichern und Daten exportieren
1. `node scripts/export-vehicle-cms.mjs` exportiert Fahrzeugdatensätze nach `content/vehicles/*.json`.
2. Der Export ist absichtlich einseitig und überschreibt keine bereits existierenden CMS-Dateien.
3. Bilderpfade, Reihenfolge und Fahrzeug-Slugs mit dem Livebestand vergleichen.
4. Bis zur Freigabe bleibt der Website-Output identisch.

## Phase 2: CMS-Integration (separater, überprüfbarer PR)
1. Sicheren GitHub-OAuth-Dienst konfigurieren, Tokens und Secrets **nie** in Git committen.
2. Decap-Admin erst danach unter `/admin/` aktivieren; bei GitHub Pages Base-Pfad `/ms-emotion-cars/` berücksichtigen.
3. Ein Testfahrzeug als Entwurf anlegen, Fotos hochladen, Veröffentlichung prüfen.
4. Erst nach erfolgreichem Build und visueller Kontrolle Leseschicht von JS auf CMS-JSON umstellen.
5. Statuslogik: `draft` = unsichtbar, `in_stock` = Bestand, `sold` = Referenzen **ohne Preis**. Ein Statuswechsel darf keine URL oder Galerie verlieren.
6. Vor dem Merge Screenshots der Startseite, In Stock, Fahrzeugdetails, Referenzen, MS Collection und Kontakt mit Livebestand vergleichen.

## Wichtige offene Punkte
- OAuth-Hosting/Provider und sichere Domain festlegen.
- Bei externem OAuth keine GitHub-Personal-Access-Tokens in Frontend-Code verwenden.
- Decap-Bilderpfade müssen für Astro/GitHub-Pages-Base normalisiert werden; vorhandene URL-encodierte Dateinamen nicht blind umschreiben.
- Für Sold-Referenzen nur bestätigte tatsächliche Verkäufe übernehmen.
- Datenformat und Build-Skripte vor dem Live-Umschalten automatisiert validieren.
