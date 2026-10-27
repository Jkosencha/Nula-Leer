import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone } from "react-icons/fi";
import CategoryArt from "./CategoryArt";
import { CONTACT, mailto } from "../config";

// Shown for a category or collection that has no products yet.
const ComingSoon = ({ name, tone, art }) => (
  <div className="coming-soon" style={tone && { "--tone": tone }}>
    {art && <CategoryArt slug={art} />}
    <h2>{name ? `${name}: coming soon` : "Our first collection is coming soon"}</h2>
    <p className="muted">
      We're finishing the first pieces now. Want to be first in line, or have something
      specific in mind? Get in touch.
    </p>
    <div className="cs-actions">
      <a className="btn" href={mailto(name ? `Enquiry: ${name}` : "Enquiry", "Hi Nula Leer,\n\n")}>
        <FiMail /> Email us
      </a>
      <a className="btn outline" href={`tel:${CONTACT.phone}`}>
        <FiPhone /> {CONTACT.phoneDisplay}
      </a>
    </div>
    <Link to="/contact" className="link-btn">Or use the contact form</Link>
  </div>
);

export default ComingSoon;
