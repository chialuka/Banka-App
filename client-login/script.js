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
  window.location.href = "../client-dashboard/index.html";
}
