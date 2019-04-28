/* eslint-disable require-jsdoc */
async function validateForm() {
  event.preventDefault();
  const firstname = document.forms['login-staff'].firstname.value;
  const lastname = document.forms['login-staff'].lastname.value;
  const email = document.forms['login-staff'].email.value;
  const password = document.forms['login-staff'].password.value;
  const role = document.forms['login-staff'].roles.value;

  const error = document.getElementById('form-error');

  const isAdmin = role !== 'Staff';

  const newStaff = {
    firstname,
    lastname,
    email,
    password,
    isAdmin
  };

  const token = localStorage.getItem('staffToken');

  const url = 'http://localhost:2800/api/v1/staff/auth/signup';

  const options = {
    method: 'post',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(newStaff)
  };

  const resPromise = (await fetch(url, options)).json();
  const response = await resPromise;

  if (response.status === 201) {
    error.innerHTML = 'Creation successful';
    window.location.href = '../staff-dashboard/index.html';
  } else {
    error.innerHTML = response.error || response.errors;
  }
}
