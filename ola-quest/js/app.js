(function () {
  "use strict";

  const STORAGE_KEY = "olaQuestState.v2";
  const questions = window.OlaQuestQuestions;
  const total = questions.length;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    preloader: $("[data-preloader]"),
    header: $("[data-header]"),
    start: $("[data-start-quest]"),
    resume: $("[data-continue-quest]"),
    screens: $$("[data-screen]"),
    questionNumber: $("[data-question-number]"),
    questionText: $("[data-question-text]"),
    hintBox: $("[data-hints]"),
    hintButtons: {
      easy: $("[data-hint-button='easy']"),
      hard: $("[data-hint-button='hard']")
    },
    form: $("[data-answer-form]"),
    input: $("[data-answer-input]"),
    submit: $("[data-submit-answer]"),
    feedback: $("[data-feedback]"),
    attempts: $("[data-attempts]"),
    reset: $("[data-reset]"),
    swipeZone: $("[data-swipe-zone]"),
    progress: {
      bar: $("[data-progress-bar]"),
      label: $("[data-progress-label]"),
      counter: $("[data-question-counter]"),
      hints: $("[data-hints-counter]"),
      timer: $("[data-game-timer]")
    },
    finalTime: $("[data-final-time]"),
    finalHints: $("[data-final-hints]"),
    finalId: $("[data-final-id]"),
    certForm: $("[data-certificate-form]"),
    certName: $("[data-player-name]"),
    certCanvas: $("[data-certificate-canvas]"),
    certStatus: $("[data-certificate-status]"),
    playAgain: $("[data-play-again]")
  };

  const sounds = {
    correct: $("[data-sound='correct']"),
    wrong: $("[data-sound='wrong']"),
    complete: $("[data-sound='complete']")
  };

  let state = loadState();
  let timer = null;
  let audioContext = null;

  function defaultState() {
    return {
      screen: "landing",
      index: 0,
      hints: 0,
      openedHintsByQuestion: {},
      attemptsByQuestion: {},
      startedAt: null,
      elapsedBefore: 0,
      completedAt: null,
      certificateId: null,
      theme: "dark"
    };
  }

  function loadState() {
    try {
      return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function elapsedSeconds() {
    if (!state.startedAt) return state.elapsedBefore || 0;
    return Math.floor((Date.now() - state.startedAt) / 1000) + (state.elapsedBefore || 0);
  }

  function normalize(value) {
    return value.toLowerCase().trim().replace(/\s+/g, " ");
  }

  function showScreen(name) {
    state.screen = name;
    els.header.classList.toggle("is-away", name !== "landing");
    els.screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
    saveState();
    if (name === "game" || name === "finish") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (name === "game") {
      setTimeout(() => els.input.focus(), 120);
    }
  }

  function startQuest(resume = false) {
    if (!resume || !state.startedAt) {
      state = { ...defaultState(), theme: state.theme, screen: "game", startedAt: Date.now() };
    } else {
      state.startedAt = Date.now();
    }
    saveState();
    showScreen("game");
    renderQuestion();
    startTimer();
  }

  function renderQuestion() {
    const question = questions[state.index];
    const opened = state.openedHintsByQuestion[state.index] || [];
    els.questionNumber.textContent = String(state.index + 1).padStart(2, "0");
    els.questionText.textContent = question.question;
    els.input.value = "";
    els.feedback.innerHTML = "";
    els.attempts.textContent = `Попытки: ${state.attemptsByQuestion[state.index] || 0}`;
    window.OlaQuestHints.render(els.hintBox, opened, question);
    window.OlaQuestHints.syncButtons(els.hintButtons, opened);
    window.OlaQuestProgress.update({ index: state.index, total, hints: state.hints }, els.progress);
    updateTimer();
  }

  function updateTimer() {
    if (els.progress.timer) {
      els.progress.timer.textContent = window.OlaQuestProgress.formatTime(elapsedSeconds());
    }
  }

  function openHint(type) {
    const opened = state.openedHintsByQuestion[state.index] || [];
    if (opened.includes(type)) return;
    state.openedHintsByQuestion[state.index] = [...opened, type];
    state.hints += 1;
    saveState();
    renderQuestion();
  }

  function closeHint(type) {
    const opened = state.openedHintsByQuestion[state.index] || [];
    state.openedHintsByQuestion[state.index] = opened.filter((item) => item !== type);
    saveState();
    window.OlaQuestHints.render(els.hintBox, state.openedHintsByQuestion[state.index], questions[state.index]);
  }

  function setFeedback(type, text) {
    els.feedback.innerHTML = `<span class="feedback__message feedback__message--${type}">${text}</span>`;
  }

  function playSound(name) {
    const audio = sounds[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => synthSound(name));
    } else {
      synthSound(name);
    }
  }

  function synthSound(name) {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequencies = { correct: 740, wrong: 170, complete: 880 };
    osc.frequency.value = frequencies[name] || 440;
    osc.type = name === "wrong" ? "triangle" : "sine";
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.36);
  }

  function checkAnswer() {
    const question = questions[state.index];
    const answer = normalize(els.input.value);
    const valid = question.answer.map(normalize).includes(answer);
    state.attemptsByQuestion[state.index] = (state.attemptsByQuestion[state.index] || 0) + 1;
    els.attempts.textContent = `Попытки: ${state.attemptsByQuestion[state.index]}`;

    if (!valid) {
      playSound("wrong");
      setFeedback("danger", "Неверно, попробуй ещё");
      els.input.value = "";
      els.swipeZone.classList.remove("is-wrong");
      void els.swipeZone.offsetWidth;
      els.swipeZone.classList.add("is-wrong");
      saveState();
      return;
    }

    playSound("correct");
    setFeedback("success", "Верно! Следующая загадка уже ждёт");
    els.submit.disabled = true;
    saveState();
    setTimeout(() => {
      els.submit.disabled = false;
      if (state.index + 1 >= total) {
        completeQuest();
      } else {
        state.index += 1;
        saveState();
        renderQuestion();
      }
    }, 920);
  }

  function startTimer() {
    clearInterval(timer);
    updateTimer();
    timer = setInterval(() => {
      if (state.screen === "game") {
        window.OlaQuestProgress.update({ index: state.index, total, hints: state.hints }, els.progress);
        updateTimer();
      }
    }, 1000);
  }

  function completeQuest() {
    state.completedAt = Date.now();
    state.elapsedBefore = elapsedSeconds();
    state.startedAt = null;
    state.certificateId = state.certificateId || window.OlaQuestCertificate.createId();
    saveState();
    clearInterval(timer);
    showScreen("finish");
    renderFinish();
    playSound("complete");
  }

  function renderFinish() {
    const time = window.OlaQuestProgress.formatTime(state.elapsedBefore);
    els.finalTime.textContent = time;
    els.finalHints.textContent = state.hints;
    els.finalId.textContent = state.certificateId;
    window.OlaQuestCertificate.draw(els.certCanvas, {
      name: els.certName.value,
      time,
      hints: state.hints,
      id: state.certificateId
    });
  }

  function resetProgress() {
    if (!confirm("Сбросить прогресс и начать заново?")) return;
    const theme = state.theme;
    localStorage.removeItem(STORAGE_KEY);
    state = { ...defaultState(), theme };
    applyTheme(theme);
    saveState();
    showScreen("landing");
    els.resume.hidden = true;
    clearInterval(timer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyTheme(theme) {
    state.theme = "dark";
    document.documentElement.dataset.theme = "dark";
    saveState();
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.18 });
    $$(".reveal").forEach((item) => observer.observe(item));
  }

  function initSwipe() {
    let startX = 0;
    let startY = 0;
    els.swipeZone.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });
    els.swipeZone.addEventListener("touchend", (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)) openHint(dx < 0 ? "easy" : "hard");
      if (dy < -90 && Math.abs(dy) > Math.abs(dx)) els.form.requestSubmit();
    }, { passive: true });
  }

  function bindEvents() {
    els.start.addEventListener("click", () => startQuest(false));
    els.resume.addEventListener("click", () => startQuest(true));
    Object.entries(els.hintButtons).forEach(([type, button]) => {
      button.addEventListener("click", () => openHint(type));
    });
    els.hintBox.addEventListener("click", (event) => {
      const button = event.target.closest("[data-close-hint]");
      if (button) closeHint(button.dataset.closeHint);
    });
    els.form.addEventListener("submit", (event) => {
      event.preventDefault();
      checkAnswer();
    });
    els.reset.addEventListener("click", resetProgress);
    els.certName.addEventListener("input", renderFinish);
    els.certForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderFinish();
      window.OlaQuestCertificate.download(els.certCanvas, `ola-quest-${state.certificateId}.png`, els.certStatus);
    });
    $("[data-play-again]").addEventListener("click", resetProgress);
  }

  function init() {
    document.body.classList.add("is-locked");
    bindEvents();
    initReveal();
    initSwipe();
    applyTheme(state.theme);
    els.resume.hidden = !(state.index > 0 && state.index < total && !state.completedAt);

    if (state.screen === "finish" && state.completedAt) {
      showScreen("finish");
      renderFinish();
    } else {
      showScreen("landing");
    }

    setTimeout(() => {
      els.preloader.classList.add("is-hidden");
      document.body.classList.remove("is-locked");
    }, 760);
  }

  window.addEventListener("load", init);
})();
