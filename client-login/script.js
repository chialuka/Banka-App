function validateForm() {
  event.preventDefault();
  const email = document.forms["loginClient"]["email"].value;
  const password = document.forms["loginClient"]["password"].value;

  const error = document.getElementById("form-error");

  if (email === "") {
    error.innerHTML = "Please enter your email address";
    return null;
  }

  if (password === "") {
    error.innerHTML = "Please enter a password";
    return null;
  }

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
