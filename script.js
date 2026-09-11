const questionEl = document.getElementById("question");
const nextButton = document.getElementById("nextButton");

let lastIndex = -1;

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
    questionEl.classList.remove("is-fading");
  }, FADE_DURATION);
}

nextButton.addEventListener("click", showRandomQuestion);

questionEl.textContent = pickNextQuestion();
