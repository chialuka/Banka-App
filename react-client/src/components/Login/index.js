import React, { useState, useReducer } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { userReducer, errorReducer } from '../../reducers';

const Login = () => {
  const [userDetails, setUserDetails] = useState({
    email: '',
    password: ''
  });

  const [user, dispatchSubmit] = useReducer(userReducer, {});

  const [errors, dispatchError] = useReducer(errorReducer, {});

  const validate = (e, data) => {
    if (data) {
      for (let [key, value] of Object.entries(data)) {
        if (!value) {
          dispatchError({ type: 'ERROR', key });
        }
      }
    } else {
      if (!e.target.value) {
        dispatchError({ type: 'ERROR', key: e.target.name });
      } else if (
        e.target.name == 'email' &&
        !/.+@.+\.[A-Za-z]+$/.test(e.target.value)
      ) {
        dispatchError({ type: 'ERROR', key: email });
      }
    }
  };

  const handleChange = e => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  const login = async () => {
    try {
      validate(null, userDetails);
      if (Object.keys(errors).length) return null;
      dispatchSubmit({ type: 'SUBMITTING' });
      const {
        data: { data }
      } = await axios.post('/users/auth/signin', userDetails);
      dispatchSubmit({ type: 'SUCCESS', data });
    } catch (error) {
      dispatchSubmit({ type: 'FAILURE', error });
    }
  };

  const { email, password } = userDetails;

  return (
    <div className="registration-page">
      {user.loading && <p>We are currently loading at the Niger</p>}
      <Paper elevation={6} className="paper">
        <Typography variant="h5" component="h3" className="register-heading">
          Login
        </Typography>
        {user.error && <p className="registration-error">{user.error}</p>}
        <TextField
          required
          type="email"
          label="Email Address"
          name="email"
          value={email}
          onChange={handleChange}
          onBlur={validate}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {errors.email && (
          <p className="registration-error">
            Please enter a valid email address
          </p>
        )}
        <TextField
          required
          type="password"
          label="Password"
          name="password"
          value={password}
          onChange={handleChange}
          onBlur={validate}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {errors.password && (
          <p className="registration-error">Please enter your password</p>
        )}
        <Button variant="contained" onClick={login} style={{ margin: 15 }}>
          Sign Up
        </Button>
        <div className="login-link">
          Don't have an account?
          <Link to="/register" className="link">
            {' '}
            Register here
          </Link>
        </div>
      </Paper>
    </div>
  );
};

export default Login;
