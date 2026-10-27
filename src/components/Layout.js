import React from "react";
import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import { FaWhatsapp } from "react-icons/fa";
import { SHOP_OPEN, CONTACT, whatsappLink } from "../config";

// Checkout gets a pared-back header and footer so nothing pulls the buyer away.
const CheckoutLayout = ({ children }) => (
  <>
    <header className="header co-header">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <img src="/logo-small.png" alt="" width="34" height="34" />
          Nula Leer
        </Link>
        <span className="secure"><FiLock /> Secure checkout</span>
      </div>
    </header>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="co-footer wrap">
      <small>&copy; {new Date().getFullYear()} Nula Leer</small>
      <Link to="/shop" className="under-link">Back to shop</Link>
    </footer>
  </>
);

// Wraps every page so the header/drawer/footer live in ONE place.
const Layout = ({ children, checkout = false }) =>
  checkout ? (
    <CheckoutLayout>{children}</CheckoutLayout>
  ) : (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      {SHOP_OPEN && <CartDrawer />}
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      {CONTACT.whatsapp && (
        <a
          href={whatsappLink("Hi Nula Leer, ")}
          className="wa-float"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          <FaWhatsapp />
        </a>
      )}
    </>
  );

export default Layout;
