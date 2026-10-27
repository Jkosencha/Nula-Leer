import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import products, { categories, categoryName } from "../pages/Products";
import ProductImage from "./ProductImage";

const MAX_PRODUCTS = 5;

// Live matches under the header search box: categories first, then products.
const SearchSuggestions = ({ query }) => {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;

  const cats = categories.filter((c) => c.name.toLowerCase().includes(q));
  const matches = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      categoryName(p.category).toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  return (
    <div className="suggest" role="region" aria-label="Search suggestions">
      {cats.length === 0 && matches.length === 0 ? (
        <p className="suggest-empty">No matches for “{query.trim()}”.</p>
      ) : (
        <>
          {cats.length > 0 && (
            <div className="suggest-cats">
              {cats.map((c) => (
                <Link key={c.slug} to={`/shop?category=${c.slug}`} className="chip">{c.name}</Link>
              ))}
            </div>
          )}
          {matches.length > 0 && (
            <ul className="suggest-list">
              {matches.slice(0, MAX_PRODUCTS).map((p) => (
                <li key={p.id}>
                  <Link to={`/productDetails/${p.id}`}>
                    <span className="suggest-thumb"><ProductImage src={p.image} product={p} alt="" /></span>
                    <span className="suggest-name">
                      {p.name}
                      <small>{categoryName(p.category)}</small>
                    </span>
                    <span className="suggest-price">KSh {p.price.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/shop?q=${encodeURIComponent(query.trim())}`} className="suggest-all">
            See all results for “{query.trim()}” <FiArrowRight />
          </Link>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
