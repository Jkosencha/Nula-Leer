import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import products from "./Products";
import { CartContext } from "./CartContext";

const CATEGORIES = ["All", "Wallets", "Belts", "Bags", "Accessories"];
const MIN_PRICE = 1000;
const MAX_PRICE = 4000;

const Shop = () => {
  const { addToCart } = useContext(CartContext);
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return products
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => p.price <= maxPrice)
      .sort((a, b) => {
        if (sort === "lowToHigh") return a.price - b.price;
        if (sort === "highToLow") return b.price - a.price;
        return 0;
      });
  }, [category, maxPrice, sort]);

  const quickAdd = (e, product) => {
    e.preventDefault();
    addToCart({ ...product, selectedColor: product.colors[0], quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  const rangePercent = ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <>
      <div className="wrap page-head">
        <span className="kicker">The Collection</span>
        <h1>Shop Nula Leer</h1>
      </div>

      <div className="wrap shop">
        <aside className={`sidebar ${showFilters ? "show" : ""}`}>
          <h3>Categories</h3>
          <ul>
            {CATEGORIES.map((c) => (
              <li
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </li>
            ))}
          </ul>

          <div className="price-filter">
            <h3>Filter by price</h3>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              value={maxPrice}
              style={{ "--p": `${rangePercent}%` }}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
            />
            <p className="vals">
              KSh {MIN_PRICE.toLocaleString()} – KSh {maxPrice.toLocaleString()}
            </p>
            <button onClick={() => setMaxPrice(MAX_PRICE)}>Reset</button>
          </div>
        </aside>

        <div className="shop-main">
          <div className="mobile-filters">
            <button onClick={() => setShowFilters((v) => !v)}>
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
          </div>

          <div className="top-bar">
            <p>
              Showing {filtered.length} result{filtered.length !== 1 && "s"}
            </p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default sorting</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>

          <div className="prod-grid">
            {filtered.map((p) => (
              <div className="card" key={p.id}>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
