/* eslint-disable func-names */
(async function () {
  const account = JSON.parse(localStorage.getItem('account'));
  const token = localStorage.getItem('clientToken');

  const accHead = document.getElementById('account');
  accHead.innerHTML = `Account History for: ${account.account_number}`;

  const history = document.getElementById('history');

  const url = `http://localhost:2800/api/v1/accounts/transactions/${Number(
    account.id
  )}`;

  const options = {
    method: 'get',
    headers: {
      'content-type': 'application/json; charset:utf-8',
      Authorization: `Bearer ${token}`
    }
  };
  const response = (await fetch(url, options)).json();
  const transactions = await response;

  transactions.data.map((item) => {
    const ul = document.createElement('ul');
    history.appendChild(ul);
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_on') {
        ul.setAttribute('class', 'history');
        const li = document.createElement('li');
        li.innerHTML = `${key}: ${value}`;
        ul.appendChild(li);
      }
    });
  });
  if (transactions.data.length === 0) {
    const noHistory = document.getElementById('no-history');
    noHistory.innerHTML = "You don't have any transactions yet.";
  }
}());
