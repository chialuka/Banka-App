(function() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) {
    window.location.href = "../landing-page/index.html";
  }
  const clientArr = JSON.parse(localStorage.getItem("clientToken"));
  const client = clientArr.find(item => item.email === email);
  document.forms["create-account"]["email"].value = email;
  document.forms["create-account"]["name"].value = client.name;
}) ()


function validateForm() {
  event.preventDefault();
  const phone = document.forms["create-account"]["phone"].value;
  const account = document.forms["create-account"]["account"].value;
  const atm = document.forms["create-account"]["atm"].value;

  const regex = /[^0-9]/g;

  const error = document.getElementById("form-error");

  const clientToken = JSON.parse(localStorage.getItem("clientToken")) || [];

 
  if (!!phone.match(regex)) {
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

  const email = localStorage.getItem("loggedInUser");
  const client = clientToken.find(x => x.email === email);

  let accountNumber = "";
  while (accountNumber.length < 10) {
    const accNum = Math.floor(Math.random() * 10);
    accountNumber += accNum;
    if (accountNumber.length === 10) {
      client.accountNumber = accountNumber;
      client.accountBalance = 0;
      client.activationStatus = false;
      localStorage.setItem("clientToken", JSON.stringify(clientToken));
    }
  }
  window.location.href = "../client-dashboard/index.html";
}
