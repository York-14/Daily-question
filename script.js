const questionEl = document.getElementById("question");
const nextButton = document.getElementById("nextButton");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const saveFeedback = document.getElementById("saveFeedback");

const menuButton = document.getElementById("menuButton");
const menuPanel = document.getElementById("menuPanel");
const todayView = document.getElementById("todayView");
const historyView = document.getElementById("historyView");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

let lastIndex = -1;
let currentQuestion = "";
let feedbackTimer = null;

const FADE_DURATION = 200;

function pickNextQuestion() {
  let index;
  do {
    index = Math.floor(Math.random() * QUESTIONS.length);
  } while (index === lastIndex && QUESTIONS.length > 1);

  lastIndex = index;
  return QUESTIONS[index];
}

function showRandomQuestion() {
  const next = pickNextQuestion();

  questionEl.classList.add("is-fading");
  window.setTimeout(() => {
    questionEl.textContent = next;
    currentQuestion = next;
    questionEl.classList.remove("is-fading");
    answerInput.value = "";
    setSaveFeedback("");
  }, FADE_DURATION);
}

nextButton.addEventListener("click", showRandomQuestion);

currentQuestion = pickNextQuestion();
questionEl.textContent = currentQuestion;

// ---- 回答の保存（IndexedDBのみ・サーバー送信なし） ----

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function setSaveFeedback(message) {
  if (feedbackTimer) {
    window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  saveFeedback.textContent = message;
  if (message) {
    feedbackTimer = window.setTimeout(() => {
      saveFeedback.textContent = "";
    }, 2500);
  }
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const answer = answerInput.value.trim();
  if (!answer) {
    setSaveFeedback("回答を入力してください");
    return;
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const entry = {
    id: generateId(),
    year: now.getFullYear(),
    date: formatDateISO(now),
    question: currentQuestion,
    answer,
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  addEntry(entry)
    .then(() => {
      setSaveFeedback("保存しました");
    })
    .catch((error) => {
      console.error("回答の保存に失敗しました", error);
      setSaveFeedback("保存に失敗しました");
    });
});

// ---- メニューと画面切り替え ----

function closeMenu() {
  menuPanel.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
}

function openMenu() {
  menuPanel.hidden = false;
  menuButton.setAttribute("aria-expanded", "true");
}

menuButton.addEventListener("click", () => {
  if (menuPanel.hidden) {
    openMenu();
  } else {
    closeMenu();
  }
});

document.addEventListener("click", (event) => {
  if (
    !menuPanel.hidden &&
    !menuPanel.contains(event.target) &&
    event.target !== menuButton
  ) {
    closeMenu();
  }
});

function showView(view) {
  if (view === "history") {
    todayView.hidden = true;
    historyView.hidden = false;
    renderHistory();
  } else {
    todayView.hidden = false;
    historyView.hidden = true;
  }
  closeMenu();
}

document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    showView(item.dataset.view);
  });
});

function renderHistory() {
  getAllEntries()
    .then((entries) => {
      entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      historyList.innerHTML = "";

      if (entries.length === 0) {
        historyEmpty.hidden = false;
        return;
      }

      historyEmpty.hidden = true;
      entries.forEach((entry) => {
        const item = document.createElement("li");
        item.className = "history-item";
        item.innerHTML = `
          <p class="history-meta">${entry.year}年 / ${entry.date}</p>
          <p class="history-question"></p>
          <p class="history-answer"></p>
        `;
        item.querySelector(".history-question").textContent = entry.question;
        item.querySelector(".history-answer").textContent = entry.answer;
        historyList.appendChild(item);
      });
    })
    .catch((error) => {
      console.error("回答履歴の読み込みに失敗しました", error);
    });
}
