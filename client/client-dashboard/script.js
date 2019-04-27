/* eslint-disable require-jsdoc */
/* eslint-disable func-names */
const token = localStorage.getItem('token');
const client = JSON.parse(localStorage.getItem('client'));

console.log(client);

const checkAccount = async () => {
  const account = document.getElementById('account');
  const accountHeading = document.getElementById('accountHeading');

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
    const link = document.createElement('a');
    link.setAttribute('href', '../client-create-account/index.html');
    link.setAttribute('class', 'link');
    account.innerHTML = "You haven't opened a bank account yet.";
    link.innerHTML = ' Click here to open one.';
    account.appendChild(link);
  } else {
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
  localStorage.removeItem('token');
  location.reload();
}
