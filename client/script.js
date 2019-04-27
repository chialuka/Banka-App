/* eslint-disable require-jsdoc */
const slides = document.querySelectorAll('.slider .slide');
let currentSlide = 0;
const item = document.querySelector('.menu-items');
const error = document.getElementById('form-error');

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
  const token = localStorage.setItem('token', response.data[0].token);
  if (response.data[0].is_staff) {
    window.location.href = '../staff-dashboard/index.html';
  }
  window.location.href = '../client-dashboard/index.html';
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
