(function() {
  const email = localStorage.getItem('loggedInUser');
  const userArray = JSON.parse(localStorage.getItem('clientToken')) || [];
  const user = userArray.find(item => item['Email'] === email);
  const accNumber = user['Account Number'];

  const accHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];

  const accHead = document.getElementById('account');
  accHead.innerHTML = 'Account History for: ' + accNumber;

  const history = document.getElementById('history');
  let count = 0;

  accHistory.map(function(item) {
    if (item['Account Number'] === accNumber) {
      const ul = document.createElement('ul');
      history.appendChild(ul);
      count += 1;
      Object.entries(item).forEach(function([key, value]) {
        ul.setAttribute('class', 'history');
        const li = document.createElement('li');
        li.innerHTML = `${key}: ${value}`;
        ul.appendChild(li);
      });
    }
  });
  if (count === 0) {
    const noHistory = document.getElementById('no-history');
    noHistory.innerHTML = "You don't have any transactions yet.";
  }
})();
