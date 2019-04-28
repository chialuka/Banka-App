/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const token = localStorage.getItem('clientToken');
const client = JSON.parse(localStorage.getItem('client'));
const error = document.getElementById('form-error');

const checkAccount = async () => {
  const account = document.getElementById('account');
  const accountHeading = document.getElementById('accountHeading');
  const transfer = document.getElementById('transfer');
  const airtime = document.getElementById('airtime');
  const newAccount = document.getElementById('new-account');

  if (!token) {
    window.location.href = '../index.html';
  }

  const { id } = client;

  const options = {
    method: 'get',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`
    }
  };

  const url = `http://localhost:2800/api/v1/users/accounts/${id}`;

  const response = (await fetch(url, options)).json();

  const accounts = await response;

  if (!accounts.data.length) {
    transfer.style.display = 'none';
    airtime.style.display = 'none';
    const link = document.createElement('a');
    link.setAttribute('href', '../client-create-account/index.html');
    link.setAttribute('class', 'link');
    account.innerHTML = "You haven't opened a bank account yet.";
    link.innerHTML = ' Click here to open one.';
    account.appendChild(link);
  } else {
    newAccount.style.display = 'none';
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'list');
    account.appendChild(ul);
    accounts.data.map((item) => {
      Object.entries(item).forEach(([key, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `${key}: ${value}`;
        li.setAttribute('class', 'item');
        ul.appendChild(li);
      });
      const senderAccount = item.account_number;
      localStorage.setItem('senderAccount', senderAccount);
    });
    accountHeading.innerHTML = 'Your account details:';
    const history = document.getElementById('history');
    history.style.display = 'block';
    const link = document.createElement('a');
    link.setAttribute('href', '../account-history/index.html');
    link.innerHTML = 'View history';
    history.appendChild(link);
  }
};

(function () {
  const firstName = client.first_name;
  const user = document.getElementById('user');
  const date = new Date();
  const time = date.getHours();

  if (time < 12) {
    user.innerHTML = `Good morning, ${firstName}`;
  }

  if (time > 11 && time < 17) {
    user.innerHTML = `Good afternoon, ${firstName}`;
  }

  if (time > 16) {
    user.innerHTML = `Good evening, ${firstName}`;
  }
  checkAccount();
}());

function logOut() {
  localStorage.removeItem('clientToken');
  location.reload();
}

async function sendData(url, data) {
  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${client.token}`
    },
    body: JSON.stringify(data)
  };

  const transfer = await request(url, options);
  console.log(transfer);
  if (transfer.status === 200) {
    error.innerHTML = transfer.message;
  } else {
    error.innerHTML = transfer.error || transfer.errors;
  }
}

async function transferFunds() {
  event.preventDefault();
  const receiverAccount = document.forms['transfer-funds'].receiver.value;
  const amount = document.forms['transfer-funds'].amount.value;
  const description = document.forms['transfer-funds'].description.value;
  const senderAccount = Number(localStorage.getItem('senderAccount'));

  const data = {
    receiverAccount,
    amount,
    description,
    senderAccount
  };

  const url = 'http://localhost:2800/api/v1/transfers';

  return sendData(url, data);
}

async function purchaseAirtime() {
  event.preventDefault();
  const phoneNumber = document.forms['buy-airtime'].phone.value;
  const amount = document.forms['buy-airtime'].amount.value;
  const senderAccount = Number(localStorage.getItem('senderAccount'));

  const data = {
    amount,
    phoneNumber,
    accountNumber: senderAccount
  };

  const url = 'http://localhost:2800/api/v1/airtime';

  return sendData(url, data);
}
