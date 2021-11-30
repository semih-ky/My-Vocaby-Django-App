const quizOptionsField = document.querySelector("#quizOptions");
const loading = document.querySelector(".loading");
const startQuiz = document.querySelector("#startQuiz");
const quiz = document.querySelector("#quiz");
const currentQuestionNo = document.querySelector("#current");
const totalQuestionNo = document.querySelector("#total");
const question = document.querySelector("#questionBold");
const answers = document.querySelectorAll(".answer");
const nextButton = document.querySelector("#nextBtn");
const restart = document.querySelector("#restart");
const result = document.querySelector("#result");
const correct = document.querySelector("#correct");
const wrong = document.querySelector("#wrong");
const resultText = document.querySelector("#resultText");

let words, sort, currentQuestionId;
let questionNo = 1;
let counter = 0;
let correctAnswer = 0;
let wrongAnswer = 0;
let lock = false;

const questionNumber = document.querySelector("#questionNumber");
let numberOfQuestions = parseInt(questionNumber.value) || 0;

questionNumber.addEventListener("change", (e) => {
  numberOfQuestions = parseInt(e.target.value);
});

startQuiz.addEventListener("click", getQuiz);

answers.forEach(node => {
  node.addEventListener("click", checkAnswer);
  node.addEventListener("mouseenter", (e) => {
    if (!lock) {
      e.target.style.backgroundColor = "#ffffffc9";
    }
  });
  node.addEventListener("mouseleave", (e) => {
    if (!lock) {
      e.target.style.backgroundColor = "#e4e4e4";
    }
  })
})

restart.addEventListener("click", () => location.reload());

nextButton.addEventListener("click", (e) => {
  if (lock) {
    nextButton.style.backgroundColor = "inherit";
    nextButton.style.color = "inherit";

    answers.forEach(node => {
      node.style.backgroundColor = "#e4e4e4";
    });
  
    if (counter + 1 === sort.length - 1) {
      e.target.innerText = "Finish";
    }
    if (counter <= sort.length) {
      lock = false;
      ++questionNo;
      loadQuiz(++counter);
    }
  }
});

async function getQuiz(e) {
  if (document.querySelector(".error")) document.querySelector(".error").remove();
  loading.style.display = "block";
  
  let data;
  let errorElement;
  try {
    data = await postRequest(
      '/api/questions',
      {numberOfQuestions: numberOfQuestions}
    )
  } catch(error) {
    errorElement = createDivElement({
      className: "error",
      textValue: error.message
    });
    loading.style.display = "none";
    quizOptionsField.append(errorElement);
  }

  if (data?.words) {
    totalQuestionNo.innerText = numberOfQuestions;
    words = data.words;
    sort = generateRandomSort(numberOfQuestions, data.words.length);
    loadQuiz(counter);
    loading.style.display = "none";
    quizOptionsField.remove();
    quiz.style.display = "flex";
  }
  return;
}

function loadQuiz(counter) {

  if (counter >= sort.length) {
    finishQuiz();
    return;
  }

  currentQuestionNo.innerText = questionNo;

  const types = generateQuestionType();

  let i = sort[counter];

  currentQuestionId = words[i].id;
  question.innerText = words[i][types.questionType];

  let answerPosition = generateRandomInt(4);

  let answersSort = [];
  answers.forEach((node, index) => {

    if (index === answerPosition) {
      node.dataset["answerKey"] = words[i].id;
      node.innerText = words[i][types.answerType];
      return;
    }

    let j;
    do {
      j = generateRandomInt(words.length);
    } while (j === i || answersSort.includes(j))

    answersSort.push(j);

    node.dataset["answerKey"] = words[j].id;
    node.innerText = words[j][types.answerType];

  });
}

function finishQuiz() {
  correct.innerText = correctAnswer;
  wrong.innerText = wrongAnswer;

  if (correctAnswer > wrongAnswer) {
    resultText.innerText = "Good Job!";
    resultText.style.color = "green";
  } else {
    resultText.innerText = "You need more practise!";
    resultText.style.color = "red";
  }

  let buttons = createDivElement({idName: "buttons"});
  let button = createButton("restart", "Restart");
  button.addEventListener("click", () => location.reload());

  buttons.append(button);
  result.append(buttons);

  quiz.remove();
  result.style.display = "flex";
}

function checkAnswer(e) {
  if (lock) return;

  let answerId = parseInt(e.target.dataset.answerKey);

  if (answerId === currentQuestionId) {
    correctAnswer += 1;
    e.target.style.backgroundColor = "lawngreen";
    lock = true;
  } else {
    wrongAnswer += 1;
    e.target.style.backgroundColor = "indianred";
    document.querySelector(`[data-answer-key="${currentQuestionId}"]`).style.backgroundColor = "lawngreen";
    lock = true;
  }
  nextButton.style.backgroundColor = "#1668ff";
  nextButton.style.color = "#fff";
}