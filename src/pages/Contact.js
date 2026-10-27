import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { CONTACT, mailto } from "../config";

const TOPICS = ["General question", "Custom order", "Wholesale / collaboration", "Product enquiry"];

// No backend yet: the form builds an email and opens the visitor's mail app.
const Contact = () => {
  const [form, setForm] = useState({ name: "", topic: TOPICS[0], message: "" });
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = mailto(
      `${form.topic} — from ${form.name}`,
      `${form.message}\n\n— ${form.name}`
    );
  };

  return (
    <div className="wrap contact-page">
      <div className="contact-grid">
        <div>
          <h1>Get in touch</h1>
          <p className="lead">
            Questions, custom orders or collaborations: send a message and we'll get back
            to you.
          </p>

          <ul className="contact-list">
            <li>
              <FiMail />
              <div><span>Email</span><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
            </li>
            <li>
              <FiPhone />
              <div><span>Phone</span><a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a></div>
            </li>
            <li>
              <FiMapPin />
              <div><span>Based in</span>{CONTACT.location}</div>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Your name</span>
            <input type="text" value={form.name} onChange={update("name")} autoComplete="name" required />
          </label>
          <label className="field">
            <span>What's it about?</span>
            <select value={form.topic} onChange={update("topic")}>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Message</span>
            <textarea rows="6" value={form.message} onChange={update("message")} required />
          </label>
          <button className="btn" type="submit"><FiMail /> Send email</button>
          <p className="muted small">This opens your email app with your message ready to send.</p>
        </form>
      </div>
    </div>
  );
};

export default Contact;
