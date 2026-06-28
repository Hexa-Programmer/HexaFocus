// script.js
let savedSessions = localStorage.getItem("hexa_focus_sessions");
let sessions = savedSessions ? JSON.parse(savedSessions) : [];

let activeSession = null;
let timerInterval = null;
let currentViewHistoryId = null;

const sessionList = document.getElementById("sessionList");
const appContainer = document.getElementById("appContainer");
const errorMsg = document.getElementById("errorMsg");
const deleteSessionBtn = document.getElementById("deleteSessionBtn");

const statStarted = document.getElementById("statStarted");
const statAchieved = document.getElementById("statAchieved");

const setupView = document.getElementById("setupView");
const timerView = document.getElementById("timerView");
const feedbackView = document.getElementById("feedbackView");
const historyView = document.getElementById("historyView");

const sessionTitle = document.getElementById("sessionTitle");
const sessionDesc = document.getElementById("sessionDesc");
const sessionGoal = document.getElementById("sessionGoal");

const activeSessionTitle = document.getElementById("activeSessionTitle");
const timerDisplay = document.getElementById("timerDisplay");
const motivationalQuote = document.getElementById("motivationalQuote");
const pauseBtn = document.getElementById("pauseBtn");

const feedbackDuration = document.getElementById("feedbackDuration");
const goalCheckContainer = document.getElementById("goalCheckContainer");
const feedbackGoalText = document.getElementById("feedbackGoalText");
const continueBtn = document.getElementById("continueBtn");

const quotes = [
    "Focus on the journey, not the destination.",
    "The secret of your future is hidden in your daily routine.",
    "Do what you have to do until you can do what you want to do.",
    "Discipline is choosing between what you want now and what you want most.",
    "Concentrate all your thoughts upon the work in hand.",
    "Action is the foundational key to all success."
];

function showView(viewElement) {
    [setupView, timerView, feedbackView, historyView].forEach(v => {
        v.classList.remove('active-view');
        v.classList.add('hidden');
    });
    viewElement.classList.remove('hidden');
    viewElement.classList.add('active-view');
}

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function updateStats() {
    statStarted.innerText = sessions.length;
    let achieved = sessions.filter(s => s.goalAchieved === true).length;
    statAchieved.innerText = achieved;
}

function saveSessions() {
    localStorage.setItem("hexa_focus_sessions", JSON.stringify(sessions));
    updateStats();
}

function renderSessions() {
    sessionList.innerHTML = "";
    
    const sorted = [...sessions].reverse();

    sorted.forEach(session => {
        const div = document.createElement("div");
        div.classList.add("note-item");
        if (session.id === currentViewHistoryId) div.classList.add("active");

        div.innerText = session.title;

        const sub = document.createElement("span");
        sub.innerText = `Focused: ${formatTime(session.durationSec)}`;
        div.appendChild(sub);

        div.onclick = () => viewHistory(session.id);
        sessionList.appendChild(div);
    });
}

function createNewSession() {
    if (activeSession && activeSession.status === 'running') {
        alert("Please end your current focus session first!");
        return;
    }

    currentViewHistoryId = null;
    deleteSessionBtn.classList.add("hidden");
    
    sessionTitle.value = "";
    sessionDesc.value = "";
    sessionGoal.value = "";
    errorMsg.innerText = "";
    
    renderSessions();
    showView(setupView);
    openSidebarMobile();
}

function startSession() {
    const title = sessionTitle.value.trim();
    
    if (!title) {
        errorMsg.innerText = "Please enter a Session Title.";
        return;
    }
    errorMsg.innerText = "";

    activeSession = {
        id: Date.now(),
        title: title,
        desc: sessionDesc.value.trim(),
        goal: sessionGoal.value.trim(),
        durationSec: 0,
        status: 'running',
        goalAchieved: null
    };

    activeSessionTitle.innerText = activeSession.title;
    timerDisplay.innerText = "00:00:00";
    pauseBtn.innerText = "Pause Session";
    
    motivationalQuote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

    showView(timerView);
    
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
}

function tick() {
    if (activeSession && activeSession.status === 'running') {
        activeSession.durationSec++;
        timerDisplay.innerText = formatTime(activeSession.durationSec);
    }
}

function togglePause() {
    if (!activeSession) return;
    
    if (activeSession.status === 'running') {
        activeSession.status = 'paused';
        pauseBtn.innerText = "Resume Session";
        motivationalQuote.innerText = "Session Paused. Take a deep breath.";
    } else {
        activeSession.status = 'running';
        pauseBtn.innerText = "Pause Session";
        motivationalQuote.innerText = "Let's get back to it!";
    }
}

function endSession() {
    if (!activeSession) return;
    
    clearInterval(timerInterval);
    activeSession.status = 'ended';
    
    feedbackDuration.innerText = formatTime(activeSession.durationSec);
    
    if (activeSession.goal) {
        goalCheckContainer.classList.remove('hidden');
        feedbackGoalText.innerText = activeSession.goal;
        continueBtn.classList.add('hidden');
    } else {
        goalCheckContainer.classList.add('hidden');
        continueBtn.classList.remove('hidden');
        finalizeAndSaveSession();
    }
    
    showView(feedbackView);
}

function submitFeedback(achieved) {
    if (activeSession) {
        activeSession.goalAchieved = achieved;
    }
    finalizeAndSaveSession();
    
    goalCheckContainer.classList.add('hidden');
    continueBtn.classList.remove('hidden');
}

function finalizeAndSaveSession() {
    if (!activeSession) return;
    
    sessions.push(activeSession);
    saveSessions();
    renderSessions();
    
    activeSession = null;
}

function viewHistory(id) {
    if (activeSession && activeSession.status !== 'ended') {
        alert("Please pause or end your current session first!");
        return;
    }

    const session = sessions.find(s => s.id === id);
    if (!session) return;

    currentViewHistoryId = id;
    renderSessions();

    deleteSessionBtn.classList.remove("hidden");

    document.getElementById("historyTitle").innerText = session.title;
    document.getElementById("historyDesc").innerText = session.desc || "No description provided.";
    document.getElementById("historyDuration").innerText = formatTime(session.durationSec);
    
    if (session.goal) {
        document.getElementById("historyGoal").innerText = session.goal;
        let goalStatus = "N/A";
        if (session.goalAchieved === true) goalStatus = "✅ Yes";
        else if (session.goalAchieved === false) goalStatus = "❌ No";
        document.getElementById("historyAchieved").innerText = goalStatus;
    } else {
        document.getElementById("historyGoal").innerText = "No specific goal set.";
        document.getElementById("historyAchieved").innerText = "N/A";
    }

    showView(historyView);
    openSidebarMobile();
}

function deleteHistorySession() {
    if (!currentViewHistoryId) return;
    if (!confirm("Are you sure you want to delete this session record?")) return;

    sessions = sessions.filter(s => s.id !== currentViewHistoryId);
    saveSessions();
    renderSessions();
    
    createNewSession();
}

function openSidebarMobile() {
    if (window.innerWidth <= 768) {
        appContainer.classList.add('note-open');
    }
}
function closeSidebarMobile() {
    appContainer.classList.remove('note-open');
}

function init() {
    updateStats();
    renderSessions();
    createNewSession();

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hide-loader');
    }, 2200);
}

init();