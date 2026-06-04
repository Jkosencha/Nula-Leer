import React from "react";
import Reveal from "../components/Reveal";

const About = () => (
  <>
    <div className="wrap page-head">
      <span className="kicker">Our Story</span>
      <h1>About Nula Leer</h1>
      <p className="sub">
        A Kenya-based leather house creating high-quality, handcrafted goods that blend
        traditional craftsmanship with modern design.
      </p>
    </div>

    <section className="block">
      <div className="wrap about-grid">
        <Reveal>
          <img className="media" src="/Kosencha.jpg" alt="Jennifer Kosencha, Founder" />
        </Reveal>
        <Reveal>
          <span className="kicker">Meet the Founder</span>
          <h2>Soul, style, and story.</h2>
          <p>
            I'm Jennifer Kosencha, the heart behind Nula Leer. With a deep love for culture,
            design, and quality craftsmanship, I started this journey to honour my heritage
            and empower local artisans.
          </p>
          <p>
            The name is inspired by “N-orunk-ula,” my mother's name, joined with <em>leer</em> —
            the Dutch word for leather. Our line spans wallets, purses, belts, and watch
            straps, with travel bags, backpacks, and handbags on the way.
          </p>
          <div className="sign">— Jennifer Kosencha</div>
        </Reveal>
      </div>
    </section>

    <section className="quote">
      <Reveal className="wrap">
        <span className="kicker">What we stand for</span>
        <p>
          “We prioritise sustainability — sourcing locally and empowering artisans through
          meaningful partnerships.”
        </p>
        <div className="by">Affordable luxury, made to last</div>
      </Reveal>
    </section>
  </>
);

export default About;
