import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSliders, FiX } from "react-icons/fi";
import products, { categories, categoryName } from "./Products";
import ProductCard from "../components/ProductCard";
import ComingSoon from "../components/ComingSoon";

const MIN_PRICE = 500;
const MAX_PRICE = Math.max(4000, ...products.map((p) => p.price));

const Shop = () => {
  // category and search live in the URL so nav links and search can deep-link here
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const query = params.get("q") || "";

  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const current = categories.find((c) => c.slug === category);
  const inCategory = useMemo(
    () => products.filter((p) => category === "all" || p.category === category),
    [category]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return inCategory
      .filter((p) => p.price <= maxPrice)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          categoryName(p.category).toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sort === "lowToHigh") return a.price - b.price;
        if (sort === "highToLow") return b.price - a.price;
        if (sort === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [inCategory, maxPrice, sort, query]);

  const rangePercent = ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const title = query ? `Results for “${query}”` : current ? current.name : "Shop all";

  const resetAll = () => {
    setParams({});
    setMaxPrice(MAX_PRICE);
  };

  return (
    <div className="wrap shop-page">
      <div className="shop-head">
        <h1>{title}</h1>
        {inCategory.length > 0 && (
          <p className="muted">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>
        )}
      </div>
      {current && <p className="muted cat-desc">{current.description}</p>}

      <div className="chips">
        {[{ slug: "all", name: "All" }, ...categories].map((c) => (
          <button
            key={c.slug}
            className={`chip ${category === c.slug ? "on" : ""}`}
            onClick={() => setParam("category", c.slug === "all" ? "" : c.slug)}
          >
            {c.name}
          </button>
        ))}
        {query && (
          <button className="chip on" onClick={() => setParam("q", "")}>
            “{query}” <FiX />
          </button>
        )}
      </div>

      {inCategory.length === 0 && !query ? (
        <ComingSoon name={current?.name} tone={current?.tone} art={current?.slug} />
      ) : (
        <>
          <div className="toolbar">
            <button className="btn outline sm filter-toggle" onClick={() => setShowFilters((v) => !v)}>
              <FiSliders /> Filters
            </button>
            <label className="sort">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Featured</option>
                <option value="lowToHigh">Price: low to high</option>
                <option value="highToLow">Price: high to low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </label>
          </div>

          <div className="shop-layout">
            <aside className={`filters ${showFilters ? "show" : ""}`}>
              <div className="filter-group">
                <h3>Price</h3>
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={100}
                  value={maxPrice}
                  style={{ "--p": `${rangePercent}%` }}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                />
                <p className="muted small">Up to KSh {maxPrice.toLocaleString()}</p>
              </div>
              <button className="link-btn" onClick={resetAll}>Clear all filters</button>
            </aside>

            <div className="shop-results">
              {filtered.length === 0 ? (
                <div className="empty">
                  <h2>No products found</h2>
                  <p className="muted">Try a different search or clear your filters.</p>
                  <button className="btn" onClick={resetAll}>Clear filters</button>
                </div>
              ) : (
                <div className="prod-grid">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Shop;
