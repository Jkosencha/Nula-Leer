import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import { listProducts } from "./api";
import { categories, categoryName } from "../pages/Products";
import { availability } from "../availability";
import ProductImage from "../components/ProductImage";
import { PageHead, ksh } from "./ui";

const Products = () => {
  const [products, setProducts] = useState(null);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    listProducts().then(setProducts);
  }, []);

  if (!products) return <p className="a-muted">Loading…</p>;

  const term = q.trim().toLowerCase();
  const shown = products.filter(
    (p) => (category === "all" || p.category === category) && (!term || p.name.toLowerCase().includes(term))
  );

  return (
    <>
      <PageHead title="Products">
        <Link to="/admin/products/new" className="a-btn"><FiPlus /> Add product</Link>
      </PageHead>

      <div className="a-filters">
        <label className="a-search">
          <FiSearch />
          <input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="a-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <section className="a-card flush">
        {shown.length === 0 ? (
          <p className="a-empty">
            No products yet. <Link to="/admin/products/new" className="a-link">Add your first product</Link>
          </p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th className="num">Price</th><th>Availability</th><th>Shown as</th></tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const a = availability(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/admin/products/${p.id}`} className="a-prod">
                          <span className="a-thumb"><ProductImage src={p.image} product={p} alt="" /></span>
                          <span className="a-strong">{p.name}</span>
                        </Link>
                      </td>
                      <td>{categoryName(p.category)}</td>
                      <td className="num">{ksh(p.price)}</td>
                      <td>
                        {a ? (
                          <span className={`a-badge ${a.soldOut ? "off" : a.low ? "wait" : "done"}`}>{a.label}</span>
                        ) : (
                          <span className="a-muted">Not set</span>
                        )}
                      </td>
                      <td className="a-muted">
                        {[p.featured && "Featured", p.badge].filter(Boolean).join(" · ") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default Products;
