import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, ExternalLink, LayoutGrid, List } from "lucide-react";
import { listProducts } from "./api";
import { categories, categoryName, colorNames } from "../pages/Products";
import { availability } from "../availability";
import ProductImage from "../components/ProductImage";
import DataTable from "./DataTable";
import { PageHead, RowMenu, ksh } from "./ui";

const readView = () => {
  try {
    return localStorage.getItem("admin.productsView") || "grid";
  } catch (e) {
    return "grid";
  }
};

// green available, amber low, red sold out; always with a text label
const stockTone = (a) => (!a ? "none" : a.soldOut ? "out" : a.low ? "low" : "ok");

const Swatches = ({ colors = [] }) => (
  <span className="a-swatches">
    {colors.slice(0, 4).map((c) => (
      <span key={c} className="a-swatch" style={{ background: c }} title={colorNames[c] || c} />
    ))}
    {colors.length > 4 && <span className="a-swatch more">+{colors.length - 4}</span>}
  </span>
);

const menuFor = (p, navigate) => (
  <RowMenu
    label={`Actions for ${p.name}`}
    items={[
      { label: "Edit", icon: <Pencil size={15} />, onSelect: () => navigate(`/admin/products/${p.id}`) },
      { label: "View in shop", icon: <ExternalLink size={15} />, href: `/product/${p.id}` },
    ]}
  />
);

const Spotlight = ({ p, navigate }) => {
  const a = availability(p);
  return (
    <article className="a-spot">
      <Link to={`/admin/products/${p.id}`} className="a-spot-img">
        <ProductImage src={p.image} product={p} alt="" eager />
      </Link>
      <div className="a-spot-body">
        <div className="a-spot-top">
          <span className="a-muted small">{categoryName(p.category)} · {p.colors?.length || 0} colours</span>
          {menuFor(p, navigate)}
        </div>
        <Link to={`/admin/products/${p.id}`} className="a-spot-name">{p.name}</Link>
        <p className="a-spot-desc">{p.description}</p>
      </div>
      <dl className="a-spot-facts">
        <div><dt>Price</dt><dd>{ksh(p.price)}</dd></div>
        <div><dt>Availability</dt><dd><span className={`a-stock ${stockTone(a)}`}>{a ? a.label : "Not set"}</span></dd></div>
        <div><dt>Colours</dt><dd><Swatches colors={p.colors} /></dd></div>
      </dl>
    </article>
  );
};

const Card = ({ p, navigate }) => {
  const a = availability(p);
  const tone = stockTone(a);
  return (
    <article className={`a-pcard ${tone === "out" ? "alert" : ""}`}>
      <div className="a-pcard-top">
        <Link to={`/admin/products/${p.id}`} className="a-pcard-img">
          <ProductImage src={p.image} product={p} alt="" eager />
        </Link>
        <div className="a-pcard-head">
          <span className="a-muted small">{categoryName(p.category)}</span>
          <Link to={`/admin/products/${p.id}`} className="a-pcard-name">{p.name}</Link>
        </div>
      </div>
      <div className="a-pcard-row">
        <span className={`a-stock ${tone}`}>{a ? a.label : "Availability not set"}</span>
        {menuFor(p, navigate)}
      </div>
      <dl className="a-pcard-facts">
        <div><dt>Price</dt><dd>{ksh(p.price)}</dd></div>
        <div><dt>Colours</dt><dd><Swatches colors={p.colors} /></dd></div>
      </dl>
    </article>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState(readView);

  useEffect(() => {
    listProducts().then(setProducts);
  }, []);

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem("admin.productsView", v);
    } catch (e) {
      // fine: it just won't be remembered
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <Link to={`/admin/products/${row.original.id}`} className="a-prod">
            <span className="a-thumb"><ProductImage src={row.original.image} product={row.original} alt="" /></span>
            <span className="a-strong">{row.original.name}</span>
          </Link>
        ),
      },
      { id: "category", header: "Category", accessorFn: (p) => categoryName(p.category) },
      { accessorKey: "price", header: "Price", cell: ({ getValue }) => ksh(getValue()), meta: { align: "right" } },
      {
        id: "availability",
        header: "Availability",
        accessorFn: (p) => (p.madeToOrder ? 1000 : p.stock ?? -1),
        cell: ({ row }) => {
          const a = availability(row.original);
          return <span className={`a-stock ${stockTone(a)}`}>{a ? a.label : "Not set"}</span>;
        },
      },
      {
        id: "shown",
        header: "Shown as",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="a-muted">{[row.original.featured && "Featured", row.original.badge].filter(Boolean).join(" · ") || "—"}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        meta: { className: "a-col-menu" },
        cell: ({ row }) => menuFor(row.original, navigate),
      },
    ],
    [navigate]
  );

  const shown = useMemo(() => {
    if (!products) return [];
    const term = q.trim().toLowerCase();
    return products.filter((p) => (category === "all" || p.category === category) && (!term || p.name.toLowerCase().includes(term)));
  }, [products, category, q]);

  if (!products) return <p className="a-muted">Loading…</p>;

  const spotlight = products.filter((p) => p.featured).slice(0, 2);
  const filtering = q || category !== "all";

  return (
    <>
      <PageHead title="Products" sub={`${products.length} products in the shop`}>
        <div className="a-view-toggle" role="group" aria-label="View">
          <button aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => changeView("grid")}>
            <LayoutGrid size={16} />
          </button>
          <button aria-pressed={view === "list"} aria-label="List view" onClick={() => changeView("list")}>
            <List size={16} />
          </button>
        </div>
        <Link to="/admin/products/new" className="a-btn"><Plus size={16} /> Add product</Link>
      </PageHead>

      {view === "grid" && !filtering && spotlight.length > 0 && (
        <div className="a-spots">
          {spotlight.map((p) => <Spotlight key={p.id} p={p} navigate={navigate} />)}
        </div>
      )}

      <div className="a-section-head">
        <h2>{filtering ? "Matching products" : "All products"}</h2>
        <div className="a-filters">
          <label className="a-search">
            <Search size={16} />
            <input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className="a-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="a-card a-empty">
          No products here. <Link to="/admin/products/new" className="a-link">Add a product</Link>
        </div>
      ) : view === "grid" ? (
        <div className="a-pgrid">
          {shown.map((p) => <Card key={p.id} p={p} navigate={navigate} />)}
        </div>
      ) : (
        <section className="a-card flush">
          <DataTable
            data={shown}
            columns={columns}
            getRowId={(p) => String(p.id)}
            label="Products"
            onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          />
        </section>
      )}
    </>
  );
};

export default Products;
