import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { CONTACT, DEMO, mailto, whatsappLink } from "../config";
import { demoContactImage } from "./sampleProducts";
import Select from "../components/Select";
import SocialIcons from "../components/SocialIcons";
import usePageTitle from "../usePageTitle";

const TOPICS = ["General question", "Custom order", "Wholesale / collaboration", "Product enquiry"].map(
  (t) => ({ value: t, label: t })
);

// A single card: photo on the left; on the right the ways to reach us
// beside a short form. No backend yet: the form builds an email and opens the
// visitor's mail app, addressed to us.
const Contact = () => {
  usePageTitle("Contact", "Get in touch with Nula Leer about orders, custom pieces or collaborations.");
  const [form, setForm] = useState({ name: "", topic: TOPICS[0].value, message: "" });
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = mailto(`${form.topic} — from ${form.name}`, `${form.message}\n\n— ${form.name}`);
  };

  return (
    <div className="wrap contact-page">
      <section className="contact-split">
        <div className="contact-photo">
          {DEMO && <img src={demoContactImage} alt="" />}
        </div>

        <div className="contact-body">
          <div className="contact-top">
            <h1>Contact</h1>
            <p className="muted">
              Questions about a piece, a custom order or a collaboration? Send us a note and
              we'll get back to you.
            </p>
          </div>

          <div className="contact-cols">
            <div>
              <h2>Reach us</h2>
              <dl className="reach">
                <dt>Email</dt>
                <dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd>
                <dt>Phone</dt>
                <dd><a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a></dd>
                {CONTACT.whatsapp && (
                  <>
                    <dt>WhatsApp</dt>
                    <dd>
                      <a href={whatsappLink("Hi Nula Leer, ")} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
                    </dd>
                  </>
                )}
                <dt>Based in</dt>
                <dd>{CONTACT.location}</dd>
                <dt>Follow us</dt>
                <dd><SocialIcons /></dd>
              </dl>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a message</h2>
              <label className="uline">
                <span>Full name</span>
                <input type="text" value={form.name} onChange={update("name")} autoComplete="name" required />
              </label>
              <div className="uline">
                <span>What's it about?</span>
                <Select
                  label="What's it about?"
                  options={TOPICS}
                  value={form.topic}
                  onChange={(topic) => setForm({ ...form, topic })}
                />
              </div>
              <label className="uline">
                <span>Message</span>
                <textarea rows="3" value={form.message} onChange={update("message")} required />
              </label>
              <button className="send-btn" type="submit">
                <span className="send-arrow"><FiArrowRight /></span>
                Send message
              </button>
              <p className="muted small">This opens your email app with your message ready to send.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
