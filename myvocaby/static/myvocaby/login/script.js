document.querySelector("#submit").addEventListener("click", (e) => {
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  if ((!username || !password) || (username.length < 3 || /\s/.test(username))) {
    e.preventDefault();
    return;
  }
})