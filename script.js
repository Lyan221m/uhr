// Stoppuhr Funktionalität
let stopwatchInterval;
let stopwatchTime = 0;
let isStopwatchRunning = false;

// Timer Funktionalität
let timerInterval;
let timerTime = 0;
let isTimerRunning = false;

// Buttons und Displays
const startStopwatchButton = document.getElementById("startStopwatchButton");
const pauseStopwatchButton = document.getElementById("pauseStopwatchButton");
const resetStopwatchButton = document.getElementById("resetStopwatchButton");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");

const startTimerButton = document.getElementById("startTimerButton");
const pauseTimerButton = document.getElementById("pauseTimerButton");
const resetTimerButton = document.getElementById("resetTimerButton");
const timerDisplay = document.getElementById("timerDisplay");

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
    } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (startTimerButton) startTimerButton.disabled = false;
        if (pauseTimerButton) pauseTimerButton.disabled = true;
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

// Timer Funktionen
if (timerDisplay) {
    timerDisplay.addEventListener("click", function() {
        const input = prompt("Geben Sie die Zeit im Format HH:MM:SS ein:");
        if (input !== null) {
            const [hours, minutes, seconds] = input.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && 
                hours >= 0 && minutes >= 0 && seconds >= 0 && 
                minutes < 60 && seconds < 60) {
                timerTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
                timerDisplay.textContent = formatTime(timerTime);
                resetTimerButton.disabled = false;
            } else {
                alert("Bitte geben Sie eine gültige Zeit im Format HH:MM:SS ein.");
            }
        }
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
        timerDisplay.textContent = formatTime(timerTime);
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
        resetTimerButton.disabled = true;
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
setInterval(updateLiveClock, 1000);

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