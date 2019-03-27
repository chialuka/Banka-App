loadUser();

function loadUser() {
  const user = document.getElementById("user");
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("clientToken"));
  const account = document.getElementById("account");

  if (!email) {
    window.location.href = "../landingPage/index.html";
  }
  const findUser = users.find(item => item.email === email);
  user.innerHTML = "Welcome " + findUser.name;
  if (!findUser.accNumber) {
    const link = document.createElement("a");
    link.setAttribute("href", "../client-create-account/index.html");
    link.setAttribute("class", "link");
    link.innerHTML = " Click here to open one."
    account.innerHTML =
      "You haven't opened a bank account yet.";
    account.appendChild(link);
  } else {
    account.innerHTML = "Your account: " + findUser.accNumber;
    const history = document.getElementById("history");
    const link = document.createElement("a");
    link.setAttribute("href", "../account-history/index.html");
    link.innerHTML = "View history"
    history.appendChild(link)
  }
}
