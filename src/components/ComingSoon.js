import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone } from "react-icons/fi";
import { CONTACT, mailto } from "../config";

// Shown for a category or collection that has no products yet:
// a soft blurred backdrop in the leather tone, "Coming" in script over a large faded "Soon".
const ComingSoon = ({ name, tone }) => (
  <section className="soon" style={tone && { "--tone": tone }}>
    <div className="soon-bg" aria-hidden="true" />

    <h2 className="soon-title">
      <span className="sr-only">Coming soon</span>
      <span className="soon-big" aria-hidden="true">Soon</span>
      <span className="soon-script" aria-hidden="true">Coming</span>
    </h2>

    {!name && <p className="soon-name">Our first collection</p>}
    <p className="soon-text">
      We're making the first pieces by hand right now. Want to be first in line, or have
      something specific in mind?
    </p>

    <div className="soon-actions">
      <a className="soon-pill" href={mailto(name ? `Enquiry: ${name}` : "Enquiry", "Hi Nula Leer,\n\n")}>
        <FiMail /> Email us
      </a>
      <a className="soon-pill" href={`tel:${CONTACT.phone}`}>
        <FiPhone /> {CONTACT.phoneDisplay}
      </a>
    </div>
    <Link to="/contact" className="soon-link">Or use the contact form</Link>
  </section>
);

export default ComingSoon;
