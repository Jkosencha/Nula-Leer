import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import products, { collections } from "./Products";
import LeatherPanel from "../components/LeatherPanel";
import ProductCard from "../components/ProductCard";
import ComingSoon from "../components/ComingSoon";
import CollectionSet from "../components/CollectionSet";
import { SHOP_OPEN } from "../config";
import usePageTitle from "../usePageTitle";

const CollectionPage = () => {
  const { slug } = useParams();
  const collection = collections.find((c) => c.slug === slug);
  usePageTitle(collection?.name, collection?.tagline);
  const items = useMemo(() => products.filter((p) => p.collections?.includes(slug)), [slug]);

  if (!collection) {
    return (
      <div className="wrap empty" style={{ padding: "120px 0" }}>
        <h1>Collection not found</h1>
        <Link to="/collections" className="btn">See all collections</Link>
      </div>
    );
  }

  const others = collections.filter((c) => c.slug !== slug);

  return (
    <>
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/collections">Collections</Link>
          <span>/</span>
          <span aria-current="page">{collection.name}</span>
        </nav>
      </div>

      <section className="wrap coll-hero" style={{ "--tone": collection.tone }}>
        <div className="coll-hero-text">
          <h1>{collection.name}</h1>
          <p className="tagline">{collection.tagline}</p>
          <p className="muted">{collection.description}</p>
        </div>
        <LeatherPanel tone={collection.tone} art={collection.art} image={collection.image} alt={collection.name} />
      </section>

      <section className="wrap section">
        {items.length > 0 ? (
          SHOP_OPEN ? (
            <CollectionSet collection={collection} items={items} />
          ) : (
            <div className="prod-grid four">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )
        ) : (
          <ComingSoon name={collection.name} tone={collection.tone} />
        )}
      </section>

      <section className="wrap section">
        <h2 className="display center-title">More collections</h2>
        <div className="coll-mini-grid">
          {others.map((c) => (
            <Link key={c.slug} to={`/collections/${c.slug}`} className="coll-mini">
              <LeatherPanel tone={c.tone} art={c.art} image={c.image} alt={c.name} />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default CollectionPage;
