# Neue Fragen hinzufügen – Anleitung

Diese Anleitung gilt für Menschen und für die automatische wöchentliche Aufgabe, die neue Fragen erzeugt.

## Ablauf

1. `js/data.js` lesen, damit keine Frage doppelt vorkommt.
2. **Pro Kategorie 2 neue Einträge** anhängen (`duel`, `emoji`, `gap`, `color`, `time`, `bio`, `duet`),
   und **1 neue Finalfrage** in `rare`. Das Format steht als Kommentar über jeder Liste.
3. `npm test` ausführen. Alle Tests müssen bestehen.
4. Fehler beheben, nicht die Tests ändern.
5. Nur `js/data.js` committen und auf einen Branch `questions/JJJJ-MM-TT` (oder `claude/...`) pushen.
   Der Workflow `.github/workflows/auto-merge-questions.yml` testet ihn, übernimmt ihn nach `main`
   und veröffentlicht die Seite neu. Ein Pull Request ist dafür nicht nötig. Ändert ein Branch noch
   andere Dateien, wird er nicht automatisch übernommen.

## Qualitätsregeln

- **Nur Fakten, bei denen du dir sicher bist.** Erscheinungsjahre = Jahr der ersten Single-/Album-Veröffentlichung.
  Bei Zweifeln die Frage weglassen statt raten.
- `duel`: Die beiden Jahre müssen sich unterscheiden (am besten um ≥ 1 Jahr, deutlich ist besser).
- `time`: 4 Songs aus deutlich unterschiedlichen Jahren (≥ 3 Jahre Abstand).
- `emoji`: Die Emojis sollen lösbar sein, falsche Antworten plausibel, aber eindeutig falsch.
- `color`: 3–8 Hex-Farben, die das Albumcover grob wiedergeben; nur sehr bekannte, markante Cover.
- `bio`: 4 Hinweise, vom schwersten zum leichtesten; der letzte ist ein bekannter Hit.
- `rare`: Antworten in Kleinbuchstaben, ohne Satzzeichen; `c` = Antworten, die fast jeder nennt,
  `m` = mittel, `r` = selten. Mindestens 3 Antworten pro Stufe, besser 8+.
- Mischung aus Jahrzehnten (60er bis heute) und Ländern, inkl. deutscher Musik.
- Keine anstößigen Inhalte. Keine Songtexte zitieren (nur Titel).
- Texte im Spiel sind auf Englisch.
