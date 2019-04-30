/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const record = JSON.parse(localStorage.getItem('account')) || [];
const staff = JSON.parse(localStorage.getItem('staff')) || [];
const activateAccountButton = document.getElementById('activate');
const error = document.getElementById('error');
let creditButton;
let debitButton;

(function () {
  const account = document.getElementById('account');
  account.innerHTML = `Account number: ${record.account_number}`;
  [creditButton, ...rest] = document.getElementsByClassName('credit');
  [debitButton, ...rest] = document.getElementsByClassName('debit');

  if (staff.is_admin) {
    activateAccountButton.style.display = 'block';
    if (record.status === 'dormant') {
      creditButton.disabled = true;
      debitButton.disabled = true;
      activateAccountButton.innerHTML = 'Activate Account';
    } else {
      creditButton.disabled = false;
      debitButton.disabled = false;
      activateAccountButton.innerHTML = 'Deactivate Account';
    }
  }

  const accountDetails = document.getElementById('account-details');
  const ul = document.createElement('ul');
  ul.setAttribute('class', 'list');
  accountDetails.appendChild(ul);
  Object.entries(record).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'owner' && key !== 'created_on') {
      const li = document.createElement('li');
      li.innerHTML = `${key}: ${value}`;
      li.setAttribute('class', 'item');
      ul.appendChild(li);
    }
  });
}());

const setAccountToStorage = async () => {
  const accountUrl = `https://banka-platform.herokuapp.com/api/v1/accounts/${record.id}`;
  const account = await request(accountUrl, {
    method: 'get',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${staff.token}`
    }
  });
  localStorage.setItem('account', JSON.stringify(account.data[0]));
  window.location.reload();
};

const options = {
  method: 'post',
  headers: {
    'content-type': 'application/json; charset = utf-8',
    Authorization: `Bearer ${staff.token}`
  }
};

const url = 'https://banka-platform.herokuapp.com/api/v1/transactions';

const makeCharge = async (data) => {
  const transactionData = {
    accountNumber: record.account_number,
    amount: Number(data.amount),
    description: data.description,
    transactionType: data.type,
    cashierId: staff.id
  };
  const strData = JSON.stringify(transactionData);
  options.body = strData;
  const jsonRes = (await fetch(url, options)).json();
  const response = await jsonRes;
  if (response.status === 201) {
    setAccountToStorage();
  } else {
    error.innerHTML = response.error ? response.error : response.errors;
  }
};

function creditAccount() {
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;

  const data = {
    amount,
    description,
    type: 'credit'
  };
  makeCharge(data);
}

function debitAccount() {
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;

  const data = {
    amount,
    description,
    type: 'debit'
  };
  makeCharge(data);
}

async function deleteAccount() {
  const deleteUrl = `https://banka-platform.herokuapp.com/api/v1/accounts/${Number(
    record.id
  )}`;
  const deleteOptions = {
    method: 'delete',
    headers: {
      'content-type': 'application/json; charset= utf-8',
      Authorization: `Bearer ${staff.token}`
    }
  };
  const requestDelete = await fetch(deleteUrl, deleteOptions);
  const deletedAccount = await requestDelete;
  localStorage.removeItem('account');
  window.location.href = '../staff-dashboard/index.html';
}

async function activateAccount() {
  const payload = {};
  payload.status = record.status === 'dormant' ? 'active' : 'dormant';
  const patchUrl = `https://banka-platform.herokuapp.com/api/v1/accounts/${record.id}`;
  const patchOptions = {
    method: 'put',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${staff.token}`
    },
    body: JSON.stringify(payload)
  };
  await request(patchUrl, patchOptions);
  setAccountToStorage();
  location.reload();
}
