/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const client = JSON.parse(localStorage.getItem('client')) || [];
const userAccounts = JSON.parse(localStorage.getItem('allAccounts')) || [];
const error = document.getElementById('form-error');
const success = document.querySelectorAll('.form-success');

function logOut() {
  localStorage.removeItem('client');
  window.location.href = '../index.html';
}

const mapAccountArray = (account, oneAccount) => {
  const node = document.querySelector('.list');
  if (node) {
    node.parentNode.removeChild(node);
  }
  const referrer = [
    {
      clientToken: client.token,
      accountNumber: oneAccount[0].account_number
    }
  ];
  localStorage.setItem('referrer', JSON.stringify(referrer));

  const accountDetails = `
  <a href="../account-history/index.html"><ul class="list">
  ${Object.entries(oneAccount[0])
    .map(
      ([key, value]) => `
      ${
  key === 'account_number'
    ? `<li class="item">Account Number: ${value}</li>`
    : ''
}
      ${
  key === 'account_type'
    ? `<li class="item">Account Type: ${value}</li>`
    : ''
}
      ${
  key === 'account_balance'
    ? `<li class="item">Account Balance: N${value}</li>`
    : ''
}
      ${key === 'status' ? `<li class="item">Status: ${value}</li>` : ''}
    `
    )
    .join('')}
    </ul></a>`;
  account.innerHTML = accountDetails;
};

const displayMultiple = (account, accounts) => {
  const accArr = [];
  accArr.push(accounts.data[0]);
  mapAccountArray(account, accArr);
  let counter = 0;
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  previous.style.display = 'block';
  next.style.display = 'block';
  previous.onclick = function () {
    counter = counter === 0 ? accounts.data.length - 1 : counter - 1;
    accArr.splice(0, 1, accounts.data[counter]);
    mapAccountArray(account, accArr);
  };
  next.onclick = function () {
    counter = counter === accounts.data.length - 1 ? 0 : counter + 1;
    accArr.splice(0, 1, accounts.data[counter]);
    mapAccountArray(account, accArr);
  };
};

const displayOneAccount = (account, accounts) => {
  mapAccountArray(account, accounts.data);
};

const displayAccounts = async (accounts) => {
  const account = document.getElementById('account');
  const transfer = document.getElementById('transfer');
  const airtime = document.getElementById('airtime');

  if (!accounts.data.length) {
    transfer.style.display = 'none';
    airtime.style.display = 'none';
    const link = `
    <a class="link" href="../client-create-account/index.html">
    Click here to open one.
    </a>
    `;
    account.innerHTML = `You haven't opened a bank account yet. ${link}`;
  }
  if (accounts.data.length === 1) {
    displayOneAccount(account, accounts);
  }
  if (accounts.data.length > 1) {
    displayMultiple(account, accounts);
  }
};

const checkAccount = async () => {
  const { id } = client;

  const options = {
    method: 'get',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${client.token}`
    }
  };

  const url = `https://banka-platform.herokuapp.com/api/v1/users/accounts/${id}`;
  const response = (await fetch(url, options)).json();
  const accounts = await response;

  if (accounts.status === 401) {
    logOut();
  } else {
    localStorage.setItem('allAccounts', JSON.stringify(accounts.data));
    displayAccounts(accounts);
  }
};

(function () {
  const firstName = client.first_name;
  const user = document.getElementById('user');
  const date = new Date();
  const time = date.getHours();

  if (!client.token) {
    window.location.href = '../index.html';
  }

  if (user) {
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
  }
}());

const sendData = async (url, data) => {
  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${client.token}`
    },
    body: JSON.stringify(data)
  };

  const transfer = await request(url, options);
  if (transfer.status === 200) {
    error.innerHTML = transfer.message;
  } else {
    error.innerHTML = transfer.error || transfer.errors;
  }
};

const dropDown = () => {
  const select = document.getElementById('select-account');
  const accounts = JSON.parse(localStorage.getItem('allAccounts'));
  accounts.map((account) => {
    Object.entries(account).forEach(([key, value]) => {
      const option = document.createElement('option');
      if (key === 'account_number') {
        option.innerHTML = `${value}`;
        select.appendChild(option);
      }
    });
  });
};

const transferFunds = async () => {
  event.preventDefault();
  const form = document.getElementById('transfer-funds');
  const receiverAccount = form.receiver.value;
  const amount = form.amount.value;
  const description = form.description.value;
  const senderAccount = form.sender.value;

  const data = {
    receiverAccount,
    amount,
    description,
    senderAccount
  };

  const url = 'https://banka-platform.herokuapp.com/api/v1/transfers';

  form.reset();
  return sendData(url, data);
};

const purchaseAirtime = async () => {
  event.preventDefault();
  const form = document.getElementById('buy-airtime');
  const phoneNumber = form.phone.value;
  const amount = form.amount.value;
  const senderAccount = form.sender.value;

  const data = {
    amount,
    phoneNumber,
    accountNumber: senderAccount
  };

  const url = 'https://banka-platform.herokuapp.com/api/v1/airtime';

  form.reset();
  return sendData(url, data);
};

const changeDetails = async (data) => {
  const options = {
    method: 'put',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${client.token}`
    },
    body: JSON.stringify(data)
  };

  const url = `https://banka-platform.herokuapp.com/api/v1/users/${client.id}`;

  const resPromise = (await fetch(url, options)).json();
  const response = await resPromise;
  return response;
};
const editProfile = async () => {
  event.preventDefault();

  const form = document.getElementById('edit-details');
  const firstname = form.firstname.value;
  const lastname = form.lastname.value;
  const email = form.email.value;

  const data = {
    firstname,
    lastname,
    email
  };

  const response = await changeDetails(data);

  if (response.status !== 200) {
    error[0].innerHTML = response.error || response.errors;
  } else {
    const user = {
      ...response.data[0],
      token: client.token
    };
    localStorage.setItem('client', JSON.stringify(user));
    success[0].innerHTML = 'Your details have been saved successfully';
  }

  form.reset();
};

const changePassword = async () => {
  event.preventDefault();
  const form = document.getElementById('change-password');
  const password = form.password.value;
  const password2 = form.password2.value;

  if (password !== password2) {
    error[1].innerHTML = 'Passwords do not match';
    return null;
  }

  const data = { password };

  const response = await changeDetails(data);

  if (response.status !== 200) {
    error[1].innerHTML = response.error || response.errors;
  } else {
    success[1].innerHTML = 'Your password has been changed';
  }
  form.reset();
};
