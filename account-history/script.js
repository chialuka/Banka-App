(function() {
  const email = localStorage.getItem("loggedInUser");
  const userArray = JSON.parse(localStorage.getItem("clientToken")) || [];
  const user = userArray.find(item => item.email === email);
  const accNumber = user.accNumber;

  const accHistory = JSON.parse(localStorage.getItem("accountHistory")) || [];

  const accHead = document.getElementById("account");
  accHead.innerHTML = accNumber;

  const history = document.getElementById("history");

  //remove mock data when data has been saved to local storage
  const mockData = [
    {
      accNumber: "1820689736",
      type: "credit",
      amount: 5000,
      balance: 25000
    },
    {
      accNumber: "1820689736",
      type: "debit",
      amount: 7000,
      balance: 18000
    }
  ];
  mockData.map(function(item) {
    const ul = document.createElement("ul");
    history.appendChild(ul);
    if (item.accNumber === accNumber) {
      Object.entries(item).forEach(function([key, value]) {
        ul.setAttribute("class", "history");
        const li = document.createElement("li");
        li.innerHTML = `${key}: ${value}`;
        ul.appendChild(li);
      });
    }
  });
})();

function goHome() {
  window.location.href = "../client-dashboard/index.html";
}
