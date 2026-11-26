import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import products, { categories, collections } from "./Products";
import ProductCard from "../components/ProductCard";
import CategoryArt from "../components/CategoryArt";
import LeatherPanel from "../components/LeatherPanel";
import HeroSlider from "../components/HeroSlider";
import Reveal from "../components/Reveal";
import { DEMO } from "../config";
import { demoHeroImages } from "./sampleProducts";
import usePageTitle from "../usePageTitle";

// Home hero: one photo and message per slide. Swap the demo photos for your own
// by adding image: "/hero/belts.jpg" (file in public/hero/) to each slide.
const img = (key) => (DEMO ? demoHeroImages[key] : undefined);
const HERO_SLIDES = [
  {
    key: "welcome",
    label: "Handmade",
    image: img("welcome"),
    title: "Leather goods, made by hand to be carried every day.",
    text: "Cut and stitched in Nairobi from locally sourced leather.",
    cta: { to: "/shop", label: "Explore the collection" },
    cta2: { to: "/contact", label: "Custom orders" },
  },
  {
    key: "belts",
    label: "Belts",
    image: img("belts"),
    title: "Belts that soften and age with you.",
    text: "Full-grain leather and solid buckles, made to be worn for years.",
    cta: { to: "/shop?category=belts", label: "Shop belts" },
  },
  {
    key: "purses",
    label: "Purses",
    image: img("purses"),
    title: "Room for the essentials, and then some.",
    text: "Totes and purses that carry the day and look better for it.",
    cta: { to: "/shop?category=purses", label: "Shop purses" },
  },
  {
    key: "work",
    label: "Workday",
    image: img("work"),
    title: "Carry your work in leather.",
    text: "Laptop sleeves and card holders for the commute and the boardroom.",
    cta: { to: "/collections/workday", label: "See the Workday collection" },
  },
  {
    key: "weekend",
    label: "Weekender",
    image: img("weekend"),
    title: "Packed for two nights away.",
    text: "Wash bags and small leather goods for weekends upcountry.",
    cta: { to: "/collections/weekender", label: "See the Weekender collection" },
  },
];

const CRAFT = [
  { title: "Sourced", text: "Quality hides, sourced locally here in Kenya." },
  { title: "Cut", text: "Every panel is cut by hand, one piece at a time." },
  { title: "Stitched", text: "Stitched by hand by the local artisans we work with." },
  { title: "Finished", text: "Edges and details finished so the piece lasts for years." },
];

const Home = () => {
  usePageTitle();
  return (
    <>
      <HeroSlider slides={HERO_SLIDES} />

      <section className="section wrap">
        <Reveal className="section-head center">
          <div>
            <h2 className="display">Shop by type</h2>
          </div>
        </Reveal>
        <Reveal stagger className="type-grid">
          {categories.map((c) => (
            <Reveal.Item as={Link} key={c.slug} to={`/shop?category=${c.slug}`} className={`type-tile ${c.image ? "has-img" : ""}`} style={{ "--tone": c.tone }}>
              {c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" /> : <CategoryArt slug={c.slug} />}
              <span className="type-label">
                <span className="type-name">{c.name}</span>
                <span className="type-cta">Shop now <FiArrowRight /></span>
              </span>
            </Reveal.Item>
          ))}
        </Reveal>
      </section>

      <section className="section wrap">
        <Reveal className="coll-panel">
          <div className="coll-panel-text">
            <h2 className="display">Our collections</h2>
            <p className="muted">
              Pieces grouped for how you'll carry them: on safari, at work, away for the
              weekend, or wrapped as a gift.
            </p>
            <Link to="/collections" className="btn outline">See all collections</Link>
          </div>
          <div className="coll-panel-cards">
            {collections.slice(0, 3).map((c) => (
              <Link key={c.slug} to={`/collections/${c.slug}`} className="coll-card">
                <LeatherPanel tone={c.tone} art={c.art} image={c.image} alt="" />
                <span className="coll-card-label">
                  <span className="name">{c.name}</span>
                  <span className="coll-card-view">View</span>
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {products.length > 0 && (
        <section className="section wrap">
          <Reveal className="section-head">
            <h2 className="display">New in</h2>
            <Link to="/shop" className="text-link">View all <FiArrowRight /></Link>
          </Reveal>
          <Reveal stagger className="prod-grid four">
            {products.slice(0, 4).map((p) => (
              <Reveal.Item key={p.id}>
                <ProductCard product={p} />
              </Reveal.Item>
            ))}
          </Reveal>
        </section>
      )}

      <section className="craft">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <h2 className="display">From hide to your hands</h2>
            </div>
          </Reveal>
          <Reveal as="ol" stagger className="craft-steps">
            {CRAFT.map((step, i) => (
              <Reveal.Item as="li" key={step.title}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section wrap founder-quote">
        <Reveal>
          <blockquote>
            “Luxury doesn't have to shout. It whispers through quality and intention.”
          </blockquote>
          <p>
            Jennifer Kosencha started Nula Leer to honour her heritage and work alongside
            local artisans: good leather, made in Kenya, at prices that make sense.
          </p>
          <p className="sig">Jennifer Kosencha, Founder</p>
          <Link to="/about" className="text-link">Read our story <FiArrowRight /></Link>
        </Reveal>
      </section>

      {products.length === 0 && (
        <section className="wrap">
          <div className="cta-band">
            <div>
              <h2 className="display">The first collection is on its way</h2>
              <p>Want something now, or a piece made just for you? We'd love to hear from you.</p>
            </div>
            <Link to="/contact" className="btn gold">Get in touch</Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
