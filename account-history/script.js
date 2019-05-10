const referrer = JSON.parse(localStorage.getItem('referrer')) || [];
const accHead = document.getElementById('account-title');
const history = document.getElementById('account-history');
const logo = document.querySelector('.a-logo');

const getRequestDetails = () => {
  if (referrer[0].clientToken) {
    logo.setAttribute('href',  '../client-dashboard/index.html');
    getHistory(referrer[0].clientToken);
  } else {
    logo.setAttribute('href',  '../account-record/index.html');
    getHistory(referrer[0].staffToken)
  }
}

function logOut(token) {
  localStorage.removeItem(token);
  window.location.href = '../index.html';
}
const getHistory = async (token) => {
  const accNumber = referrer[0].accountNumber;
  accHead.innerHTML = `Account History for: ${accNumber}`;

  const url = `https://banka-platform.herokuapp.com/api/v1/accounts/transactions/${Number(
    accNumber
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

  if (transactions.status === 401) {
    logOut();
  }

  const transactionDetails = `
    ${transactions.data.map(item => 
    `<ul class="history">
    ${Object.entries(item).map(([key, value]) =>
      `${key !== 'id' ? `<li>${key}: ${value}</li>` : ''}`
    ).join('')}
    </ul>`
    ).join('')}`;
  history.innerHTML= transactionDetails;

  if (transactions.data.length === 0) {
    const noHistory = document.getElementById('no-history');
    noHistory.innerHTML = "You don't have any transactions yet.";
  }
};

