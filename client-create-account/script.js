const clientToken = JSON.parse(localStorage.getItem("clientToken")) || [];

(function() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) {
    window.location.href = "../landing-page/index.html";
  }
  const client = clientToken.find(item => item["Email"] === email);
  document.forms["create-account"]["email"].value = email;
  document.forms["create-account"]["name"].value = client["Name"];
}) ()


function validateForm() {
  event.preventDefault();
  const phone = document.forms["create-account"]["phone"].value;
  const account = document.forms["create-account"]["account"].value;
  const atm = document.forms["create-account"]["atm"].value;

  const regex = /[^0-9]/g;

  const error = document.getElementById("form-error");
 
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
  const client = clientToken.find(x => x["Email"] === email);

  let accountNumber = "";
  while (accountNumber.length < 10) {
    const accNum = Math.floor(Math.random() * 10);
    accountNumber += accNum;
    if (accountNumber.length === 10) {
      client["Account Number"] = accountNumber;
      client["Account Balance"] = 0;
      client["Account Type"] = account;
      client["Card Type"] = atm
      client["Activation Status"] = false;
      localStorage.setItem("clientToken", JSON.stringify(clientToken));
    }
  }
  window.location.href = "../client-dashboard/index.html";
}
