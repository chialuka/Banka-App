/* eslint-disable require-jsdoc */
const slides = document.querySelectorAll('.slider .slide');
let currentSlide = 0;
const item = document.querySelector('.menu-items');
const error = document.getElementById('form-error');
const success = document.getElementById('form-success');

function carousel() {
  slides[currentSlide].className = 'slide';
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].className = 'slide showing';
  setTimeout(carousel, 3000);
}

if (slides.length > 0) {
  carousel();
}
function menuFunction(menu) {
  menu.classList.toggle('change');
  item.style.display = item.style.display === '' || item.style.display === 'none'
    ? 'block'
    : 'none';
}

const serverRequest = async (url, data) => {
  const stringifiedData = JSON.stringify(data);
  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: stringifiedData
  };

  const response = await request(url, options);
  if (response.status !== 201 && response.status !== 200) {
    error.innerHTML = response.error ? response.error : response.errors;
    return null;
  }
  if (!response.data[0].is_staff) {
    localStorage.setItem('client', JSON.stringify(response.data[0]));
    window.location.href = '../client-dashboard/index.html';
  } else {
    localStorage.setItem('staff', JSON.stringify(response.data[0]));
    window.location.href = '../staff-dashboard/index.html';
  }
};

const validateSignUpForm = () => {
  event.preventDefault();
  const firstname = document.forms['register-client'].firstname.value;
  const lastname = document.forms['register-client'].lastname.value;
  const email = document.forms['register-client'].email.value;
  const password = document.forms['register-client'].password.value;
  const password2 = document.forms['register-client'].password2.value;

  if (password !== password2) {
    error.innerHTML = 'Passwords do not match';
    return null;
  }
  const formData = {
    firstname,
    lastname,
    email,
    password
  };
  const url = 'http://localhost:2800/api/v1/users/auth/signup';
  return serverRequest(url, formData);
};

function validateLoginForm() {
  event.preventDefault();
  const email = document.forms['login-client'].email.value;
  const password = document.forms['login-client'].password.value;

  const data = {
    email,
    password
  };

  const url = 'http://localhost:2800/api/v1/users/auth/signin';

  return serverRequest(url, data);
}

const validateResetForm = async () => {
  event.preventDefault();
  const email = document.forms['reset-password'].email.value;

  const data = {
    email
  };

  const url = 'http://localhost:2800/api/v1/users/resetpassword';

  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(data)
  };

  const response = await request(url, options);
  if (response.status === 200) {
    const link = document.createElement('a');
    link.setAttribute('href', './change.html');
    link.setAttribute('class', 'reset');
    success.innerHTML = 'An OTP has been sent to your email.';
    link.innerHTML = ' Click here to change password';
    success.appendChild(link);
  } else {
    error.innerHTML = response.error;
  }
  return null;
};

const changePassword = async () => {
  event.preventDefault();
  const password = document.forms['change-password'].password.value;
  const password2 = document.forms['change-password'].password2.value;
  const otp = document.forms['change-password'].otp.value;

  if (password !== password2) {
    error.innerHTML = 'Passwords do not match';
  }
  const data = {
    otp,
    password
  };
  const options = {
    method: 'post',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(data)
  };

  const url = 'http://localhost:2800/api/v1/users/changepassword';

  const response = await request(url, options);
  if (response.status === 200) {
    success.innerHTML = `Password change successful.
    Please head over to the login page to login.`;
  } else {
    error.innerHTML = response.error || response.error;
  }
  return null;
};
