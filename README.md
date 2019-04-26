[![Build Status](https://travis-ci.org/LukasChiama/Banka-App.svg?branch=develop)](https://travis-ci.org/LukasChiama/Banka-App)
[![Coverage Status](https://coveralls.io/repos/github/LukasChiama/Banka-App/badge.svg?branch=develop)](https://coveralls.io/github/LukasChiama/Banka-App?branch=develop)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b682600a774a0549806f/test_coverage)](https://codeclimate.com/github/LukasChiama/Banka-App/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/b682600a774a0549806f/maintainability)](https://codeclimate.com/github/LukasChiama/Banka-App/maintainability)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ce68d89786b940318d0c7f7557cda404)](https://www.codacy.com/app/LukasChiama/Banka-App?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=LukasChiama/Banka-App&amp;utm_campaign=Badge_Grade)
[![dependencies Status](https://david-dm.org/LukasChiama/Banka-App/status.svg)](https://david-dm.org/LukasChiama/Banka-App)
[![Known Vulnerabilities](https://snyk.io/test/github/LukasChiama/Banka-App/badge.svg?targetFile=package.json)](https://snyk.io/test/github/LukasChiama/Banka-App?targetFile=package.json)
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

The Banka UI is also hosted [here](https://lukaschiama.github.io/Banka-App/)

You can also use Postman to make requests. A sample of [Postman requests](https://documenter.getpostman.com/view/5824922/S1ENyyag#intro) is published online as well. You can take a look at it to see examples of requests made to Banka and the responses gotten.

To use the API, make requests to the endpoints supported by Banka and get your responses as clear and concise JSON objects.

## Features
Make requests to the following endpoints:

| Request Type    | Function    | Enpoint       | Postman Collection |
| ----------------|-------------|---------------|--------------------|
| POST            | Sign Up     | /api/v1/users/auth/signup |[/api/v1/users/auth/signup](https://documenter.getpostman.com/view/5824922/S1ENyyag#b843b5f1-e098-4468-9274-b4df6a61d883)|
| POST            | Sign In     | /api/v1/users/auth/signin | [/api/v1/users/auth/signin](https://documenter.getpostman.com/view/5824922/S1ENyyag#71a524ab-16af-4d42-b35f-ceae0609f92a) |
| GET             | Get all users | /api/v1/users | [/api/v1/users](https://documenter.getpostman.com/view/5824922/S1ENyyag#375c022c-7337-4098-b5d0-19b957782640) |
| GET             | Get single user | /api/v1/users/:user_id | [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#c93321b2-cc11-4659-b779-aaa92f56a339) |
| GET             | Get all accounts owned by a user | /api/v1/users/accounts/:id | [/api/v1/users/accounts/](https://documenter.getpostman.com/view/5824922/S1ENyyag#a74807e3-f4e1-4db9-992a-8d7b59f9780f)
| PUT             | Edit user details | /api/v1/users/:user_id | [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#569b1f4a-6b5c-46ae-8fdf-f3bfac5a25d6) |
| DELETE          | Delete user       | /api/v1/users/:user_id | [/api/v1/users/:user_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#0a2bffa4-1dc4-4736-aa75-2b5f0b898e36) |
| POST            | Create bank account | /api/v1/accounts | [/api/v1/accounts](https://documenter.getpostman.com/view/5824922/S1ENyyag#0149a2f1-be9b-4d3b-99cc-6c4e546d3748) |
| GET             | Get account details | /api/v1/accounts/:id | [/api/v1/accounts/:id](https://documenter.getpostman.com/view/5824922/S1ENyyag#b4e1cb2d-b1ab-40bd-a338-a8efdae44c96)
| GET             | Get all accounts    | /api/v1/accounts     | [/api/v1/accounts](https://documenter.getpostman.com/view/5824922/S1ENyyag#8b7844c6-414d-4171-8b6b-6bfd35b1bea7)
| GET             | Get active or dormant accounts | /api/v1/accounts/?status='' | [/api/v1/accounts/?status=dormant](https://documenter.getpostman.com/view/5824922/S1ENyyag#80cc105d-39d2-49a3-89f2-2b6fa6dc4796)
| PATCH           | Activate or deactivate account | /api/v1/accounts/:accounts_id | [/api/v1/accounts/:accounts_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#ce38bfe8-6fd9-4cd7-880e-f707fef2f768) |
| GET             | Get all transactions on an account | /api/v1/accounts/transactions/:id  | [/api/v1/accounts/transactions/:id](https://documenter.getpostman.com/view/5824922/S1ENyyag#fab0e90d-59ea-408b-90ef-52f4682b1b4b)
| DELETE          | Delete bank account        | /api/v1/accounts/:accounts_id | [/api/v1/accounts/:accounts_id](https://documenter.getpostman.com/view/5824922/S1ENyyag#ebaf56e7-fe43-47f9-89b2-642d52bceed1) |
| POST            | Credit or debit an account | /api/v1/transactions | [/api/v1/transactions](https://documenter.getpostman.com/view/5824922/S1ENyyag#0149a2f1-be9b-4d3b-99cc-6c4e546d3748) |
| GET             | Get all transactions       | /api/v1/transactions | [/api/v1/transactions](https://documenter.getpostman.com/view/5824922/S1ENyyag#73acf7ac-9ce0-4372-bfc6-dc08156be84c)
| GET             | Get a particular transaction | /api/v1/transactions/:id | [/api/v1/transactions/:id](https://documenter.getpostman.com/view/5824922/S1ENyyag#bd2ff9dc-7f2b-414c-9ce2-91209ef40647)
| POST            | Make a transfer             | /api/v1/transfers   | [/api/v1/transfers](https://documenter.getpostman.com/view/5824922/S1ENyyag#39a5fc0e-6aad-4f5a-b722-0deecef0f2c3)
| POST            | Make an airtime purchase    | /api/v1/airtime     | [/api/v1/airtime](https://documenter.getpostman.com/view/5824922/S1ENyyag#4d0e5413-6418-4d13-b470-b447f36ef679)



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
