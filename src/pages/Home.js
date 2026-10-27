import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import products, { categories, collections } from "./Products";
import ProductCard from "../components/ProductCard";
import CategoryArt from "../components/CategoryArt";
import LeatherPanel from "../components/LeatherPanel";
import { SHOP_OPEN, DEMO } from "../config";
import { demoHeroImage } from "./sampleProducts";

// short points along the bottom edge of the hero
const POINTS = [
  { title: "Handmade in Nairobi", text: "Cut and stitched by hand" },
  { title: "Locally sourced", text: "Quality leather from Kenya" },
  { title: "Custom orders", text: "Made to your request" },
  ...(SHOP_OPEN ? [{ title: "Delivery across Kenya", text: "Fees shown at checkout" }] : []),
];

const CRAFT = [
  { title: "Sourced", text: "Quality hides, sourced locally here in Kenya." },
  { title: "Cut", text: "Every panel is cut by hand, one piece at a time." },
  { title: "Stitched", text: "Stitched by hand by the local artisans we work with." },
  { title: "Finished", text: "Edges and details finished so the piece lasts for years." },
];

const Home = () => (
  <>
    <section className="hero" style={DEMO ? { backgroundImage: `url(${demoHeroImage})` } : undefined}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>Leather goods, made by hand to be carried every day.</h1>
          <p className="hero-lead">
            Belts, wallets, purses, laptop sleeves, wash bags and key holders, cut and
            stitched by hand from locally sourced leather.
          </p>
          <div className="hero-ctas">
            <Link to="/shop" className="btn gold">Explore the collection</Link>
            <Link to="/contact" className="btn ghost-light">Custom orders</Link>
          </div>
        </div>
      </div>
      <ul className="wrap hero-points">
        {POINTS.map((pt) => (
          <li key={pt.title}>
            <strong>{pt.title}</strong>
            <span>{pt.text}</span>
          </li>
        ))}
      </ul>
    </section>

    <section className="section wrap">
      <div className="section-head center">
        <div>
          <h2 className="display">Shop by type</h2>
        </div>
      </div>
      <div className="type-grid">
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${c.slug}`} className={`type-tile ${c.image ? "has-img" : ""}`} style={{ "--tone": c.tone }}>
            {c.image ? <img src={c.image} alt="" /> : <CategoryArt slug={c.slug} />}
            <span className="type-label">
              <span className="type-name">{c.name}</span>
              <span className="type-cta">Shop now <FiArrowRight /></span>
            </span>
          </Link>
        ))}
      </div>
    </section>

    <section className="section wrap">
      <div className="coll-panel">
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
      </div>
    </section>

    {products.length > 0 && (
      <section className="section wrap">
        <div className="section-head">
          <h2 className="display">New in</h2>
          <Link to="/shop" className="text-link">View all <FiArrowRight /></Link>
        </div>
        <div className="prod-grid four">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    )}

    <section className="craft">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 className="display">From hide to your hands</h2>
          </div>
        </div>
        <ol className="craft-steps">
          {CRAFT.map((step, i) => (
            <li key={step.title}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="section wrap founder-quote">
      <div>
        <blockquote>
          “Luxury doesn't have to shout. It whispers through quality and intention.”
        </blockquote>
        <p>
          Jennifer Kosencha started Nula Leer to honour her heritage and work alongside
          local artisans: good leather, made in Kenya, at prices that make sense.
        </p>
        <p className="sig">Jennifer Kosencha, Founder</p>
        <Link to="/about" className="text-link">Read our story <FiArrowRight /></Link>
      </div>
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

export default Home;
