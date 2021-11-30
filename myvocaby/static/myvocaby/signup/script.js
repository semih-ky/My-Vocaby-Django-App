const submit = document.querySelector("#submit");
const formUsername = document.querySelector("#formUsername");

submit.addEventListener("click", (e) => {
  if (document.querySelectorAll(".error").length > 0) {
    document.querySelectorAll(".error").forEach(node => {
      node.remove();
    })
  }
  const username = document.querySelector("#username").value;

  if ((!username || username.length < 3) || /\s/.test(username)) {

    let errorMessage = document.createElement("div");
    errorMessage.setAttribute("class", "error");
    errorMessage.innerText = "Username must be more than 2 char and does not contain whitespace!";
    formUsername.append(errorMessage);

    e.preventDefault();
    return;
  }
})
