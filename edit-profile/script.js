const clientArray = JSON.parse(localStorage.getItem('clientsToken'));
const email = localStorage.getItem('loggedInUser');
const client = clientArray.find(item => item['Email'] === email);
const error = document.querySelectorAll('.form-error');
const success = document.querySelectorAll('.form-success');

(function() {
  if (!email) {
    window.location.href = '../index.html';
  }
  document.forms['edit-details']['email'].value = email;
  document.forms['edit-details']['name'].value = client['Name'];
})();

function editProfile() {
  success[1].innerHTML = '';
  error[1].innerHTML = '';
  event.preventDefault();
  const phone = document.forms['edit-details']['phone'].value;
  const address = document.forms['edit-details']['address'].value;
  const regex = /[^0-9]/g;

  if (!!phone.match(regex)) {
    error[0].innerHTML = 'Enter valid phone number';
    return null;
  }

  const userDetails = JSON.parse(localStorage.getItem('userDetails')) || [];
  const userObject = {};
  userObject['Phone'] = phone;
  userObject['Address'] = address;
  userObject['Name'] = client['Name'];
  userObject['Email'] = email;

  userDetails.push(userObject);
  localStorage.setItem('userDetails', JSON.stringify(userDetails));
  success[0].innerHTML = 'Your details have been saved successfully';
  phone.value = '';
  address.value = '';
}

function resetPassword() {
  success[1].innerHTML = '';
  error[1].innerHTML = '';
  event.preventDefault();
  const password = document.forms['reset-password']['password'].value;
  const password2 = document.forms['reset-password']['password2'].value;

  if (password !== password2) {
    error[1].innerHTML = 'Passwords do not match';
    return null;
  }

  client['Password'] = password;
  localStorage.setItem('clientsToken', JSON.stringify(clientArray));

  success[1].innerHTML = 'Your password has been reset';
}
