const record = JSON.parse(localStorage.getItem("acc"));
const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];
const staffArray = JSON.parse(localStorage.getItem("staffToken")) || [];
const staffEmail = localStorage.getItem("loggedInStaff");
const client = clientsArray.find(x => x["Account Number"] === record);
const staff = staffArray.find(x => x.email === staffEmail);
const activateAccountButton = document.getElementById("activate");
let creditButton
let debitButton

(function() {
  const account = document.getElementById("account");
  account.innerHTML = "Account record for client account number: " + record;
  const activateAccountButton = document.getElementById("activate");
  creditButton = document.getElementsByClassName("credit")[0]
  debitButton = document.getElementsByClassName("debit")[0]
    
  if (staff.role === "Admin") {
    activateAccountButton.style.display = "block";
    if (client["Activation Status"] === false) {
      creditButton.disabled = true;
      debitButton.disabled = true;
      activateAccountButton.innerHTML = "Activate Account";
    } else {
      creditButton.disabled = false;
      debitButton.disabled = false;
      activateAccountButton.innerHTML = "Deactivate Account";
    }
  }

  const accountDetails = document.getElementById("account-details");
  const ul = document.createElement("ul");
  ul.setAttribute("class", "list");
  accountDetails.appendChild(ul);
  Object.entries(client).forEach(function([key, value]) {
    const li = document.createElement("li");
    li.innerHTML = `${key}: ${value}`;
    li.setAttribute("class", "item");
    ul.appendChild(li);
  });
})();

/**
 * @name creditAccount
 * @returns {}
 */
function creditAccount() {
  const amount = document.getElementById("amount").value;

  client["Account Balance"] = Number(client["Account Balance"]) + Number(amount);
  let balance = client["Account Balance"];
  const transacts = JSON.parse(localStorage.getItem("accountHistory")) || [];
  const history = {};
  history["Account Number"] = record;
  history["Type"] = "credit";
  history["Amount"] = amount;
  history["Balance"] = balance;
  transacts.push(history);
  localStorage.setItem("accountHistory", JSON.stringify(transacts));
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  amount.value = "";
  location.reload();
}

function debitAccount() {
  const error = document.getElementById("error");

  const amount = document.getElementById("amount").value;

  if (client["Account Balance"] <= 0 || client["Account Balance"] < amount) {
    error.innerHTML = "Balance is too small. Ask customer to credit account";
    return null;
  }
  client["Account Balance"] = Number(client["Account Balance"]) - Number(amount);
  let balance = client["Account Balance"];
  const transacts = JSON.parse(localStorage.getItem("accountHistory")) || [];
  const history = {};
  history["Account Number"] = record;
  history["Type"] = "debit";
  history["Amount"] = amount;
  history["Balance"] = balance;
  transacts.push(history);
  localStorage.setItem("accountHistory", JSON.stringify(transacts));
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  amount.value = "";
  location.reload();
}

function deleteAccount() {
  client.accountNumber = "";
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  window.location.href = "../staff-dashboard/index.html";
}

function activateAccount() {
  if (client["Activation Status"] === true) {
    client["Activation Status"] = false;
  } else {
    client["Activation Status"] = true
  }
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  location.reload();
}
