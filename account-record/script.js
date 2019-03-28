(function(){
  const record = JSON.parse(localStorage.getItem("acc"));
  const clientsArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  
  const account = document.getElementById("account");
  account.innerHTML = "Account record for client account number: " + record;

  const client = clientsArray.find(x => x.accNumber === record);
  const accountDetails = document.getElementById("accountDetails")
  const ul = document.createElement("ul");
  ul.setAttribute("class", "list");
  accountDetails.appendChild(ul)
  Object.entries(client).forEach(function([key, value]) {
    const li = document.createElement("li");
    li.innerHTML = `${key}: ${value}`;
    li.setAttribute("class", "item");
    ul.appendChild(li)
  })
})();

function goHome() {
  window.location.href = "../staff-dashboard/index.html"
}