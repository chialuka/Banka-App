(function() {
  const email = localStorage.getItem('loggedInUser');
  if (email) {
    window.location.href = '../client-dashboard/index.html';
  }
})();

function validateForm() {
  event.preventDefault();
  const email = document.forms['login-client']['email'].value;
  const password = document.forms['login-client']['password'].value;
  const role = document.forms['login-client']['roles'].value;

  const error = document.getElementById('form-error');

  if (role === 'Select Role') {
    error.innerHTML = 'Please select your role';
    return null;
  }

  if (role === 'Staff' || role === 'Admin') {
    const staffToken = JSON.parse(localStorage.getItem('staffToken')) || [];
    const staff = {};
    staff.email = email;
    staff.role = role;
    staffToken.push(staff);
    localStorage.setItem('staffToken', JSON.stringify(staffToken));
    localStorage.setItem('loggedInStaff', email);

    window.location.href = '../staff-dashboard/index.html';
  }

  if (role === 'Client') {
    const clientToken = JSON.parse(localStorage.getItem('clientToken')) || [];
    if (clientToken.some(item => item['Email'] === email)) {
      if (clientToken.find(item => item['Password'] === password)) {
        const client = clientToken.find(x => x['Email'] === email);
        const token = Math.floor(Math.random() * 100);
        client['Token'] = token;
        localStorage.setItem('loggedInUser', email);
        localStorage.setItem('clientToken', JSON.stringify(clientToken));
        window.location.href = '../client-dashboard/index.html';
      } else {
        error.innerHTML = 'Incorrect password';
      }
    } else {
      error.innerHTML = 'User does not exist. Do you mean to sign up?';
    }
  }
}
