(function() {
  const email = localStorage.getItem("loggedInUser");
  const userArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  const user = userArray.find(item => item.email === email);
  const accNumber = user.accountNumber;

  const accHistory = JSON.parse(localStorage.getItem("accountHistory")) || [];

  const accHead = document.getElementById("account");
  accHead.innerHTML = accNumber;

  const history = document.getElementById("history");

  accHistory.map(function(item) {
    const ul = document.createElement("ul");
    history.appendChild(ul);
    if (item.accountNumber === accNumber) {
      Object.entries(item).forEach(function([key, value]) {
        ul.setAttribute("class", "history");
        const li = document.createElement("li");
        li.innerHTML = `${key}: ${value}`;
        ul.appendChild(li);
      });
    }
  });
})();
