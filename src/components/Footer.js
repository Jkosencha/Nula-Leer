import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="wrap">
      <Link to="/" className="brand">
        <span className="dot" /> Nula Leer
      </Link>
      <div className="fl">
        <Link to="/about">About</Link>
        <Link to="/shop">Shop</Link>
        <a href="#contact">Contact</a>
      </div>
      <small>&copy; {new Date().getFullYear()} Nula Leer. All rights reserved.</small>
      <small>Crafted with love and leather · Designed in Kenya 🇰🇪</small>
    </div>
  </footer>
);

export default Footer;
