# Spindle

**Das tägliche Musik-Quiz ohne Ton.** 8 Tracks, ca. 3 Minuten. Jeden Tag neu – und für alle gleich.

## Spielprinzip

Jede Runde ist eine „Platte“ mit Seite A und B. Die Reihenfolge der Runden und die Fragen werden pro Tag
aus einem festen Seed gezogen (Zeitzone Europe/Berlin), sodass alle Spieler am selben Tag dasselbe Quiz bekommen.

| Runde | Aufgabe | Punkte |
|---|---|---|
| Which is older? | Welcher von zwei Songs ist älter? | 60–100 (je schneller, desto mehr) |
| Emoji Song | Song aus Emojis erraten | 60–100 |
| Fill the Gap | Titel vervollständigen | 60–100 |
| Cover Colours | Album anhand der Cover-Farbpalette erkennen | 60–100 |
| Timeline | 4 Songs chronologisch sortieren | 25 pro richtiger Position |
| Artist Profile | Künstler mit möglichst wenigen Hinweisen erraten | 100 − 20 pro Zusatzhinweis |
| Duet Partner | Duettpartner ergänzen | 60–100 |
| **Finale: Rarest Answer** | Freitext – je seltener die richtige Antwort, desto mehr | 30 / 60 / 100 |

Maximal 800 Punkte. Ein Klick auf die Schallplatte führt jederzeit zurück ins Hauptmenü
(ein begonnenes Quiz kann fortgesetzt werden). Am Ende gibt es ein teilbares Emoji-Raster (🟩🟨🟧⬛🌟) und eine Tages-Serie (Streak),
die lokal im Browser gespeichert wird.

## Lokal starten

Keine Abhängigkeiten, kein Build-Schritt – reines HTML/CSS/JS.

```bash
npm start          # startet einen lokalen Server auf http://localhost:8000
# oder einfach index.html im Browser öffnen
```

## Tests

```bash
npm test           # Node ≥ 18, nutzt den eingebauten Test-Runner
```

## Projektstruktur

```
index.html          Einstiegsseite
css/style.css       Pixel-Look (Hell-/Dunkelmodus über light-dark())
QUESTIONS.md        Regeln für neue Fragen
js/data.js          Fragenpool und Rundennamen
js/logic.js         Reine Spiellogik: Tages-Seed, Quiz-Aufbau, Punkte, Streak (ohne DOM, testbar)
js/game.js          UI: Bildschirme, Timer, Eingaben
tests/              Unit-Tests für logic.js
.github/workflows/  Tests + Deployment auf GitHub Pages
```

## Neue Fragen

Fragen stehen in `js/data.js`. Einmal pro Woche fügt eine automatische Aufgabe neue Fragen hinzu –
die Regeln dafür stehen in [`QUESTIONS.md`](QUESTIONS.md). `tests/data.test.js` prüft jede Frage auf das
richtige Format, damit eine fehlerhafte Frage nie online geht.

## Deployment

Bei jedem Push auf `main` laufen die Tests und die Seite wird auf GitHub Pages veröffentlicht.
Einmalig nötig: im Repo unter **Settings → Pages → Source** „GitHub Actions“ auswählen.

## Status

Prototyp: Fragen und Seltenheitsstufen sind Beispieldaten und noch nicht aus echten Spielerantworten abgeleitet.
