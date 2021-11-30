const container = document.querySelector(".container");
const addCard = document.querySelector("#addCard");
const add = document.querySelector("#add");
const deleteCard = document.querySelectorAll(".delete");
const background = document.querySelector(".background");
const addingCard = document.querySelector(".adding-card");
const searchContainer = document.querySelector(".search-container");
const searchField = document.querySelector(".search-field");
const search = document.querySelector("#search");
const closeSearch = document.querySelector("#close");
const searchBtn = document.querySelector("#searchBtn");
const searchLoading = document.querySelector("#searchLoading");

const okBtn = createButton("okBtn", "OK!");
const cancelBtn = createButton("cancelBtn", "Cancel");

search.addEventListener("keydown", checkChar);

add.addEventListener("click", openAddField);
closeSearch.addEventListener("click", closeAddField);
searchBtn.addEventListener("click", searching);
deleteCard.forEach((node) => {
  node.addEventListener("click", removeCard);
})

cancelBtn.addEventListener("click", cancel);
okBtn.addEventListener("click", ok);

const wordData = {};
function clearWordData() {
  wordData["id"] = "";
  wordData["word"] = "";
  wordData["type"] = "";
  wordData["definition"] = "";
  wordData["example"] = "";
}

function checkChar(e) {
  let re = /[A-Za-z]/;
  if (!re.test(e.key)) {
    e.preventDefault()
  }
}

function openAddField(e) {
  background.style.display = "flex";
}

function closeAddField(e) {
  cancel();
  search.value = "";
  background.style.display = "none";
}

function createSearchResults(data) {

  let { type, definition, example } = data;

  let typeElement = createDivElement({
    className: "search-results",
    idName: "type", 
    textValue: type});

  let definitionElement = createDivElement({
    className: "search-results",
    idName: "definition",
    textValue: definition});

  let exampleElement = createDivElement({
    className: "search-results",
    idName: "example",
    textValue: example});
 
  addingCard.append(typeElement);
  addingCard.append(definitionElement);
  addingCard.append(exampleElement);
  addingCard.append(okBtn);
  addingCard.append(cancelBtn);
}

function createCard(data) {
  let { id, word, type, definition, example } = data;

  let cardElement = createDivElement({
    className: "card",
    dataName: "cardid",
    dataValue: id
  });

  let deleteElement = createDivElement({
    className: "delete"
  });
  deleteElement.addEventListener("click", removeCard);

  let wordElement = createDivElement({
    className: "vocab",
    idName: "word"
  });

  let strongElement = document.createElement("strong");
  strongElement.innerText = word;

  let spanElement = document.createElement("span");
  spanElement.setAttribute("id", "type");
  spanElement.innerText = type;

  let definitionElement = createDivElement({
    className: "vocab",
    idName: "definition",
    textValue: definition
  });

  let exampleElement = createDivElement({
    className: "vocab",
    idName: "example",
    textValue: example
  });

  wordElement.append(strongElement);
  wordElement.append(spanElement);

  cardElement.append(deleteElement);
  cardElement.append(wordElement);
  cardElement.append(definitionElement);
  cardElement.append(exampleElement);

  let firstCard = document.querySelectorAll(".card")[1];
  container.insertBefore(cardElement, firstCard);
}

async function searching(e) {
  let searchWord = search.value.toLowerCase()
  if (searchWord.length < 2) return;
 
  if (wordData?.word === searchWord) return;
  
  if (document.querySelector(".error")) document.querySelector(".error").remove();
  searchLoading.style.display = "block";
  clearWordData();
  cancel();

  let data;
  let errorElement;
  try {
    data = await postRequest(
      '/api/search',
      {word: searchWord}
    )
  } catch(error) {
    errorElement = createDivElement({
      className: "error",
      textValue: error.message
    });
    searchLoading.style.display = "none";
    searchField.append(errorElement);
  }

  if (data) {
    wordData["id"] = data.id;
    wordData["word"] = data.word;
    wordData["type"] = data.type;
    wordData["definition"] = data.definition;
    wordData["example"] = data.example;
    searchLoading.style.display = "none";
    createSearchResults(data);
  }
  return; 
}

function cancel(e) {
  if (document.querySelector(".error")) document.querySelector(".error").remove();
  clearWordData();
  document.querySelectorAll(".search-results").forEach(node => {
    node.remove();
  })
  okBtn.remove();
  cancelBtn.remove();
}

async function ok(e) {
  if (document.querySelector(".error")) document.querySelector(".error").remove();
  let errorElement;  
  try {
    await postRequest(
      '/api/saveword',
      {wordId: wordData.id}
    )
  } catch(error) {
    errorElement = createDivElement({
      className: "error",
      textValue: error.message
    });
    addingCard.append(errorElement);
  }
  if (!errorElement) {
    if (!document.querySelector(`[data-cardid="${wordData.id}"]`)) {
      createCard(wordData);
    }
    closeAddField();
  }
  return;
}

async function removeCard(e) {
  const cardId = e.target.parentNode.dataset.cardid;
  let response;
  try {
    response = await postRequest(
      '/api/removeword',
      {wordId: cardId}
    )
  } catch(error) {
    console.log(error)
  }
  if (response?.message) {
    let card = document.querySelector(`[data-cardid="${cardId}"]`);
    card.setAttribute("id", "removeCard");
    card.addEventListener("animationend", () => card.remove());
  }
  return;
}