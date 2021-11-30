function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function postRequest(url, requestBody) {
    let response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        mode: 'same-origin',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-type': 'application/json'
        }
    });

    let data = await response.json();
    
    if (!response.ok) {
        throw new Error(`${data.error}`);
    }
    
    return data;
}

function createDivElement(props) {
    let divElement = document.createElement("div");
    let { className="", idName="", textValue="", dataName="", dataValue="" } = props;

    if (className) {
        divElement.setAttribute("class", className);
    }
    if (idName) {
        divElement.setAttribute("id", idName);
    }
    if (textValue) {
        divElement.innerText = textValue;
    }
    if (dataName && dataValue) {
        divElement.dataset[dataName] = dataValue;
    }
    return divElement;
}

function createButton(idName, textValue) {
    let button = document.createElement("button");
    button.setAttribute("id", idName);
    button.innerText = textValue;
    return button;
}

function generateRandomInt(maxValue) {
    let max = maxValue || 1;
    return Math.floor(Math.random() * max);
}

function generateRandomSort(max, dataLength) {

    let randomSort = [];
  
    while (randomSort.length !== max) {
      let randNumb = generateRandomInt(dataLength);
  
      if (!randomSort.includes(randNumb)) {
        randomSort.push(randNumb)
      }
    }
    return randomSort;
}

function generateQuestionType() {
    let typeId = generateRandomInt(2);

    let types = ["word", "definition"];

    return {
        questionType: types[typeId],
        answerType: types[0] === types[typeId] ? types[1] : types[0] 
    }
}