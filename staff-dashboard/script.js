/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const staff = JSON.parse(localStorage.getItem('staff')) || [];

const options = {
  method: 'get',
  headers: {
    'content-type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${staff.token}`
  }
};

const url = 'https://banka-platform.herokuapp.com/api/v1/accounts';

function logOut() {
  localStorage.removeItem('staff');
  window.location.reload();
}

const displayAccounts = async () => {
  const accounts = document.getElementById('accounts');
  const response = (await fetch(url, options)).json();
  const allAccounts = await response;

  if (allAccounts.status === 401) {
    logOut();
  }
  allAccounts.data.map((item) => {
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list');
    accounts.appendChild(ul);
    const li = document.createElement('li');
    const p1 = document.createElement('p');
    const p2 = document.createElement('p')
    li.setAttribute('class', 'item');
    li.setAttribute('id', `'${item.id}'`);
    li.innerHTML = item.account_number;
    p1.innerHTML = `N${item.account_balance}`;
    p2.innerHTML = item.status;
    ul.appendChild(li);
    ul.appendChild(p1);
    ul.appendChild(p2);
    li.onclick = async function () {
      const clicked = document.getElementById(`${li.id}`);
      const id = Number(clicked.innerHTML);
      const accUrl = `https://banka-platform.herokuapp.com/api/v1/accounts/${id}`;
      const account = await request(accUrl, options);
      localStorage.setItem('account', JSON.stringify(account.data[0]));
      window.location.href = '../account-record/index.html';
    };
  });
};

(function () {
  const admin = document.getElementById('admin');

  if (!staff.token) {
    window.location.href = '../index.html';
  }
  if (staff.is_admin) {
    admin.style.display = 'block';
  }

  displayAccounts();
}());

