import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { collections, collectionCount } from "./Products";
import LeatherPanel from "../components/LeatherPanel";
import usePageTitle from "../usePageTitle";

const Collections = () => {
  usePageTitle("Collections", "Nula Leer collections: pieces grouped for safari, work, weekends and gifts.");
  return (
    <>
      <div className="wrap page-intro">
        <h1>Pieces for every part of the journey</h1>
        <p className="lead">
          Our pieces grouped for how you'll use them: on the road, at work, away for the
          weekend, or wrapped as a gift.
        </p>
      </div>

      <div className="wrap coll-rows">
        {collections.map((c, i) => {
          const count = collectionCount(c.slug);
          return (
            <section key={c.slug} className={`coll-row ${i % 2 ? "flip" : ""}`}>
              <Link to={`/collections/${c.slug}`} className="coll-visual">
                <LeatherPanel tone={c.tone} art={c.art} image={c.image} alt={c.name} />
              </Link>
              <div className="coll-text">
                <p className="pill">{count > 0 ? `${count} ${count === 1 ? "piece" : "pieces"}` : "Coming soon"}</p>
                <h2 className="display">{c.name}</h2>
                <p className="tagline">{c.tagline}</p>
                <p className="muted">{c.description}</p>
                <Link to={`/collections/${c.slug}`} className="btn outline">
                  Explore {c.name} <FiArrowRight />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default Collections;
