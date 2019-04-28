const email = localStorage.getItem('loggedInUser');
const users = JSON.parse(localStorage.getItem('clientsToken')) || [];
const findUser = users.find(item => item['Email'] === email);

(function() {
  const user = document.getElementById('user');
  const account = document.getElementById('account');
  const accountHeading = document.getElementById('accountHeading');

  if (!email) {
    window.location.href = '../index.html';
  }

  const date = new Date();
  const time = date.getHours();

  if (time < 12) {
    user.innerHTML = 'Good morning, ' + findUser['Name'];
  }

  if (time > 11 && time < 17) {
    user.innerHTML = 'Good afternoon, ' + findUser['Name'];
  }

  if (time > 16) {
    user.innerHTML = 'Good evening, ' + findUser['Name'];
  }

  if (!findUser['Account Number']) {
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
    Object.entries(findUser).forEach(function([key, value]) {
      const li = document.createElement('li');
      li.innerHTML = `${key}: ${value}`;
      li.setAttribute('class', 'item');
      ul.appendChild(li);
    });
    accountHeading.innerHTML = 'Your account details:';
    const history = document.getElementById('history');
    history.style.display = 'block';
    const link = document.createElement('a');
    link.setAttribute('href', '../account-history/index.html');
    link.innerHTML = 'View history';
    history.appendChild(link);
  }
})();

function logOut() {
  localStorage.removeItem('loggedInUser');
  location.reload();
}
