import React from "react";
import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import { SHOP_OPEN } from "../config";

// Checkout gets a pared-back header and footer so nothing pulls the buyer away.
const CheckoutLayout = ({ children }) => (
  <>
    <header className="header co-header">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="" />
          Nula Leer
        </Link>
        <span className="secure"><FiLock /> Secure checkout</span>
      </div>
    </header>
    <main>{children}</main>
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
      <Navbar />
      {SHOP_OPEN && <CartDrawer />}
      <main>{children}</main>
      <Footer />
    </>
  );

export default Layout;
