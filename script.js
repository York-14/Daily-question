const questionEl = document.getElementById("question");
const nextButton = document.getElementById("nextButton");

let lastIndex = -1;

function showRandomQuestion() {
  let index;
  do {
    index = Math.floor(Math.random() * QUESTIONS.length);
  } while (index === lastIndex && QUESTIONS.length > 1);

  lastIndex = index;
  questionEl.textContent = QUESTIONS[index];
}

nextButton.addEventListener("click", showRandomQuestion);

showRandomQuestion();
