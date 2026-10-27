import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiX, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import products, { categories, categoryName, colorNames } from "./Products";
import ProductCard from "../components/ProductCard";
import ComingSoon from "../components/ComingSoon";
import LeatherPanel from "../components/LeatherPanel";
import Select from "../components/Select";
import ProductImage from "../components/ProductImage";
import CategoryArt from "../components/CategoryArt";

const PER_PAGE = 12;

const PRICE_RANGES = [
  { id: "under-1000", label: "Under KSh 1,000", test: (p) => p < 1000 },
  { id: "1000-2500", label: "KSh 1,000 – 2,500", test: (p) => p >= 1000 && p <= 2500 },
  { id: "2500-4000", label: "KSh 2,500 – 4,000", test: (p) => p > 2500 && p <= 4000 },
  { id: "over-4000", label: "Over KSh 4,000", test: (p) => p > 4000 },
];

const SORTS = [
  { value: "default", label: "Featured" },
  { value: "lowToHigh", label: "Price: low to high" },
  { value: "highToLow", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

// "Filter by" dropdown; children is a function that receives close().
const FilterMenu = ({ label, active, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`fmenu ${open ? "open" : ""}`} ref={ref}>
      <button type="button" className="fmenu-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {label}
        {active > 0 && <span className="fcount">{active}</span>}
        <span className="select-caret" aria-hidden="true" />
      </button>
      {open && <div className="fmenu-panel">{children(() => setOpen(false))}</div>}
    </div>
  );
};

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

const Shop = () => {
  // category and search live in the URL so nav links and search can deep-link here
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const query = params.get("q") || "";

  const [colours, setColours] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

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

  // only offer colours and price ranges that exist in this category
  const colourOptions = useMemo(() => [...new Set(inCategory.flatMap((p) => p.colors || []))], [inCategory]);
  const rangeOptions = PRICE_RANGES.filter((r) => inCategory.some((p) => r.test(p.price)));

  useEffect(() => {
    setColours([]);
    setRanges([]);
  }, [category]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return inCategory
      .filter((p) => colours.length === 0 || p.colors?.some((c) => colours.includes(c)))
      .filter((p) => ranges.length === 0 || PRICE_RANGES.some((r) => ranges.includes(r.id) && r.test(p.price)))
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
  }, [inCategory, colours, ranges, sort, query]);

  useEffect(() => setPage(1), [category, query, colours, ranges, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = filtered.slice(start, start + PER_PAGE);

  const title = query ? `Results for “${query}”` : current ? current.name : "Shop";
  const hasFilters = colours.length > 0 || ranges.length > 0 || query;
  // banner slides: one per category, the current category first
  const bannerSlides = useMemo(
    () =>
      [current, ...categories.filter((c) => c !== current)]
        .filter(Boolean)
        .map((c) => ({ tone: c.tone, art: c.slug, image: c.image })),
    [current]
  );
  // one banner image at a time: cross-fade every few seconds, pause while hovered
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => setSlide(0), [current]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion || bannerSlides.length < 2) return;
    const timer = setInterval(() => setSlide((i) => (i + 1) % bannerSlides.length), 5500);
    return () => clearInterval(timer);
  }, [paused, bannerSlides.length]);

  // two-column feature rows under the listing: products marked `featured: true`
  const spotlights = category === "all" && !query ? products.filter((p) => p.featured).slice(0, 2) : [];

  const clearAll = () => {
    setColours([]);
    setRanges([]);
    setParam("q", "");
  };

  return (
    <>
      <section
        className="shop-banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="shop-banner-art">
          {bannerSlides.map((s, i) => (
            <div key={s.image || s.art} className={`banner-slide ${i === slide ? "on" : ""}`} aria-hidden="true">
              <LeatherPanel tone={s.tone} art={s.art} image={s.image} />
            </div>
          ))}
        </div>
        <div className="wrap shop-banner-inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            {current ? <Link to="/shop">Shop</Link> : <span aria-current="page">Shop</span>}
            {current && (
              <>
                <span>/</span>
                <span aria-current="page">{current.name}</span>
              </>
            )}
          </nav>
          <h1>{title}</h1>
          <p className="lead">
            {current ? current.description : "Handmade leather goods from Nairobi, cut and stitched by hand."}
          </p>
          {bannerSlides.length > 1 && (
            <div className="banner-dots">
              {bannerSlides.map((s, i) => (
                <button
                  key={s.image || s.art}
                  className={i === slide ? "on" : ""}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="wrap shop-page">
        <div className="filterbar">
          <div className="filterbar-left">
            <span className="muted">Filter by</span>
            <FilterMenu label="Category" active={current ? 1 : 0}>
              {(close) => (
                <ul className="fopts">
                  {[{ slug: "all", name: "All products" }, ...categories].map((c) => (
                    <li key={c.slug}>
                      <button
                        type="button"
                        className={category === c.slug ? "on" : ""}
                        onClick={() => {
                          setParam("category", c.slug === "all" ? "" : c.slug);
                          close();
                        }}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </FilterMenu>
            {colourOptions.length > 0 && (
              <FilterMenu label="Colour" active={colours.length}>
                {() => (
                  <ul className="fopts">
                    {colourOptions.map((c) => (
                      <li key={c}>
                        <label className="fcheck">
                          <input type="checkbox" checked={colours.includes(c)} onChange={() => setColours(toggle(colours, c))} />
                          <span className="sw" style={{ background: c }} />
                          {colorNames[c] || c}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </FilterMenu>
            )}
            {rangeOptions.length > 0 && (
              <FilterMenu label="Price" active={ranges.length}>
                {() => (
                  <ul className="fopts">
                    {rangeOptions.map((r) => (
                      <li key={r.id}>
                        <label className="fcheck">
                          <input type="checkbox" checked={ranges.includes(r.id)} onChange={() => setRanges(toggle(ranges, r.id))} />
                          {r.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </FilterMenu>
            )}
          </div>

          {inCategory.length > 0 && (
            <div className="filterbar-right">
              <div className="sort-select">
                <Select label="Sort products" options={SORTS} value={sort} onChange={setSort} />
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <div className="active-filters">
            {query && (
              <button className="chip on" onClick={() => setParam("q", "")}>“{query}” <FiX /></button>
            )}
            {colours.map((c) => (
              <button key={c} className="chip on" onClick={() => setColours(toggle(colours, c))}>
                {colorNames[c] || c} <FiX />
              </button>
            ))}
            {ranges.map((id) => (
              <button key={id} className="chip on" onClick={() => setRanges(toggle(ranges, id))}>
                {PRICE_RANGES.find((r) => r.id === id).label} <FiX />
              </button>
            ))}
            <button className="link-btn" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {inCategory.length === 0 && !query ? (
          <ComingSoon name={current?.name} tone={current?.tone} />
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h2>No products found</h2>
            <p className="muted">Try a different search or clear your filters.</p>
            <button className="btn" onClick={clearAll}>Clear filters</button>
          </div>
        ) : (
          <>
            <p className="muted small results-count">
              Showing {start + 1}–{start + visible.length} of {filtered.length}{" "}
              {filtered.length === 1 ? "product" : "products"}
            </p>
            <div className="prod-grid four">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}><FiArrowLeft /></button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={n === page ? "on" : ""} aria-current={n === page ? "page" : undefined} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
                <button aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)}><FiArrowRight /></button>
              </nav>
            )}
          </>
        )}
      </div>

      {spotlights.length > 0 && (
        <section className="spotlights">
          {spotlights.map((p, i) => {
            const cat = categories.find((c) => c.slug === p.category);
            const lifestyle = p.images?.find((img) => img !== p.image) || cat?.image;
            return (
              <div key={p.id} className={`spot ${i % 2 ? "flip" : ""}`}>
                <Link to={`/productDetails/${p.id}`} className="spot-product">
                  <div className="spot-img">
                    <ProductImage src={p.image} product={p} alt={p.name} />
                  </div>
                  <span className="spot-name">{p.name}</span>
                  <span className="spot-price">KSh {p.price.toLocaleString()}</span>
                </Link>
                <Link to={`/shop?category=${p.category}`} className="spot-lifestyle" style={{ "--tone": cat?.tone }}>
                  {lifestyle ? <img src={lifestyle} alt="" /> : <CategoryArt slug={p.category} />}
                  <span className="spot-label">
                    <span className="spot-cat">{cat?.name}</span>
                    <span className="spot-cta">Shop {cat?.name.toLowerCase()} <FiArrowRight /></span>
                  </span>
                </Link>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
};

export default Shop;
