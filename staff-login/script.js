function validateForm() {
  event.preventDefault();
  const email = document.forms["loginStaff"]["email"].value;
  const password = document.forms["loginStaff"]["password"].value;
  const role = document.forms["loginStaff"]["roles"].value;

  const error = document.getElementById("form-error");

  if (email === "") {
    error.innerHTML = "Please enter your email address";
    return null;
  }

  if (password === "") {
    error.innerHTML = "Please enter a password";
    return null;
  }

  if (role === "") {
    error.innerHTML = "Please select your role"
  }

  const staffToken = JSON.parse(localStorage.getItem("staffToken")) || [];
  const staff = {};
  staff.email = email;
  staff.role = role;
  staffToken.push(staff)
  localStorage.setItem("staffToken", JSON.stringify(staffToken));
  localStorage.setItem("loggedInStaff", email)
  
  window.location.href = "../staff-dashboard/index.html"
}
