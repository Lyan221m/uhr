// Stoppuhr Funktionalität
let stopwatchInterval;
let stopwatchTime = 0;
let isStopwatchRunning = false;

// Timer Funktionalität
let timerInterval;
let timerTime = 0;
let isTimerRunning = false;
let initialTimerTime = 0; // Speichert die ursprüngliche Zeit des Timers
let isBlinking = false; // Für das rote Blinken vor Ablauf
let blinkInterval; // Interval für das Blinken

// Wecker Funktionalität
let alarms = [];
let activeAlarm = null;
let alarmCheckInterval;

// Einstellungen
let settings = {
    showPresets: true,
    blinkBeforeEnd: true,
    blinkSeconds: 10, // Sekunden vor Ende, bei denen das Blinken beginnt
    theme: 'light', // 'light' oder 'dark'
    customPresets: [] // Benutzerdefinierte Voreinstellungen
};

// Buttons und Displays
const startStopwatchButton = document.getElementById("startStopwatchButton");
const pauseStopwatchButton = document.getElementById("pauseStopwatchButton");
const resetStopwatchButton = document.getElementById("resetStopwatchButton");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");

const startTimerButton = document.getElementById("startTimerButton");
const pauseTimerButton = document.getElementById("pauseTimerButton");
const resetTimerButton = document.getElementById("resetTimerButton");
const timerDisplay = document.getElementById("timerDisplay");
const timerProgress = document.getElementById("timerProgress");
const presetButtonsContainer = document.querySelector('.preset-buttons');

const themeToggleButton = document.getElementById('themeToggleButton');

const timerSound = document.getElementById('timerSound');
const alarmSound = document.getElementById('alarmSound');
const muteButton = document.getElementById('muteButton');

// Wecker-Elemente
const currentTimeDisplay = document.getElementById("currentTime");
const alarmTimeInput = document.getElementById("alarmTime");
const setAlarmButton = document.getElementById("setAlarmButton");
const clearAlarmsButton = document.getElementById("clearAlarmsButton");
const alarmsList = document.getElementById("alarmsList");

// Timer-Voreinstellungen
const presetButtons = document.querySelectorAll('.preset-button');

let isMuted = false;

// Funktion zum Laden der Einstellungen
function loadSettings() {
    const savedSettings = localStorage.getItem('timer_settings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    // Anwenden der gespeicherten Einstellungen
    applySettings();
}

// Funktion zum Speichern der Einstellungen
function saveSettings() {
    localStorage.setItem('timer_settings', JSON.stringify(settings));
}

// Funktion zum Anwenden der Einstellungen
function applySettings() {
    // Theme anwenden
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleButton) {
            themeToggleButton.textContent = '⬜Wechsel zu Light Mode';
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggleButton) {
            themeToggleButton.textContent = '⬛Wechsel zu Dark Mode';
        }
    }
    
    // Voreinstellungen anzeigen/verstecken
    if (presetButtonsContainer) {
        presetButtonsContainer.style.display = settings.showPresets ? 'flex' : 'none';
    }
    
    // Benutzerdefinierte Voreinstellungen aktualisieren
    updateCustomPresets();
}

// Funktion zum Aktualisieren der benutzerdefinierten Voreinstellungen
function updateCustomPresets() {
    if (!presetButtonsContainer) return;
    
    // Entfernen der benutzerdefinierten Voreinstellungen
    const customButtons = presetButtonsContainer.querySelectorAll('.custom-preset');
    customButtons.forEach(button => button.remove());
    
    // Hinzufügen der benutzerdefinierten Voreinstellungen
    settings.customPresets.forEach(preset => {
        const button = document.createElement('button');
        button.className = 'preset-button custom-preset';
        button.setAttribute('data-time', preset.seconds);
        button.textContent = preset.name;
        
        button.addEventListener('click', function() {
            const seconds = parseInt(this.getAttribute('data-time'));
            setTimer(seconds);
        });
        
        presetButtonsContainer.appendChild(button);
    });
}

// Funktion zum Hinzufügen einer benutzerdefinierten Voreinstellung
function addCustomPreset(name, seconds) {
    settings.customPresets.push({ name, seconds });
    saveSettings();
    updateCustomPresets();
}

// Funktion zum Entfernen einer benutzerdefinierten Voreinstellung
function removeCustomPreset(index) {
    settings.customPresets.splice(index, 1);
    saveSettings();
    updateCustomPresets();
}

// Funktion zum Formatieren der Zeit (HH:MM:SS)
function formatTime(timeInMilliseconds) {
    let hours = Math.floor(timeInMilliseconds / 3600000);
    let minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
    let seconds = Math.floor((timeInMilliseconds % 60000) / 1000);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
}

// Stoppuhr aktualisieren
function updateStopwatch() {
    stopwatchTime += 1000;
    if (stopwatchDisplay) {
        stopwatchDisplay.textContent = formatTime(stopwatchTime);
    }
}

// Timer aktualisieren
function updateTimer() {
    if (timerTime > 0) {
        timerTime -= 1000;
        
        // Überprüfen, ob das Blinken beginnen sollte
        if (settings.blinkBeforeEnd && timerTime <= settings.blinkSeconds * 1000 && timerTime > 0) {
            startBlinking();
        }
        
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timerTime);
        }
        
        // Fortschrittsleiste aktualisieren
        if (timerProgress && initialTimerTime > 0) {
            const progressPercentage = 100 - ((timerTime / initialTimerTime) * 100);
            timerProgress.style.width = `${progressPercentage}%`;
        }
    } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (startTimerButton) startTimerButton.disabled = false;
        if (pauseTimerButton) pauseTimerButton.disabled = true;
        
        // Blinken stoppen und Fortschrittsleiste auf 100% setzen
        stopBlinking();
        if (timerProgress) {
            timerProgress.style.width = '100%';
        }
        
        if (timerSound && !isMuted) timerSound.play();
        alert("Timer abgelaufen!");
    }
}

// Funktion zum Starten des Blinkeffekts
function startBlinking() {
    if (!isBlinking && settings.blinkBeforeEnd) {
        isBlinking = true;
        blinkInterval = setInterval(() => {
            const timerContainer = document.querySelector('.timer-container');
            if (timerContainer) {
                timerContainer.classList.toggle('blink');
            }
        }, 500); // Alle 500ms umschalten
    }
}

// Funktion zum Stoppen des Blinkeffekts
function stopBlinking() {
    if (isBlinking) {
        clearInterval(blinkInterval);
        isBlinking = false;
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.classList.remove('blink');
        }
    }
}

// Funktion zum Setzen des Timers auf einen bestimmten Wert in Sekunden
function setTimer(seconds) {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
    }
    
    // Blinken stoppen, falls aktiv
    stopBlinking();
    
    timerTime = seconds * 1000;
    initialTimerTime = timerTime;
    timerDisplay.textContent = formatTime(timerTime);
    
    if (timerProgress) {
        timerProgress.style.width = '0%';
    }
    
    resetTimerButton.disabled = false;
}

// Event-Listener für Timer-Voreinstellungen
if (presetButtons) {
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const seconds = parseInt(this.getAttribute('data-time'));
            setTimer(seconds);
        });
    });
}

// Stoppuhr Funktionen
if (startStopwatchButton) {
    startStopwatchButton.addEventListener("click", function() {
        if (!isStopwatchRunning) {
            stopwatchInterval = setInterval(updateStopwatch, 1000);
            isStopwatchRunning = true;
            startStopwatchButton.disabled = true;
            pauseStopwatchButton.disabled = false;
            resetStopwatchButton.disabled = false;
        }
    });
}

if (pauseStopwatchButton) {
    pauseStopwatchButton.addEventListener("click", function() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        startStopwatchButton.disabled = false;
        pauseStopwatchButton.disabled = true;
    });
}

if (resetStopwatchButton) {
    resetStopwatchButton.addEventListener("click", function() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchTime = 0;
        stopwatchDisplay.textContent = formatTime(stopwatchTime);
        startStopwatchButton.disabled = false;
        pauseStopwatchButton.disabled = true;
        resetStopwatchButton.disabled = true;
    });
}

// Timer Display bearbeitbar machen
if (timerDisplay) {
    // Klickbar machen mit Hinweis
    timerDisplay.style.cursor = 'pointer';
    timerDisplay.title = 'Klicken zum Bearbeiten';
    
    // Event Listener für direktes Bearbeiten
    timerDisplay.addEventListener("click", function() {
        // Nur erlauben, wenn der Timer nicht läuft
        if (isTimerRunning) {
            return;
        }
        
        // Vorherigen Inhalt speichern
        const previousContent = timerDisplay.textContent;
        
        // Text zum Bearbeiten freigeben
        timerDisplay.contentEditable = true;
        timerDisplay.focus();
        
        // Text auswählen für einfachere Bearbeitung
        document.execCommand('selectAll', false, null);
        
        // Event Listener für Enter-Taste
        const enterKeyHandler = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                timerDisplay.blur();
            }
        };
        
        // Event Listener für Verlassen des Feldes
        const blurHandler = function() {
            timerDisplay.contentEditable = false;
            timerDisplay.removeEventListener('keydown', enterKeyHandler);
            timerDisplay.removeEventListener('blur', blurHandler);
            
            // Eingabe verarbeiten
            const input = timerDisplay.textContent.trim();
            
            // Zeit-Format überprüfen mit RegEx (Format: HH:MM:SS oder MM:SS oder SS)
            const timePattern = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$|^(\d{1,2}):(\d{1,2})$|^(\d{1,2})$/;
            
            if (timePattern.test(input)) {
                let hours = 0, minutes = 0, seconds = 0;
                const parts = input.split(':');
                
                if (parts.length === 3) {
                    hours = parseInt(parts[0], 10);
                    minutes = parseInt(parts[1], 10);
                    seconds = parseInt(parts[2], 10);
                } else if (parts.length === 2) {
                    minutes = parseInt(parts[0], 10);
                    seconds = parseInt(parts[1], 10);
                } else {
                    seconds = parseInt(parts[0], 10);
                }
                
                // Überprüfen, ob die Werte im gültigen Bereich liegen
                if (hours >= 0 && minutes >= 0 && seconds >= 0 && 
                    minutes < 60 && seconds < 60) {
                    
                    timerTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
                    initialTimerTime = timerTime; // Speichern der Anfangszeit
                    timerDisplay.textContent = formatTime(timerTime);
                    resetTimerButton.disabled = false;
                    
                    // Zurücksetzen der Fortschrittsleiste auf 0%
                    if (timerProgress) {
                        timerProgress.style.width = '0%';
                    }
                } else {
                    // Ungültiger Zeitwert
                    timerDisplay.textContent = previousContent;
                    alert("Bitte geben Sie eine gültige Zeit ein. Minuten und Sekunden müssen zwischen 0 und 59 liegen.");
                }
            } else {
                // Ungültiges Format
                timerDisplay.textContent = previousContent;
                alert("Bitte geben Sie die Zeit im Format HH:MM:SS, MM:SS oder SS ein.");
            }
        };
        
        timerDisplay.addEventListener('keydown', enterKeyHandler);
        timerDisplay.addEventListener('blur', blurHandler);
    });
}

if (startTimerButton) {
    startTimerButton.addEventListener("click", function() {
        if (!isTimerRunning && timerTime > 0) {
            timerInterval = setInterval(updateTimer, 1000);
            isTimerRunning = true;
            startTimerButton.disabled = true;
            pauseTimerButton.disabled = false;
            resetTimerButton.disabled = false;
        }
    });
}

if (pauseTimerButton) {
    pauseTimerButton.addEventListener("click", function() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
        
        // Blinken stoppen, falls aktiv
        stopBlinking();
    });
}

if (resetTimerButton) {
    resetTimerButton.addEventListener("click", function() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerTime = 0;
        initialTimerTime = 0; // Zurücksetzen der Anfangszeit
        timerDisplay.textContent = formatTime(timerTime);
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
        resetTimerButton.disabled = true;
        
        // Blinken stoppen und Fortschrittsleiste zurücksetzen
        stopBlinking();
        if (timerProgress) {
            timerProgress.style.width = '0%';
        }
    });
}

// Mute-Funktionalität
if (muteButton) {
    muteButton.addEventListener('click', function() {
        isMuted = !isMuted;
        if (timerSound) timerSound.muted = isMuted;
        if (alarmSound) alarmSound.muted = isMuted;
        muteButton.textContent = isMuted ? '🔊 Ton an' : '🔕 Ton aus';
    });
}

// Live-Uhr Funktionalität
function updateLiveClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const liveClockElement = document.getElementById('liveClock');
    if (liveClockElement) {
        liveClockElement.textContent = timeString;
    }
    
    // Aktualisiere die Zeitanzeige auf der Wecker-Seite
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = `Aktuelle Zeit: ${timeString}`;
    }
    
    // Überprüfe aktive Wecker
    checkAlarms(hours, minutes, seconds);
}

// Wecker Funktionalität
function addAlarm(time) {
    const alarmId = Date.now(); // Eindeutige ID für den Wecker
    const alarm = {
        id: alarmId,
        time: time
    };
    
    alarms.push(alarm);
    saveAlarms(); // Wecker speichern
    updateAlarmList(); // Weckerliste aktualisieren
    
    return alarm;
}

function removeAlarm(id) {
    alarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms(); // Aktualisierte Liste speichern
    updateAlarmList(); // Weckerliste aktualisieren
}

function clearAllAlarms() {
    alarms = [];
    saveAlarms();
    updateAlarmList();
    
    // Aktiven Alarm stoppen
    stopAlarm();
}

function saveAlarms() {
    localStorage.setItem('wecker_alarms', JSON.stringify(alarms));
}

function loadAlarms() {
    const savedAlarms = localStorage.getItem('wecker_alarms');
    if (savedAlarms) {
        alarms = JSON.parse(savedAlarms);
    }
}

function updateAlarmList() {
    if (!alarmsList) return;
    
    // Liste leeren
    alarmsList.innerHTML = '';
    
    if (alarms.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'Keine aktiven Wecker';
        emptyItem.className = 'no-alarms';
        alarmsList.appendChild(emptyItem);
        return;
    }
    
    // Wecker sortieren nach Zeit
    alarms.sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
    
    // Wecker zur Liste hinzufügen
    alarms.forEach(alarm => {
        const alarmItem = document.createElement('li');
        alarmItem.className = 'alarm-item';
        
        const timeSpan = document.createElement('span');
        timeSpan.textContent = alarm.time;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.className = 'delete-alarm';
        deleteButton.addEventListener('click', () => removeAlarm(alarm.id));
        
        alarmItem.appendChild(timeSpan);
        alarmItem.appendChild(deleteButton);
        alarmsList.appendChild(alarmItem);
    });
}

function checkAlarms(hours, minutes, seconds) {
    // Nur prüfen, wenn Sekunden 0 sind, um Ressourcen zu sparen
    if (seconds !== '00') return;
    
    const currentTime = `${hours}:${minutes}`;
    
    // Überprüfen, ob ein Wecker für die aktuelle Zeit existiert
    const matchingAlarm = alarms.find(alarm => alarm.time === currentTime);
    
    if (matchingAlarm && !activeAlarm) {
        // Alarm auslösen
        triggerAlarm(matchingAlarm);
    }
}

function triggerAlarm(alarm) {
    activeAlarm = alarm;
    
    // Ton abspielen, wenn nicht stumm
    if (alarmSound && !isMuted) {
        alarmSound.play();
    }
    
    // Benachrichtigung anzeigen
    if (Notification.permission === "granted") {
        new Notification("Wecker", {
            body: `Es ist ${alarm.time} Uhr!`,
            icon: "assets/favicon3.ico"
        });
    }
    
    // Alert-Dialog anzeigen
    const confirmStop = confirm(`Wecker für ${alarm.time} Uhr!\nWecker beenden?`);
    if (confirmStop) {
        stopAlarm();
    }
}

function stopAlarm() {
    if (activeAlarm) {
        // Ton stoppen
        if (alarmSound) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        }
        
        activeAlarm = null;
    }
}

// Aktualisiere die Live-Uhr jede Sekunde
setInterval(updateLiveClock, 100);

// Initialisiere die Live-Uhr sofort
updateLiveClock();

// Theme toggle functionality
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        settings.theme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        saveSettings();
        applySettings();
    });
}

// Einstellungs-Schaltfläche erstellen und einfügen
function createSettingsButton() {
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        const settingsButton = document.createElement('button');
        settingsButton.id = 'settingsButton';
        settingsButton.textContent = '⚙️ Einstellungen';
        settingsButton.className = 'settings-button';
        
        // Vor dem ersten page-switch einfügen
        const firstPageSwitch = container.querySelector('.page-switch');
        if (firstPageSwitch) {
            container.insertBefore(settingsButton, firstPageSwitch);
        } else {
            container.appendChild(settingsButton);
        }
        
        // Event-Listener für Einstellungs-Button
        settingsButton.addEventListener('click', showSettingsModal);
    });
}

// Einstellungs-Modal anzeigen
function showSettingsModal() {
    // Modal-Container erstellen
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Überschrift
    const modalHeader = document.createElement('h2');
    modalHeader.textContent = 'Einstellungen';
    modalContent.appendChild(modalHeader);
    
    // Einstellungen-Formular
    const settingsForm = document.createElement('form');
    settingsForm.className = 'settings-form';
    
    // Voreinstellungen anzeigen/verstecken Option
    const presetOption = document.createElement('div');
    presetOption.className = 'setting-option';
    
    const presetCheckbox = document.createElement('input');
    presetCheckbox.type = 'checkbox';
    presetCheckbox.id = 'showPresets';
    presetCheckbox.checked = settings.showPresets;
    
    const presetLabel = document.createElement('label');
    presetLabel.htmlFor = 'showPresets';
    presetLabel.textContent = 'Timer-Voreinstellungen anzeigen';
    
    presetOption.appendChild(presetCheckbox);
    presetOption.appendChild(presetLabel);
    settingsForm.appendChild(presetOption);
    
    // Blink-Option
    const blinkOption = document.createElement('div');
    blinkOption.className = 'setting-option';
    
    const blinkCheckbox = document.createElement('input');
    blinkCheckbox.type = 'checkbox';
    blinkCheckbox.id = 'blinkBeforeEnd';
    blinkCheckbox.checked = settings.blinkBeforeEnd;
    
    const blinkLabel = document.createElement('label');
    blinkLabel.htmlFor = 'blinkBeforeEnd';
    blinkLabel.textContent = 'Rot blinken kurz vor Ablauf';
    
    blinkOption.appendChild(blinkCheckbox);
    blinkOption.appendChild(blinkLabel);
    settingsForm.appendChild(blinkOption);
    
    // Blink-Sekunden Einstellung
    const blinkSecondsOption = document.createElement('div');
    blinkSecondsOption.className = 'setting-option';
    
    const blinkSecondsLabel = document.createElement('label');
    blinkSecondsLabel.htmlFor = 'blinkSeconds';
    blinkSecondsLabel.textContent = 'Sekunden vor Ablauf zum Blinken:';
    
    const blinkSecondsInput = document.createElement('input');
    blinkSecondsInput.type = 'number';
    blinkSecondsInput.id = 'blinkSeconds';
    blinkSecondsInput.min = '1';
    blinkSecondsInput.max = '60';
    blinkSecondsInput.value = settings.blinkSeconds;
    
    blinkSecondsOption.appendChild(blinkSecondsLabel);
    blinkSecondsOption.appendChild(blinkSecondsInput);
    settingsForm.appendChild(blinkSecondsOption);
    
    // Theme-Option
    const themeOption = document.createElement('div');
    themeOption.className = 'setting-option';
    
    const themeLabel = document.createElement('label');
    themeLabel.htmlFor = 'theme';
    themeLabel.textContent = 'Farbschema:';
    
    const themeSelect = document.createElement('select');
    themeSelect.id = 'theme';
    
    const lightOption = document.createElement('option');
    lightOption.value = 'light';
    lightOption.textContent = 'Light Mode';
    
    const darkOption = document.createElement('option');
    darkOption.value = 'dark';
    darkOption.textContent = 'Dark Mode';
    
    themeSelect.appendChild(lightOption);
    themeSelect.appendChild(darkOption);
    themeSelect.value = settings.theme;
    
    themeOption.appendChild(themeLabel);
    themeOption.appendChild(themeSelect);
    settingsForm.appendChild(themeOption);
    
    // Separator
    const separator = document.createElement('hr');
    settingsForm.appendChild(separator);
    
    // Benutzerdefinierte Voreinstellungen Abschnitt
    const customPresetsHeader = document.createElement('h3');
    customPresetsHeader.textContent = 'Benutzerdefinierte Voreinstellungen';
    settingsForm.appendChild(customPresetsHeader);
    
    // Aktuelle benutzerdefinierte Voreinstellungen anzeigen
    const customPresetsList = document.createElement('div');
    customPresetsList.className = 'custom-presets-list';
    
    settings.customPresets.forEach((preset, index) => {
        const presetItem = document.createElement('div');
        presetItem.className = 'custom-preset-item';
        
        const presetText = document.createElement('span');
        presetText.textContent = `${preset.name} (${preset.seconds} Sekunden)`;
        
        const deletePresetBtn = document.createElement('button');
        deletePresetBtn.type = 'button';
        deletePresetBtn.textContent = '🗑️';
        deletePresetBtn.className = 'delete-preset';
        deletePresetBtn.dataset.index = index;
        deletePresetBtn.addEventListener('click', function() {
            const presetIndex = parseInt(this.dataset.index);
            // Voreinstellung aus der Liste entfernen und DOM aktualisieren
            this.parentElement.remove();
            // Indizes der nachfolgenden Löschen-Buttons anpassen
            const remainingDeleteButtons = customPresetsList.querySelectorAll('.delete-preset');
            for (let i = presetIndex; i < remainingDeleteButtons.length; i++) {
                remainingDeleteButtons[i].dataset.index = i;
            }
        });
        
        presetItem.appendChild(presetText);
        presetItem.appendChild(deletePresetBtn);
        customPresetsList.appendChild(presetItem);
    });
    
    settingsForm.appendChild(customPresetsList);
    
    // Neue Voreinstellung hinzufügen
    const addPresetDiv = document.createElement('div');
    addPresetDiv.className = 'add-preset';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Name (z.B. "Tee")';
    nameInput.id = 'presetName';
    
    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.placeholder = 'Zeit in Sekunden';
    timeInput.id = 'presetTime';
    timeInput.min = '1';
    
    const addPresetBtn = document.createElement('button');
    addPresetBtn.type = 'button';
    addPresetBtn.textContent = 'Hinzufügen';
    addPresetBtn.id = 'addPresetBtn';
    addPresetBtn.addEventListener('click', function() {
        const presetName = nameInput.value.trim();
        const presetTime = parseInt(timeInput.value);
        
        if (presetName && !isNaN(presetTime) && presetTime > 0) {
            // Neues Element zur Liste hinzufügen
            const presetItem = document.createElement('div');
            presetItem.className = 'custom-preset-item';
            
            const presetText = document.createElement('span');
            presetText.textContent = `${presetName} (${presetTime} Sekunden)`;
            
            const deletePresetBtn = document.createElement('button');
            deletePresetBtn.type = 'button';
            deletePresetBtn.textContent = '🗑️';
            deletePresetBtn.className = 'delete-preset';
            const newIndex = customPresetsList.querySelectorAll('.custom-preset-item').length;
            deletePresetBtn.dataset.index = newIndex;
            deletePresetBtn.addEventListener('click', function() {
                const presetIndex = parseInt(this.dataset.index);
                this.parentElement.remove();
                // Indizes der nachfolgenden Löschen-Buttons anpassen
                const remainingDeleteButtons = customPresetsList.querySelectorAll('.delete-preset');
                for (let i = presetIndex; i < remainingDeleteButtons.length; i++) {
                    remainingDeleteButtons[i].dataset.index = i;
                }
            });
            
            presetItem.appendChild(presetText);
            presetItem.appendChild(deletePresetBtn);
            customPresetsList.appendChild(presetItem);
            
            // Eingabefelder leeren
            nameInput.value = '';
            timeInput.value = '';
        } else {
            alert('Bitte geben Sie einen gültigen Namen und eine Zeit in Sekunden ein.');
        }
    });
    
    addPresetDiv.appendChild(nameInput);
    addPresetDiv.appendChild(timeInput);
    addPresetDiv.appendChild(addPresetBtn);
    settingsForm.appendChild(addPresetDiv);
    
    modalContent.appendChild(settingsForm);
    
    // Buttons für Modal
    const modalButtons = document.createElement('div');
    modalButtons.className = 'modal-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Speichern';
    saveBtn.type = 'button';
    saveBtn.className = 'save-btn';
    saveBtn.addEventListener('click', function() {
        // Einstellungen aus dem Formular übernehmen
        settings.showPresets = presetCheckbox.checked;
        settings.blinkBeforeEnd = blinkCheckbox.checked;
        settings.blinkSeconds = parseInt(blinkSecondsInput.value);
        settings.theme = themeSelect.value;
        
        // Benutzerdefinierte Voreinstellungen sammeln
        const customPresetItems = customPresetsList.querySelectorAll('.custom-preset-item');
        settings.customPresets = [];
        customPresetItems.forEach(item => {
            const text = item.querySelector('span').textContent;
            const match = text.match(/^(.+) \((\d+) Sekunden\)$/);
            if (match) {
                settings.customPresets.push({
                    name: match[1],
                    seconds: parseInt(match[2])
                });
            }
        });
        
        // Einstellungen speichern und anwenden
        saveSettings();
        applySettings();
        
        // Modal schließen
        document.body.removeChild(modalOverlay);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Abbruch';
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modalOverlay);
    });
    
    modalButtons.appendChild(saveBtn);
    modalButtons.appendChild(cancelBtn);
    modalContent.appendChild(modalButtons);
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Schließen beim Klick auf Overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
}

// Wecker Seite initialisieren
if (setAlarmButton) {
    // Wecker aus dem lokalen Speicher laden
    loadAlarms();
    updateAlarmList();
    
    // Event-Listener für den Wecker-Button
    setAlarmButton.addEventListener('click', function() {
        if (alarmTimeInput && alarmTimeInput.value) {
            addAlarm(alarmTimeInput.value);
            alarmTimeInput.value = '';
        } else {
            alert('Bitte eine gültige Weckzeit eingeben!');
        }
    });
    
    // Notification-Berechtigungen anfordern
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

// Event-Listener für "Alle löschen" Button
if (clearAlarmsButton) {
    clearAlarmsButton.addEventListener('click', function() {
        if (confirm('Möchten Sie wirklich alle Wecker löschen?')) {
            clearAllAlarms();
        }
    });
}

// Füge den Wecker-Link zu den anderen Seiten hinzu
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('.container');
    
    containers.forEach(container => {
        // Überprüfen, ob wir auf der Wecker-Seite sind oder nicht
        const isOnWeckerPage = window.location.href.includes('wecker.html');
        
        // Wecker-Link zu den anderen Seiten hinzufügen, wenn wir nicht auf der Wecker-Seite sind
        if (!isOnWeckerPage) {
            const lastLink = container.querySelector('.page-switch:last-child');
            
            if (lastLink) {
                const weckerLink = document.createElement('a');
                weckerLink.href = 'wecker.html';
                weckerLink.className = 'page-switch';
                weckerLink.textContent = '⏰Zum Wecker';
                
                // Link nach dem letzten Link einfügen
                lastLink.after(weckerLink);
            }
        }
    });
    
    // Einstellungen laden und anwenden
    loadSettings();
    
    // Einstellungs-Button erstellen (nur auf der Timer-Seite)
    if (window.location.href.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        createSettingsButton();
    }
});