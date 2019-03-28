(function(){
  const accounts = document.getElementById("accounts")
  const staff = JSON.parse(localStorage.getItem("staffToken")) || [];
  const admin = document.getElementById("admin")
  const email = localStorage.getItem("loggedInStaff");
  
  if (!email) {
    window.location.href = "../staff-login/index.html"
  }
  
  const user = staff.find(x => x.email === email)
  if (user.role === "Admin") {
    admin.style.display = "block"
  }

  const clients = JSON.parse(localStorage.getItem("clientToken")) || [];

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
