import React from "react";
import Navbar from "./Navbar";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

// Wraps every page so the nav/contact/footer live in ONE place.
// Pass hideContact on pages that shouldn't show the contact band (e.g. checkout).
const Layout = ({ children, hideContact = false }) => (
  <>
    <Navbar />
    <main>{children}</main>
    {!hideContact && <ContactSection />}
    <Footer />
  </>
);

export default Layout;
