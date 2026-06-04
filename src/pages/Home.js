import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";
import products from "./Products";
import Reveal from "../components/Reveal";

const Home = () => {
  const { addToCart } = useContext(CartContext);

  const quickAdd = (e, product) => {
    e.preventDefault();
    addToCart({ ...product, selectedColor: product.colors[0], quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <>
      {/* announcement */}
      <div
        style={{
          background: "var(--espresso)",
          color: "#f0e4d2",
          textAlign: "center",
          fontSize: ".72rem",
          letterSpacing: ".24em",
          textTransform: "uppercase",
          padding: "9px 16px",
        }}
      >
        Free delivery within Nairobi CBD · Handcrafted in Kenya · New: Watch straps
      </div>

      {/* hero */}
      <header className="hero">
        <div className="wrap hero-grid">
          <Reveal>
            <div className="eyebrow">
              <span className="rule" />
              <span className="kicker">Handcrafted Leather · Est. Nairobi</span>
            </div>
            <h1>
              Leather that<br />carries a <em>story.</em>
            </h1>
            <p className="lead">
              Wallets, belts, and accessories cut and stitched by hand from locally
              sourced hides. Affordable luxury, built to outlast trends.
            </p>
            <div className="cta-row">
              <Link to="/shop" className="btn fill">Shop the collection</Link>
              <Link to="/about" className="btn ghost">Our story</Link>
            </div>
            <div className="stats">
              <div><div className="v">100%</div><div className="l">Handmade</div></div>
              <div><div className="v">Local</div><div className="l">Sourced hides</div></div>
              <div><div className="v">5★</div><div className="l">Crafted to last</div></div>
            </div>
          </Reveal>

          <Reveal className="hero-media">
            <img className="shot" src="/wallet1.jpeg" alt="Featured leather product" />
            <div className="stamp">GENUINE<br />LEATHER<br />· NL ·</div>
            <div className="tag">
              <div className="t">Classic Wallet</div>
              <div className="p">KSh 1,500</div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* marquee */}
      <div className="strip">
        <div className="marquee">
          <span><b>WALLETS</b> · <b>BELTS</b> · <b>PURSES</b> · <b>WATCH STRAPS</b> · <b>NOTEBOOKS</b> · <b>CARD HOLDERS</b> ·</span>
          <span><b>WALLETS</b> · <b>BELTS</b> · <b>PURSES</b> · <b>WATCH STRAPS</b> · <b>NOTEBOOKS</b> · <b>CARD HOLDERS</b> ·</span>
        </div>
      </div>

      {/* about band */}
      <section className="block">
        <div className="wrap about-grid">
          <Reveal>
            <img className="media" src="/logo-transparent.png" alt="Nula Leer workshop" />
          </Reveal>
          <Reveal>
            <span className="kicker">The House of Nula Leer</span>
            <h2>Tradition, stitched into every seam.</h2>
            <p>
              The name honours “N-orunk-ula,” my mother's name, joined with <em>leer</em> —
              Dutch for leather. Every piece blends Kenyan craftsmanship with quiet, modern design.
            </p>
            <p>
              We source quality hides locally and partner with local artisans, prioritising
              sustainability and fair work over fast fashion.
            </p>
            <div className="sign">— Jennifer Kosencha, Founder</div>
          </Reveal>
        </div>
      </section>

      {/* collection */}
      <section className="block coll">
        <div className="wrap">
          <Reveal className="head">
            <div>
              <span className="kicker">The Collection</span>
              <h2>Made by hand, made to keep.</h2>
            </div>
            <Link to="/shop">View all →</Link>
          </Reveal>

          <div className="prod-grid">
            {products.slice(0, 6).map((p) => (
              <Reveal key={p.id} className="card">
                <Link to={`/productDetails/${p.id}`} style={{ display: "contents" }}>
                  <div className="img"><img src={p.image} alt={p.name} /></div>
                  <div className="body">
                    <div className="cat">{p.category}</div>
                    <h3>{p.name}</h3>
                    <p className="desc">{p.description}</p>
                    <div className="foot">
                      <span className="price">KSh {p.price.toLocaleString()}</span>
                      <button className="add" onClick={(e) => quickAdd(e, p)}>Add +</button>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* quote */}
      <section className="quote">
        <Reveal className="wrap">
          <span className="kicker">Our Philosophy</span>
          <p>“Luxury doesn't have to shout. It whispers through quality and intention.”</p>
          <div className="by">Nula Leer</div>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
