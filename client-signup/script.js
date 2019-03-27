function validateForm() {
  event.preventDefault();
  const name = document.forms["registerClient"]["name"].value;
  const email = document.forms["registerClient"]["email"].value;
  const password = document.forms["registerClient"]["password"].value;
  const password2 = document.forms["registerClient"]["password2"].value;

  const error = document.getElementById("form-error");

  if (name === "") {
    error.innerHTML = "Please enter your name";
    return null;
  }

  if (email === "") {
    error.innerHTML = "Please enter your email address";
    return null;
  }

  if (password === "") {
    error.innerHTML = "Please enter a password";
    return null;
  }

  if (password2 === "") {
    error.innerHTML = "Please confirm your password";
    return null;
  }

  if (password !== password2) {
    error.innerHTML = "Passwords do not match";
    return null;
  }

  if (password.length < 6) {
    error.innerHTML = "Password must be longer than six characters";
    return null;
  }

  const clientToken = JSON.parse(localStorage.getItem("clientToken")) || [];
  if (clientToken.some(item => item.email === email)) {
    error.innerHTML = "Email is already registered";
    return null
  }
  const client = {};
  const token = Math.floor(Math.random() * 100)
  client.email = email;
  client.password = password;
  client.token = token;
  clientToken.push(client);
  localStorage.setItem("clientToken", JSON.stringify(clientToken));

  window.location.href = "../client-dashboard/index.html";
}
