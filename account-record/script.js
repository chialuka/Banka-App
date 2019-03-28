const record = JSON.parse(localStorage.getItem("acc"));
const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];
const staffArray = JSON.parse(localStorage.getItem("staffToken")) || [];
const staffEmail = localStorage.getItem("loggedInStaff");
const client = clientsArray.find(x => x.accountNumber === record);
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
    if (client.activationStatus === false) {
      creditButton.disabled = true;
      debitButton.disabled = true;
      activateAccountButton.innerHTML = "Activate Account";
    } else {
      creditButton.disabled = false;
      debitButton.disabled = false;
      activateAccountButton.innerHTML = "Deactivate Account";
    }
  }

  const accountDetails = document.getElementById("accountDetails");
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

function goHome() {
  window.location.href = "../staff-dashboard/index.html";
}
/**
 * @name creditAccount
 * @returns {}
 */
function creditAccount() {
  const error = document.getElementById("error");

  const amount = document.getElementById("amount").value;

  let balance = client.accountBalance;
  client.accountBalance = Number(balance) + Number(amount);
  const transacts = JSON.parse(localStorage.getItem("accountHistory")) || [];
  const history = {};
  history.accountNumber = record;
  history.type = "credit";
  history.amount = amount;
  history.balance = balance;
  transacts.push(history);
  localStorage.setItem("accountHistory", JSON.stringify(transacts));
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  amount.value = "";
  location.reload();
}

function debitAccount() {
  const error = document.getElementById("error");

  const amount = document.getElementById("amount").value;

  let balance = client.accountBalance;
  if (balance <= 0 || balance < amount) {
    error.innerHTML = "Balance is too small. Ask customer to credit account";
    return null;
  }
  client.accountBalance = balance - amount;
  const transacts = JSON.parse(localStorage.getItem("accountHistory")) || [];
  const history = {};
  history.accountNumber = record;
  history.type = "dedit";
  history.amount = amount;
  history.balance = balance;
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
  if (client.activationStatus === true) {
    client.activationStatus = false;
  } else {
    client.activationStatus = true
  }
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  location.reload();
}
