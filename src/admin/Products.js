import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, ExternalLink } from "lucide-react";
import { listProducts } from "./api";
import { categories, categoryName } from "../pages/Products";
import { availability } from "../availability";
import ProductImage from "../components/ProductImage";
import DataTable from "./DataTable";
import { PageHead, RowMenu, ksh } from "./ui";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    listProducts().then(setProducts);
  }, []);

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
          return a ? (
            <span className={`a-badge ${a.soldOut ? "off" : a.low ? "wait" : "done"}`}>{a.label}</span>
          ) : (
            <span className="a-muted">Not set</span>
          );
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
        cell: ({ row }) => (
          <RowMenu
            label={`Actions for ${row.original.name}`}
            items={[
              { label: "Edit", icon: <Pencil size={15} />, onSelect: () => navigate(`/admin/products/${row.original.id}`) },
              { label: "View in shop", icon: <ExternalLink size={15} />, href: `/product/${row.original.id}` },
            ]}
          />
        ),
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

  return (
    <>
      <PageHead title="Products" sub={`${products.length} products in the shop`}>
        <Link to="/admin/products/new" className="a-btn"><Plus size={16} /> Add product</Link>
      </PageHead>

      <section className="a-card flush">
        <div className="a-toolbar">
          <label className="a-search">
            <Search size={16} />
            <input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select className="a-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <DataTable
          data={shown}
          columns={columns}
          getRowId={(p) => String(p.id)}
          label="Products"
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          empty={
            <>
              No products here. <Link to="/admin/products/new" className="a-link">Add a product</Link>
            </>
          }
        />
      </section>
    </>
  );
};

export default Products;
