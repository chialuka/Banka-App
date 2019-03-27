function validateForm() {
  event.preventDefault();
  const name = document.forms["createAccount"]["name"].value;
  const email = document.forms["createAccount"]["email"].value;
  const address = document.forms["createAccount"]["address"].value;
  const phone = document.forms["createAccount"]["phone"].value;
  const account = document.forms["createAccount"]["account"].value;
  const atm = document.forms["createAccount"]["atm"].value;

  const regex = /[^0-9]/g;

  const error = document.getElementById("form-error");

  const token = {};

  if (name === "") {
    error.innerHTML = "Name is required";
    return null;
  }
  if (email === "") {
    error.innerHTML = "Email is required";
    return null;
  }
  if (address === "") {
    error.innerHTML = "Address is required";
    return null;
  }
  if (phone === "") {
    error.innerHTML = "Phone number is required";
    return null;
  }
  if (!!phone.match(regex) || phone.length < 9) {
    error.innerHTML = "Enter valid phone number";
    return null;
  }
  if (account === "Select Account Type") {
    error.innerHTML = "Select account type";
    return null;
  }
  if (atm === "Select ATM Card Type") {
    error.innerHTML = "Select ATM Card type";
    return null;
  }
  
  let accountNumber = "";
  while (accountNumber.length < 10) {
    const accNum = Math.floor(Math.random() * 10);
    accountNumber += accNum;
    if (accountNumber.length === 10) {
      token.accNumber = accountNumber
      localStorage.setItem("user", JSON.stringify(token))
      return accountNumber
    }
  }

  window.location.href = "../clientDashboard/index.html";
}
