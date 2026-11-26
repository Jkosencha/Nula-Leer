import React, { useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";
import { FaWhatsapp } from "react-icons/fa";
import { SHOP_OPEN, CONTACT, whatsappLink } from "../config";
import useReveal from "../useReveal";

// New page: start at the top (unless the link points at a #section), fade in, set up scroll reveals.
const usePageEntrance = () => {
  const { pathname, hash } = useLocation();
  // before paint, so the new page never shows at the old scroll position
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  useReveal(pathname);
  return pathname;
};

// Checkout gets a pared-back header and footer so nothing pulls the buyer away.
const CheckoutLayout = ({ children }) => (
  <>
    <header className="header co-header">
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="Nula Leer, home">
          <img src="/brand/logo-espresso.png" alt="Nula Leer" width="86" height="46" />
        </Link>
        <span className="secure"><FiLock /> Secure checkout</span>
      </div>
    </header>
    <main id="main" tabIndex={-1} className="page-fade">{children}</main>
    <footer className="co-footer wrap">
      <small>&copy; {new Date().getFullYear()} Nula Leer</small>
      <Link to="/shop" className="under-link">Back to shop</Link>
    </footer>
  </>
);

// Wraps every page so the header/drawer/footer live in ONE place.
const Layout = ({ children, checkout = false }) => {
  const pathname = usePageEntrance();
  return checkout ? (
    <CheckoutLayout>{children}</CheckoutLayout>
  ) : (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      {SHOP_OPEN && <CartDrawer />}
      <main id="main" tabIndex={-1} className="page-fade" key={pathname}>{children}</main>
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
};

export default Layout;
