[![Build Status](https://travis-ci.org/LukasChiama/Banka-App.svg?branch=develop)](https://travis-ci.org/LukasChiama/Banka-App)
[![Coverage Status](https://coveralls.io/repos/github/LukasChiama/Banka-App/badge.svg?branch=develop&service=github)](https://coveralls.io/github/LukasChiama/Banka-App?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/b682600a774a0549806f/maintainability)](https://codeclimate.com/github/LukasChiama/Banka-App/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b682600a774a0549806f/test_coverage)](https://codeclimate.com/github/LukasChiama/Banka-App/test_coverage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Banka App
Banka is a lightweight banking application that supports financial transactions for a single bank. The app allows users who could be Banka clients, Banka staff or admin to sign up, sign in and perform other transactions.

In addition to these basic functions, clients can open bank accounts. Staff can access all users as well as any single user account and can delete users as well. Staff can also credit and debit accounts. Admin, aside being able to do all this can also activate or deactivate bank accounts.

## Requirements
Banka was built with Node.js on the backend and Vanilla JavaScript on the frontend. The Node.js backend is powered by an [Express](https://expressjs.com) server.

To run Banka you will need to install [Node.js](http://nodejs.org) and [npm](https://www.npmjs.com/). The backend is written in ES2015 so [Babel](https://babeljs.io/) is needed to compile it.

## Installation
* Clone the repo
* Install dependencies
* Start the server

```bash
git clone git@github.com/LukasChiama/Banka-App
npm install
npm start
```

## Usage
Banka is hosted on Heroku [here](https://banka-platform.herokuapp.com/). Click on the link to access Banka easily.

You can also use Postman to make requests. A sample of [Postman requests](https://documenter.getpostman.com/view/5824922/S1ENyyag#intro) is published online as well. You can take a look at it to see examples of requests made to Banka and the responses gotten.

To use the API, make requests to the endpoints supported by Banka and get your responses as clear and concise JSON objects.

## Features
Make requests to the following endpoints:

1. POST - Sign Up [/api/v1/users/auth/signup](https://documenter.getpostman.com/view/5824922/S1ENyyag#b843b5f1-e098-4468-9274-b4df6a61d883)
2. POST - Sign In [/api/v1/users/auth/signin](https://documenter.getpostman.com/view/5824922/S1ENyyag#71a524ab-16af-4d42-b35f-ceae0609f92a)
3. GET - Get all users (requires staff token) [/api/v1/users](https://documenter.getpostman.com/view/5824922/S1ENyyag#375c022c-7337-4098-b5d0-19b957782640)
4. GET - Get single user (requires staff token) [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#c93321b2-cc11-4659-b779-aaa92f56a339)
5. PUT - Edit user details (requires user token) [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#569b1f4a-6b5c-46ae-8fdf-f3bfac5a25d6)
6. DELETE - Delete user (requires staff token) [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#0a2bffa4-1dc4-4736-aa75-2b5f0b898e36)
7. POST - Create bank account (requires user token) [/api/v1/accounts](https://documenter.getpostman.com/view/5824922/S1ENyyag#0149a2f1-be9b-4d3b-99cc-6c4e546d3748)
8. PATCH - Activate or deactivate account (requires admin token) [/api/v1/accounts/:accounts_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#ce38bfe8-6fd9-4cd7-880e-f707fef2f768)
9. DELETE - Delete bank account (requires staff token) [/api/v1/accounts/:accounts_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#ebaf56e7-fe43-47f9-89b2-642d52bceed1)
10. POST - Credit or debit an account (requires staff token) [/api/v1/transactions](https://documenter.getpostman.com/view/5824922/S1ENyyag#0149a2f1-be9b-4d3b-99cc-6c4e546d3748)



Sample sign up request:
```JSON
{
  "firstname":"Rihanna",
  "lastname": "Maduka",
  "email": "test@test.com",
  "password": "secret",
  "type": "staff",
  "isAdmin": true
}
```
Sample response
```JSON
{
  "status": 201,
  "data": {
    "firstname": "Rihanna",
    "lastname": "Maduka",
    "email": "test@test.com",
    "type": "staff",
    "isAdmin": true,
    "id": 308,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzA4LCJpYXQiOjE1NTUxMDQzODQsImV4cCI6MTU1NTEwNzk4NH0.FCLELkNiNK8aqtIFLSGzRo1GUzLRfjpwM2NNl3Su2ow"
    }
}
```

Sample debit transaction request:
```JSON
{
  "amount": 80000,
  "transactionType": "debit",
  "description": "Bride price",
  "cashierId": "1",
  "accountNumber": 5823931133
}
```
Sample response
```JSON
{
  "status": 403,
  "error": "User and token mismatch"
}
```

Click on the Postman [collection](https://documenter.getpostman.com/view/5824922/S1ENyyag#intro) to see more examples.

## Tests
```Bash
npm test
```

## License
Banka is available under the MIT license. See the LICENSE.md file for more details.
