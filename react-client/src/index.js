import 'react-hot-loader';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));

module.hot.accept('./components/App', () => {
  const RootContainer = require('./components/App').default;
  render(<RootContainer />, document.getElementById('root'));
});

