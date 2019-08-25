import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <div className="nav-bar">
    <div className="nav-items">
      <div className="home-button">
        <Link to="/">
          <div>Banka</div>
        </Link>
      </div>
      <div className="nav-buttons">
        <Link to="/register">
          <div className="nav-item">Register</div>
        </Link>
        <Link to="/login">
          <div className="nav-item">Login</div>
        </Link>
      </div>
    </div>
    <div className="nav-line" />
  </div>
);

export default Navbar;
