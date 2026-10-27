import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { categories, collections } from "../pages/Products";
import { CONTACT, SHOP_OPEN } from "../config";

const Footer = () => (
  <footer className="footer">
    <div className="wrap footer-grid">
      <div className="footer-news">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="" />
          Nula Leer
        </Link>
        <p>Handmade leather goods from Nairobi, Kenya.</p>
        <Link to="/contact" className="btn sm footer-cta">Get in touch</Link>
      </div>

      <div>
        <h4>Shop</h4>
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${c.slug}`}>{c.name}</Link>
        ))}
      </div>

      <div>
        <h4>Collections</h4>
        {collections.map((c) => (
          <Link key={c.slug} to={`/collections/${c.slug}`}>{c.name}</Link>
        ))}
      </div>

      <div>
        <h4>Nula Leer</h4>
        <Link to="/about">Our story</Link>
        <Link to="/contact">Contact us</Link>
        <Link to="/contact">Custom orders</Link>
        {SHOP_OPEN && <Link to="/cart">Cart</Link>}
      </div>

      <div>
        <h4>Get in touch</h4>
        <a href={`mailto:${CONTACT.email}`} className="with-icon"><FiMail /> {CONTACT.email}</a>
        <a href={`tel:${CONTACT.phone}`} className="with-icon"><FiPhone /> {CONTACT.phoneDisplay}</a>
        <span className="with-icon"><FiMapPin /> {CONTACT.location}</span>
      </div>
    </div>

    <div className="wrap footer-base">
      <small>&copy; {new Date().getFullYear()} Nula Leer. Handmade in Kenya.</small>
    </div>
  </footer>
);

export default Footer;
