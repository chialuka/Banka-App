(function(){
  const accounts = document.getElementById("accounts")
  const user = localStorage.getItem("staffToken");

  if (!user) {
    window.location.href = "../staff-login/index.html"
  }

  const clients = JSON.parse(localStorage.getItem("clientToken"));

  clients.map(function(item) {
    const ul = document.createElement("ul");
    ul.setAttribute("class", "list")
    accounts.appendChild(ul)
    if (item.accountNumber) {
      const li = document.createElement("li");
      li.setAttribute("class", "item")
      li.innerHTML = item.accountNumber;
      ul.appendChild(li);

      li.onclick = function() {
        localStorage.setItem("acc", JSON.stringify(item.accountNumber));
        window.location.href = "../account-record/index.html"
      }
    }
  })
})();
