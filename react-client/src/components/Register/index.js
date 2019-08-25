import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const Register = () => {
  const [userDetails, setUserDetails] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [registrationError, setRegistrationError] = useState('');

  const [registeredUser, setNewUser] = useState({});

  const validate = (e, data) => {
    const errors = {};

    if (data) {
      for (let [key, value] of Object.entries(data)) {
        if (!value) {
          errors[key] = 'invalid field';
          setValidationErrors(errors);
        }
      }
    } else {
      if (!e.target.value) {
        errors[e.target.name] = 'invalid field';
        setValidationErrors(errors);
      } else if (
        e.target.name == 'email' &&
        !/.+@.+\.[A-Za-z]+$/.test(e.target.value)
      ) {
        setValidationErrors({ email: 'invalid field' });
      } else if (
        e.target.name == 'confirmPassword' &&
        e.target.value !== password
      ) {
        setValidationErrors({ confirmPassword: 'invalid field' });
      } else {
        setValidationErrors({});
      }
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };

  const handleChange = e => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  const createUser = async () => {
    try {
      const { isValid } = validate(null, userDetails);
      if (!isValid) return null;
      const { confirmPassword, ...user } = userDetails;
      const { data: { data } } = await axios.post('/users/auth/signup', user);
      setNewUser(data);
      sessionStorage.setItem('newUser', JSON.stringify(data[0]))
    } catch (error) {
      const msg = error.response.data.error || error.response.data.errors[0];
      setRegistrationError(msg);
    }
  };

  const { firstname, lastname, email, password, confirmPassword } = userDetails;

  return (
    <div className="registration-page">
      <Paper elevation={6} className="paper">
        <Typography variant="h5" component="h3" className="register-heading">
          Register
        </Typography>
        {registrationError && (
          <p className="registration-error">{registrationError}</p>
        )}
        <TextField
          required
          type="text"
          label="First Name"
          name="firstname"
          value={firstname}
          onChange={handleChange}
          onBlur={validate}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {validationErrors.firstname && (
          <p className="registration-error">Please enter your first name</p>
        )}
        <TextField
          required
          label="Last Name"
          name="lastname"
          value={lastname}
          onChange={handleChange}
          onBlur={validate}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {validationErrors.lastname && (
          <p className="registration-error">Please enter your last name</p>
        )}
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
        {validationErrors.email && (
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
        {validationErrors.password && (
          <p className="registration-error">Please enter your password</p>
        )}
        <TextField
          required
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          onBlur={validate}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {validationErrors.confirmPassword && (
          <p className="registration-error">
            Confirm password must match password
          </p>
        )}
        <Button variant="contained" onClick={createUser} style={{ margin: 15 }}>
          Sign Up
        </Button>
        <div className="login-link">
          Have an account?<Link to="/login"> Login here</Link>
        </div>
      </Paper>
    </div>
  );
};

export default Register;
