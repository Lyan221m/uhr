// Stoppuhr Funktionalität
let stopwatchInterval;
let stopwatchTime = 0;
let isStopwatchRunning = false;

// Timer Funktionalität
let timerInterval;
let timerTime = 0;
let isTimerRunning = false;
let initialTimerTime = 0; // Speichert die ursprüngliche Zeit des Timers

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
const muteButton = document.getElementById('muteButton');

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
        timerSound.muted = isMuted;
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