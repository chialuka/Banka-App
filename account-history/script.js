(function() {
  const email = localStorage.getItem("loggedInUser");
  const userArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  const user = userArray.find(item => item.email === email);
  const accNumber = user.accNumber;

  const accHistory = JSON.parse(localStorage.getItem("accountHistory")) || [];

  const accHead = document.getElementById("account");
  accHead.innerHTML = accNumber;

  const history = document.getElementById("history");

  accHistory.map(function(item) {
    const ul = document.createElement("ul");
    if (item.accNumber === accNumber) {
      ul.setAttribute("class", "history")
      const li = document.createElement("li");
      li.innerHTML = item;
      ul.appendChild(li);
      history.appendChild(ul);
    }
  });
})();

function goHome() {
  window.location.href = "../client-dashboard/index.html"
}
