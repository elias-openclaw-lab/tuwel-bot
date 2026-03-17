// ==UserScript==
// @name       TUwel Quick Registration Script
// @namespace  http://tuwel.tuwien.ac.at/
// @version    1.0.0
// @description  Script to help you to get into the group you want on TUwel. Opens automatically the right panel, registers automatically and confirms your registration automatically. If you don't want the script to do everything automatically, the focus is already set on the right button, so you only need to confirm. There is also an option available to auto refresh the page, if the registration button is not available yet.
// @match      https://tuwel.tuwien.ac.at/*
// @copyright  2026, MIT License
// @require    https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant      none
// ==/UserScript==

/*
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function TUwelQuickRegistrationClass() {
    var self = this;

    ///////////////////////////////////////////////////////////////////////
    // Configuration - EDIT THESE VALUES
    //

    var options = {
        // global option to enable or disable the script [true,false]
        scriptEnabled: true,

        // name of the group you want to join [String]
        // Example: "Gruppe A", "Team 1", "Montag 14:00"
        nameOfGroup: "Gruppe A",

        // checks if you are at the correct course page [true,false]
        courseCheckEnabled: true,

        // only if the course name matches, the script is enabled [String]
        // Use part of the course name that uniquely identifies it
        courseName: "Einführung in die Programmierung",

        // automatically opens the detail panel of a group [true,false]
        openPanel: true,

        // automatically presses the register button if it is available [true,false]
        autoRegister: true,

        // automatically presses the confirm button for your registration [true,false]
        autoConfirm: true,

        // continuously refresh the page until the script can register you [true,false]
        autoRefresh: true,

        // refresh interval in milliseconds [Integer]
        refreshIntervalMs: 2000,

        // let the script start at a specific time [true,false]
        startAtSpecificTime: false,

        // define the specific time the script should start [Date]
        // new Date(year, month, day, hours, minutes, seconds, milliseconds)
        // note: months start with 0 (January = 0)
        specificStartTime: new Date(2026, 3 - 1, 17, 10, 0, 0, 0),

        // if a specific time is defined, the script will refresh some ms sooner to adjust a delay [Integer]
        delayAdjustmentInMs: 300,

        // show log output of the script on screen [true,false]
        showLog: true
    };

    //
    // End of configuration
    ///////////////////////////////////////////////////////////////////////


    self.init = function () {
        self.tuwelQuickRegistration();
    };

    self.tuwelQuickRegistration = function () {
        if (!options.scriptEnabled) {
            self.pageLog("TUwel Quick Registration Script disabled");
            return;
        }

        self.pageLog("TUwel Quick Registration Script enabled");
        self.pageLog("Target Group: " + options.nameOfGroup);

        // Check if we're on a grouptool page
        if (!self.isGroupToolPage()) {
            self.pageLog("Not a grouptool page - script inactive");
            return;
        }

        // Check course name if enabled
        if (options.courseCheckEnabled && !self.doCourseCheck()) {
            return;
        }

        // Check if group exists
        var groupRow = self.findGroupRow(options.nameOfGroup);
        if (groupRow === null) {
            self.pageOut('Group not found: ' + options.nameOfGroup);
            if (options.autoRefresh) {
                self.scheduleRefresh();
            }
            return;
        }

        self.highlight(groupRow);
        self.pageLog("Found group: " + options.nameOfGroup);

        // Handle timer if specific start time is set
        if (options.startAtSpecificTime) {
            self.pageLog("Script starts at: " + self.getFormattedDate(options.specificStartTime));
            self.startTimer(options.specificStartTime.getTime() - options.delayAdjustmentInMs);
        } else {
            self.processGroupRegistration(groupRow);
        }
    };

    self.isGroupToolPage = function () {
        // Check if URL contains grouptool
        return window.location.href.includes('grouptool');
    };

    self.doCourseCheck = function () {
        var pageTitle = document.title;
        var courseHeader = $('.course-header h1').text() || $('h1').first().text() || '';
        var pageContent = $('body').text();

        if (pageTitle.includes(options.courseName) ||
            courseHeader.includes(options.courseName) ||
            pageContent.includes(options.courseName)) {
            self.pageLog("Course check passed: " + options.courseName);
            return true;
        }

        self.pageOut('Wrong course error: expected "' + options.courseName + '"');
        return false;
    };

    self.findGroupRow = function (groupName) {
        // TUwel grouptool uses tables with group information
        // Look for rows containing the group name
        var groupRows = $('table.generaltable tbody tr, .grouptool-table tbody tr, tr');

        var foundRow = null;
        groupRows.each(function() {
            var rowText = $(this).text();
            var rowHtml = $(this).html();

            // Check if this row contains our group name
            if (rowText.includes(groupName)) {
                foundRow = $(this);
                return false; // break each loop
            }
        });

        return foundRow;
    };

    self.processGroupRegistration = function (groupRow) {
        // Check if already registered (look for "Abmelden" or similar)
        var unregisterBtn = groupRow.find('input[value*="Abmelden"], button:contains("Abmelden"), a:contains("Abmelden")');
        if (unregisterBtn.length > 0) {
            self.pageOut('✓ Already registered in: ' + options.nameOfGroup);
            return;
        }

        // Look for register button
        var registerBtn = groupRow.find('input[value*="Anmelden"], button:contains("Anmelden"), a:contains("Anmelden"), .register-button, [name*="register"], [id*="register"]');

        // Also check for disabled/locked buttons
        if (registerBtn.length === 0) {
            registerBtn = groupRow.find('input[value*="regist"], button:contains("regist"), a:contains("regist"), .btn-primary, .btn').filter(function() {
                var text = $(this).val() || $(this).text() || '';
                return text.toLowerCase().includes('anmelden') || text.toLowerCase().includes('register');
            });
        }

        self.log('Register button found: ' + registerBtn.length);

        if (registerBtn.length > 0 && !registerBtn.prop('disabled')) {
            self.highlight(registerBtn);
            registerBtn.focus();

            if (options.autoRegister) {
                self.pageLog('Clicking register button...');
                registerBtn[0].click();

                // Wait for confirmation dialog/page
                setTimeout(function() {
                    self.handleConfirmation();
                }, 500);
            } else {
                self.pageOut('Register button ready - click to register');
            }
        } else {
            // Check if registration is full or not yet open
            var statusText = groupRow.text();
            if (statusText.includes('voll') || statusText.includes('full') || statusText.includes('belegt')) {
                self.pageOut('Group is full - waiting...');
            } else if (statusText.includes('geschlossen') || statusText.includes('closed')) {
                self.pageOut('Registration not yet open - waiting...');
            } else {
                self.pageOut('No register button found - waiting...');
            }

            if (options.autoRefresh) {
                self.scheduleRefresh();
            }
        }
    };

    self.handleConfirmation = function () {
        // Look for confirmation button on the page
        var confirmBtn = $('input[value*="Bestätigen"], button:contains("Bestätigen"), input[value*="Confirm"], button:contains("Confirm"), #id_submitbutton, .btn-primary');

        if (confirmBtn.length > 0) {
            self.highlight(confirmBtn);
            confirmBtn.focus();

            if (options.autoConfirm) {
                self.pageLog('Confirming registration...');
                confirmBtn[0].click();
            } else {
                self.pageOut('Please confirm registration');
            }
        }
    };

    self.startTimer = function (startTime) {
        var offset = startTime - new Date().getTime();
        if (offset > 0) {
            self.startRefreshTimer(startTime);
        } else {
            self.analysePage();
        }
    };

    self.startRefreshTimer = function (startTime) {
        self.printTimeToStart(startTime);

        var maxMillis = 2147483647;
        var offset = startTime - new Date().getTime();

        // Prevent overflow
        if (offset > maxMillis) {
            offset = maxMillis;
        }

        setTimeout(function() {
            location.reload();
        }, offset);
    };

    self.printTimeToStart = function (startTime) {
        var offset = (startTime - new Date().getTime()) / 1000;
        var out = "Starting in: ";
        var minutes = offset / 60;
        if (minutes > 1) {
            var hours = minutes / 60;
            if (hours > 1) {
                out += Math.floor(hours) + " hours, ";
                minutes = minutes % 60;
            }
            out += Math.floor(minutes) + " minutes and ";
        }
        var seconds = offset % 60;
        out += Math.floor(seconds) + " seconds";
        self.log(out);
        self.pageCountdown(out);

        setTimeout(function() {
            self.printTimeToStart(startTime);
        }, 1000);
    };

    self.scheduleRefresh = function () {
        self.pageLog('Refreshing in ' + (options.refreshIntervalMs / 1000) + ' seconds...');
        setTimeout(function() {
            location.reload();
        }, options.refreshIntervalMs);
    };

    self.highlight = function (element) {
        element.css({
            "background-color": "lightgreen",
            "border": "3px solid green",
            "box-shadow": "0 0 10px rgba(0,255,0,0.5)"
        });
    };

    self.pageOut = function (text) {
        var out = self.getOutputField();
        out.text(text);
        self.log(text);
    };

    self.pageCountdown = function (text) {
        var out = self.getCountdownField();
        out.text(text);
    };

    self.pageLog = function (text) {
        self.appendToLogField(text);
        self.log(text);
    };

    self.getOutputField = function () {
        var outputField = $('#TUQRScriptOutput');
        if (outputField.length === 0) {
            self.injectOutputField();
            outputField = self.getOutputField();
        }
        return outputField;
    };

    self.getCountdownField = function () {
        var countdownField = $('#TUQRScriptCountdown');
        if (countdownField.length === 0) {
            self.injectCountdownField();
            countdownField = self.getCountdownField();
        }
        return countdownField;
    };

    self.getLogField = function () {
        var logField = $('#TUQRScriptLog');
        if (logField.length === 0) {
            self.injectLogField();
            logField = self.getLogField();
            if (options.showLog) {
                logField.show();
            } else {
                logField.hide();
            }
        }
        return logField;
    };

    self.injectOutputField = function () {
        var target = $('#region-main, .course-content, #content, body').first();
        target.prepend('<div id="TUQRScriptOutput" style="color: red; font-weight: bold; font-size: 16pt; padding: 10px; margin: 10px 0; background: #fff; border-radius: 5px;"></div>');
    };

    self.injectCountdownField = function () {
        var target = $('#region-main, .course-content, #content, body').first();
        target.prepend('<div id="TUQRScriptCountdown" style="color: blue; font-weight: bold; font-size: 14pt; padding: 8px; margin: 10px 0; background: #e3f2fd; border-radius: 5px;"></div>');
    };

    self.injectLogField = function () {
        var target = $('#region-main, .course-content, #content, body').first();
        target.prepend('<div id="TUQRScriptLog" style="color: black; background-color: #FFFCD9; font-size: 11pt; padding: 10px; margin: 10px 0; border-radius: 5px; max-height: 200px; overflow-y: auto;"><b>📋 TUwel Quick Registration Log:</b></div>');
    };

    self.appendToLogField = function (text) {
        var log = self.getLogField();
        var timestamp = new Date().toLocaleTimeString();
        log.append("<br/>[" + timestamp + "] " + text);
    };

    self.getFormattedDate = function (date) {
        return "" + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " +
               self.pad(date.getHours()) + ":" + self.pad(date.getMinutes()) + ":" + self.pad(date.getSeconds());
    };

    self.pad = function (num) {
        return num < 10 ? '0' + num : num;
    };

    self.log = function (message) {
        console.log('[TUwelQR] ' + message);
    };

    // Initialize the script
    self.init();
})();
