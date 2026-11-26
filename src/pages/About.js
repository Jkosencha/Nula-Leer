import React from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../usePageTitle";
import Reveal from "../components/Reveal";

const About = () => {
  usePageTitle("Our story", "The story behind Nula Leer, handmade leather goods from Nairobi.");
  return (
    <>
      <section className="about-hero">
        <Reveal className="wrap">
          <h1>Leather goods from Nairobi, made by hand.</h1>
          <p className="lead">
            Nula Leer is a Kenyan leather brand making handcrafted goods that pair
            traditional craftsmanship with modern design.
          </p>
        </Reveal>
      </section>

      <Reveal as="section" className="section wrap story">
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
      </Reveal>

      <section className="perks">
        <Reveal stagger className="wrap values">
          <Reveal.Item>
            <h3>Sourced locally</h3>
            <p>We buy our leather in Kenya and keep production close to home.</p>
          </Reveal.Item>
          <Reveal.Item>
            <h3>Made with artisans</h3>
            <p>Every piece is made with local artisans we work with directly.</p>
          </Reveal.Item>
          <Reveal.Item>
            <h3>Affordable quality</h3>
            <p>Good leather, honest prices, made to be used every day.</p>
          </Reveal.Item>
        </Reveal>
      </section>

      <section className="wrap">
        <Reveal className="cta-band">
          <div>
            <h2>Have a question or an idea?</h2>
            <p>Custom orders and collaborations are welcome.</p>
          </div>
          <Link to="/contact" className="btn light">Contact us</Link>
        </Reveal>
      </section>
    </>
  );
};

export default About;
