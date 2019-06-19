/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const staff = JSON.parse(localStorage.getItem('staff')) || [];
const buttons = document.querySelectorAll('button');

const options = {
  method: 'get',
  headers: {
    'content-type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${staff.token}`
  }
};

function logOut() {
  localStorage.removeItem('staff');
  window.location.reload();
}

const displayAccounts = async (allAccounts) => {
  const accounts = document.getElementById('accounts');
  window.viewRecord = async (id) => {
    const accUrl = `https://banka-platform.herokuapp.com/api/v1/accounts/${id}`;
    const account = await request(accUrl, options);
    if (account.status === 401) {
      logOut();
      return;
    }
    localStorage.setItem('account', JSON.stringify(account.data[0]));
    window.location.href = '../account-record/index.html';
  };

  const accountDetails = `
  ${allAccounts.data
    .map(
      item => `<ul class="list">
        <li class="item" onclick='viewRecord(${item.id})'>
        ${item.account_number}
        </li>
        <p>N${item.account_balance}</p>
        <p>${item.status}</p>
    </ul>`
    )
    .join('')}
  `;
  accounts.innerHTML = accountDetails;
};

const fetchAccounts = async (url, text) => {
  Object.values(buttons).map(button => (button.innerHTML === `${text}`
    ? (button.style.display = 'none')
    : (button.style.display = 'block')));
  const response = (await fetch(url, options)).json();
  const allAccounts = await response;
  const ul = document.querySelectorAll('.list');
  if (ul) {
    Object.values(ul).map(item => item.parentNode.removeChild(item));
  }

  if (allAccounts.status === 401) {
    logOut();
  }

  displayAccounts(allAccounts);
};

const getAllAccounts = async () => {
  const url = 'https://banka-platform.herokuapp.com/api/v1/accounts';
  fetchAccounts(url, 'All Accounts');
};

const getActive = async () => {
  const url = 'https://banka-platform.herokuapp.com/api/v1/accounts?status=active';
  fetchAccounts(url, 'Active Accounts');
};

const getDormant = async () => {
  const url = 'https://banka-platform.herokuapp.com/api/v1/accounts?status=dormant';
  fetchAccounts(url, 'Dormant Accounts');
};

(function () {
  const admin = document.getElementById('admin');

  if (!staff.token) {
    window.location.href = '../index.html';
  }
  if (staff.is_admin) {
    admin.style.display = 'block';
  }
  getAllAccounts();
}());
