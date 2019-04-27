/* eslint-disable func-names */
/* eslint-disable require-jsdoc */
const client = JSON.parse(localStorage.getItem('client'));

(function () {
  const email = localStorage.getItem('token');
  if (!email) {
    window.location.href = '../index.html';
  }
  document.forms['create-account'].email.value = client.email;
  document.forms['create-account'].name.value = `${client.first_name} ${
    client.last_name
  }`;
}());

const validateForm = async () => {
  event.preventDefault();
  const openingBalance = document.forms['create-account'].openingBalance.value;
  const accountType = document.forms['create-account'].accountType.value;
  const error = document.getElementById('form-error');

  const data = { openingBalance, accountType };
  const strData = JSON.stringify(data);

  const url = 'http://localhost:2800/api/v1/accounts'
  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${client.token}`
    },
    body: strData
  };
  const response = await request(url, options);
  if (response.status !== 201) {
    error.innerHTML = response.error ? response.error : response.errors;
    return null;
  }
  window.location.href = '../client-dashboard/index.html';
};
