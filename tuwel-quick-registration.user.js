// ==UserScript==
// @name         TUwel Quick Registration
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatische Gruppenanmeldung für TUwel
// @author       J.A.W.S.
// @match        https://tuwel.tuwien.ac.at/mod/grouptool/view.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================== KONFIGURATION ====================
    // Setze hier deine gewünschte Startzeit (Format: "HH:MM")
    // z.B. "08:00" für 8:00 Uhr
    // Oder leer lassen für sofortigen Start
    const START_TIME = "";

    // Gruppenname für die automatische Anmeldung (optional)
    // Leer lassen für erste verfügbare Gruppe
    const TARGET_GROUP = "";

    // Auto-Refresh Intervall in Millisekunden (z.B. 2000 = 2 Sekunden)
    const REFRESH_INTERVAL = 2000;

    // Automatisch bestätigen? (true/false)
    const AUTO_CONFIRM = true;

    // ==================== SCRIPT ====================

    console.log("[TUwel Bot] Script geladen");

    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ":" + 
               now.getMinutes().toString().padStart(2, '0');
    }

    function shouldStart() {
        if (!START_TIME) return true;
        return getCurrentTime() >= START_TIME;
    }

    function findRegistrationButtons() {
        // Suche nach "Eintragen" Buttons
        const buttons = document.querySelectorAll('input[type="submit"], button');
        const regButtons = [];

        buttons.forEach(btn => {
            const text = btn.value || btn.textContent || "";
            if (text.toLowerCase().includes('eintragen') || 
                text.toLowerCase().includes('anmelden') ||
                text.toLowerCase().includes('register')) {
                regButtons.push(btn);
            }
        });

        return regButtons;
    }

    function findGroupRows() {
        // Suche nach Gruppenzeilen in der Tabelle
        const rows = document.querySelectorAll('table tbody tr');
        const groups = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const groupName = cells[0]?.textContent?.trim() || "";
                const status = row.textContent.toLowerCase();

                groups.push({
                    row: row,
                    name: groupName,
                    hasFreeSlots: !status.includes('voll') && !status.includes('full'),
                    button: row.querySelector('input[type="submit"], button')
                });
            }
        });

        return groups;
    }

    function clickRegister() {
        console.log("[TUwel Bot] Suche nach Registrierungs-Buttons...");

        const groups = findGroupRows();

        if (TARGET_GROUP) {
            // Suche spezifische Gruppe
            const target = groups.find(g => 
                g.name.toLowerCase().includes(TARGET_GROUP.toLowerCase()) && 
                g.hasFreeSlots && 
                g.button
            );

            if (target) {
                console.log("[TUwel Bot] Gefunden: " + target.name);
                target.button.click();
                return true;
            }
        } else {
            // Nimm erste verfügbare Gruppe
            const available = groups.find(g => g.hasFreeSlots && g.button);
            if (available) {
                console.log("[TUwel Bot] Registriere in: " + available.name);
                available.button.click();
                return true;
            }
        }

        return false;
    }

    function handleConfirmation() {
        // Suche nach Bestätigungs-Button
        const confirmButtons = document.querySelectorAll('input[type="submit"], button');

        for (let btn of confirmButtons) {
            const text = (btn.value || btn.textContent || "").toLowerCase();
            if (text.includes('ja') || text.includes('yes') || 
                text.includes('bestätigen') || text.includes('confirm')) {
                console.log("[TUwel Bot] Bestätige...");
                btn.click();
                return true;
            }
        }

        return false;
    }

    function run() {
        console.log("[TUwel Bot] Prüfe Registrierung...");

        // Prüfe ob wir auf einer Bestätigungsseite sind
        if (handleConfirmation()) {
            console.log("[TUwel Bot] Bestätigung durchgeführt!");
            return;
        }

        // Versuche zu registrieren
        if (clickRegister()) {
            console.log("[TUwel Bot] Registrierung gestartet!");
            return;
        }

        // Keine freien Plätze gefunden - refresh
        console.log("[TUwel Bot] Keine freien Plätze, refreshe in " + REFRESH_INTERVAL + "ms...");
        setTimeout(() => {
            location.reload();
        }, REFRESH_INTERVAL);
    }

    function start() {
        if (!shouldStart()) {
            console.log("[TUwel Bot] Warte auf Startzeit: " + START_TIME);
            console.log("[TUwel Bot] Aktuelle Zeit: " + getCurrentTime());

            // Prüfe jede Sekunde ob Startzeit erreicht
            const checkInterval = setInterval(() => {
                if (shouldStart()) {
                    clearInterval(checkInterval);
                    run();
                }
            }, 1000);
            return;
        }

        run();
    }

    // Starte Script wenn Seite geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

})();
