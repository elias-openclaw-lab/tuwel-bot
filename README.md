# TUwel Bot

Ein Userscript zur automatischen Gruppenanmeldung auf TUwel (TU Wien E-Learning Plattform).

## Beschreibung

Dieses Script hilft dir, automatisch in die gewünschte Gruppe auf TUwel zu gelangen. Es öffnet automatisch die richtige Gruppe, klickt den Anmelde-Button und bestätigt die Registrierung - alles im Hintergrund, während du entspannt zuschaust.

**Inspiriert von:** [TISS Quick Registration Script](https://github.com/mangei/tissquickregistrationscript) von Manuel Geier

## Features

- ✅ Automatische Erkennung der Zielgruppe
- ✅ Automatisches Klicken des "Anmelden"-Buttons
- ✅ Automatische Bestätigung der Registrierung
- ✅ Auto-Refresh wenn die Anmeldung noch nicht geöffnet ist
- ✅ Timer-basierte Aktivierung zu einem bestimmten Zeitpunkt
- ✅ Visuelle Highlights für gefundene Elemente
- ✅ Live-Log auf der Seite

## Installation

### Voraussetzungen

- **Chrome**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) Extension
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) oder [Greasemonkey](https://addons.mozilla.org/de/firefox/addon/greasemonkey/)

### Schritte

1. Installiere die Userscript-Manager Extension
2. Öffne das Script: [tuwel-quick-registration.user.js](./tuwel-quick-registration.user.js)
3. Klicke "Raw" auf GitHub
4. Der Script-Manager sollte automatisch erkennen und zur Installation auffordern

## Konfiguration

Bearbeite die `options` im Script:

```javascript
var options = {
    // Aktiviere/deaktiviere das Script
    scriptEnabled: true,

    // Name der Gruppe, in die du willst
    nameOfGroup: "Gruppe A",

    // Prüfe ob wir auf der richtigen LV-Seite sind
    courseCheckEnabled: true,
    courseName: "Einführung in die Programmierung",

    // Automatische Aktionen
    openPanel: true,        // Panel öffnen
    autoRegister: true,     // Anmelden-Button klicken
    autoConfirm: true,      // Bestätigen
    autoRefresh: true,      // Seite neu laden wenn nötig

    // Timer für exakten Startzeitpunkt
    startAtSpecificTime: false,
    specificStartTime: new Date(2026, 3 - 1, 17, 10, 0, 0, 0),

    // Zeige Log auf der Seite
    showLog: true
};
```

## Verwendung

1. Gehe zur TUwel-Grouptool-Seite der LV
2. Passe die Konfiguration im Script an
3. Aktiviere das Script im Userscript-Manager
4. Lade die Seite neu
5. Lehn dich zurück und lass das Script arbeiten!

## Wichtig

- ⚠️ **Nutzung auf eigenes Risiko!**
- Das Script ist nicht offiziell von der TU Wien
- Teste vorher mit einer unwichtigen LV
- Deaktiviere das Script nach der Anmeldung wieder

## Lizenz

MIT License - siehe [LICENSE](./LICENSE)

## Disclaimer

By using this script, you acknowledge that the author bears no responsibility for any consequences. Use at your own risk.
