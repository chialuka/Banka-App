loadUser();

function loadUser() {
  const user = document.getElementById("user");
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("clientToken"));
  const account = document.getElementById("account");

  if (!email) {
    window.location.href = "../landingPage/index.html";
  }
  
}
