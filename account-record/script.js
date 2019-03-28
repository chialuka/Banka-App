(function() {
  const record = JSON.parse(localStorage.getItem("acc"));
  const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];

  const account = document.getElementById("account");
  account.innerHTML = "Account record for client account number: " + record;

  const client = clientsArray.find(x => x.accountNumber === record);
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

function creditAccount() {
  const amount = document.getElementById("amount").value;

  const record = JSON.parse(localStorage.getItem("acc"));
  const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  const client = clientsArray.find(x => x.accountNumber === record);
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

  const record = JSON.parse(localStorage.getItem("acc"));
  const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  const client = clientsArray.find(x => x.accountNumber === record);
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
  localStorage.setItem("clientToken", JSON.stringify(clientsArray));
  amount.value = "";
  location.reload();
}
