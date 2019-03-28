(function() {
  const email = localStorage.getItem("loggedInUser");
  if (email) {
    window.location.href = "../client-dashboard/index.html"
  }
})()
function validateForm() {
  event.preventDefault();
  const name = document.forms["register-client"]["name"].value;
  const email = document.forms["register-client"]["email"].value;
  const password = document.forms["register-client"]["password"].value;
  const password2 = document.forms["register-client"]["password2"].value;

  const error = document.getElementById("form-error");

  if (password !== password2) {
    error.innerHTML = "Passwords do not match";
    return null;
  }

  const clientToken = JSON.parse(localStorage.getItem("clientToken")) || [];
  if (clientToken.some(item => item.email === email)) {
    error.innerHTML = "Email is already registered";
    return null
  }
  const client = {};
  const token = Math.floor(Math.random() * 100);
  client["Name"] = name;
  client["Email"] = email;
  client["Password"] = password;
  client["Token"] = token;
  clientToken.push(client);
  localStorage.setItem("loggedInUser", email)
  localStorage.setItem("clientToken", JSON.stringify(clientToken));

  window.location.href = "../client-dashboard/index.html";
}
