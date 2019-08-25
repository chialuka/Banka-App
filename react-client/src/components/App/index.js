import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../NavBar';
import Register from '../Register';

const App = () => {
  axios.defaults.baseURL = process.env.SERVER_URL;

  return (<Router>
    <Navbar />
    <Route exact path='/register' component={Register} />
    {/* <Route exact path='/login' component={Login} /> */}
  </Router>)
};

export default App;
