import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../usePageTitle";

const About = () => {
  usePageTitle("Our story", "The story behind Nula Leer, handmade leather goods from Nairobi.");
  return (
    <>
      <section className="about-hero">
        <div className="wrap">
          <h1>Leather goods from Nairobi, made by hand.</h1>
          <p className="lead">
            Nula Leer is a Kenyan leather brand making handcrafted goods that pair
            traditional craftsmanship with modern design.
          </p>
        </div>
      </section>

      <section className="section wrap story">
        <img
          src="/founder-heritage.jpg"
          alt="Jennifer Kosencha in a beaded headpiece, founder of Nula Leer"
          loading="lazy" decoding="async"
        />
        <div>
          <h2>Jennifer Kosencha</h2>
          <p>
            I'm Jennifer Kosencha, the founder of Nula Leer. I love culture, design and good
            craftsmanship, and I started this brand to honour my heritage and work with
            local artisans.
          </p>
          <p>
            The name comes from “N-orunk-ula”, my mother's name, joined with <i>leer</i>, the
            Dutch word for leather. We're starting with belts, wallets, purses, laptop
            sleeves, wash bags and key holders.
          </p>
        </div>
      </section>

      <section className="perks">
        <div className="wrap values">
          <div>
            <h3>Sourced locally</h3>
            <p>We buy our leather in Kenya and keep production close to home.</p>
          </div>
          <div>
            <h3>Made with artisans</h3>
            <p>Every piece is made with local artisans we work with directly.</p>
          </div>
          <div>
            <h3>Affordable quality</h3>
            <p>Good leather, honest prices, made to be used every day.</p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="cta-band">
          <div>
            <h2>Have a question or an idea?</h2>
            <p>Custom orders and collaborations are welcome.</p>
          </div>
          <Link to="/contact" className="btn light">Contact us</Link>
        </div>
      </section>
    </>
  );
};

export default About;
