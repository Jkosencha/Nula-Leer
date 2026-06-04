import React from "react";
import { toast } from "react-toastify";
import Reveal from "./Reveal";

const ContactSection = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    e.target.reset();
    toast.success("Message sent — we'll be in touch soon.");
  };

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <Reveal>
          <span className="kicker">Let's Connect</span>
          <h2>For custom orders &amp; collaborations.</h2>
          <div className="det">
            <b>Email</b>
            <a href="mailto:info@nulaleer.com">info@nulaleer.com</a>
          </div>
          <div className="det">
            <b>Phone</b>
            <a href="tel:+254704239554">+254 704 239 554</a>
          </div>
          <div className="det">
            <b>Location</b>
            Nairobi, Kenya — Online based
          </div>
          <div className="socials">
            <a href="#" title="Instagram">IG</a>
            <a href="#" title="TikTok">TT</a>
            <a href="#" title="Twitter">X</a>
          </div>
        </Reveal>

        <Reveal>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Your name" required />
            <input type="email" name="email" placeholder="Your email" required />
            <textarea name="message" rows="5" placeholder="Your message…" required />
            <button className="btn fill" type="submit">Send message</button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
