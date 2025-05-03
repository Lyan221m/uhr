// Stoppuhr Funktionalität
let stopwatchInterval;
let stopwatchTime = 0;
let isStopwatchRunning = false;

// Timer Funktionalität
let timerInterval;
let timerTime = 0;
let isTimerRunning = false;
let initialTimerTime = 0; // Speichert die ursprüngliche Zeit des Timers

// Wecker Funktionalität
let alarms = [];
let activeAlarm = null;
let alarmCheckInterval;

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
        
        // Fortschrittsleiste auf 100% setzen, wenn der Timer abgelaufen ist
        if (timerProgress) {
            timerProgress.style.width = '100%';
        }
        
        if (timerSound && !isMuted) timerSound.play();
        alert("Timer abgelaufen!");
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
        
        // Fortschrittsleiste zurücksetzen
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
        document.body.classList.toggle('dark-mode');
        themeToggleButton.textContent = document.body.classList.contains('dark-mode') 
            ? '⬜Wechsel zu Light Mode' 
            : '⬛Wechsel zu Dark Mode';
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
});