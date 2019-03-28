(function(){
  const email = localStorage.getItem("loggedInUser");
  if (email) {
    window.location.href = "../client-dashboard/index.html"
  }
})();

function validateForm() {
  event.preventDefault();
  const email = document.forms["login-client"]["email"].value;
  const password = document.forms["login-client"]["password"].value;

  const error = document.getElementById("form-error");

  const clientToken = JSON.parse(localStorage.getItem("clientToken")) || [];
  if (clientToken.some(item => item.email === email)) {
    if (clientToken.find(item => item.password === password)) {
      const client = clientToken.find(x => x.email === email)
      const token = Math.floor(Math.random() * 100);
      client.token = token;
      localStorage.setItem("loggedInUser", email)
      localStorage.setItem("clientToken", JSON.stringify(clientToken));
      window.location.href = "../client-dashboard/index.html";
    } else {
      error.innerHTML = "Incorrect password"
    }
  } else {
    error.innerHTML = "User does not exist";
  }
}
