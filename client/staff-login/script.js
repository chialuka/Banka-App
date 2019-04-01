function validateForm() {
  event.preventDefault();
  const email = document.forms["login-staff"]["email"].value;
  const role = document.forms["login-staff"]["roles"].value;

  const error = document.getElementById("form-error");


  if (role === "Select Role") {
    error.innerHTML = "Please select your role";
    return null
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
