const defaultConfig = { work: 25, short: 5, long: 15 };
let config = { ...defaultConfig };
let state = {
  mode: 'work',
  remaining: config.work * 60,
  running: false,
  rounds: 0,
  sound: true
};

const timeEl = document.getElementById('time');
const sessionEl = document.getElementById('session');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const skipBtn = document.getElementById('skip');
const workVal = document.getElementById('workVal');
const shortVal = document.getElementById('shortVal');
const longVal = document.getElementById('longVal');
const roundsEl = document.getElementById('rounds');
const progressBar = document.getElementById('progressBar');
const beep = document.getElementById('beep');
const toggleSound = document.getElementById('toggle-sound');

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function setMode(mode) {
  state.mode = mode;
  if (mode === 'work') state.remaining = config.work * 60;
  if (mode === 'short') state.remaining = config.short * 60;
  if (mode === 'long') state.remaining = config.long * 60;
  sessionEl.textContent =
    mode === 'work' ? 'Work' : mode === 'short' ? 'Short Break' : 'Long Break';
  updateDisplay();
}

function updateDisplay() {
  timeEl.textContent = formatTime(state.remaining);
  roundsEl.textContent = state.rounds;
  let total =
    (state.mode === 'work'
      ? config.work
      : state.mode === 'short'
      ? config.short
      : config.long) * 60;
  let pct = Math.max(0, Math.min(100, (1 - state.remaining / total) * 100));
  progressBar.style.width = pct + '%';
}

let tickInterval = null;
function startTimer() {
  if (state.running) return;
  state.running = true;
  startBtn.textContent = 'Running';
  tickInterval = setInterval(() => {
    if (state.remaining > 0) {
      state.remaining -= 1;
      updateDisplay();
    } else {
      clearInterval(tickInterval);
      state.running = false;
      if (state.sound) playBeep();
      if (state.mode === 'work') {
        state.rounds += 1;
        if (state.rounds % 4 === 0) setMode('long');
        else setMode('short');
      } else {
        setMode('work');
      }
      startTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (tickInterval) clearInterval(tickInterval);
  state.running = false;
  startBtn.textContent = 'Start';
  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  state.rounds = 0;
  setMode('work');
  updateDisplay();
}

function skipSession() {
  pauseTimer();
  if (state.mode === 'work') {
    state.rounds += 1;
    if (state.rounds % 4 === 0) setMode('long');
    else setMode('short');
  } else {
    setMode('work');
  }
  updateDisplay();
}

function playBeep() {
  try {
    beep.currentTime = 0;
    beep.play();
  } catch (e) {}
}


startBtn.addEventListener('click', () => startTimer());
pauseBtn.addEventListener('click', () => pauseTimer());
resetBtn.addEventListener('click', () => resetTimer());
skipBtn.addEventListener('click', () => skipSession());
toggleSound.addEventListener('click', () => {
  state.sound = !state.sound;
  toggleSound.textContent = state.sound ? '🔔' : '🔕';
});

document.querySelectorAll('[data-role]').forEach(btn => {
  btn.addEventListener('click', e => {
    const role = e.currentTarget.dataset.role;
    const target = e.currentTarget.dataset.target;
    if (role === 'inc') config[target] = Math.min(180, config[target] + 1);
    if (role === 'dec') config[target] = Math.max(1, config[target] - 1);
    workVal.textContent = config.work;
    shortVal.textContent = config.short;
    longVal.textContent = config.long;
    if (!state.running) {
      if (state.mode === 'work') state.remaining = config.work * 60;
      if (state.mode === 'short') state.remaining = config.short * 60;
      if (state.mode === 'long') state.remaining = config.long * 60;
      updateDisplay();
    }
  });
});

window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    state.running ? pauseTimer() : startTimer();
  }
  if (e.key === 'r') resetTimer();
  if (e.key === 's') skipSession();
});

setMode('work');
updateDisplay();
