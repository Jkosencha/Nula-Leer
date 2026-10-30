import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { getProduct, saveProduct, deleteProduct } from "./api";
import { categories, collections, colorNames } from "../pages/Products";
import { ConfirmDialog } from "./ui";

const EMPTY = {
  name: "",
  category: categories[0].slug,
  price: "",
  description: "",
  details: [],
  material: "",
  dimensions: "",
  colors: [],
  collections: [],
  images: [],
  image: "",
  availability: "stock",
  stock: "",
  madeToOrder: "",
  badge: "",
  featured: false,
};

// form state <-> product shape (see the product template in pages/Products.js)
const toForm = (p) => ({
  ...EMPTY,
  ...p,
  price: String(p.price ?? ""),
  availability: p.madeToOrder ? "made" : "stock",
  stock: p.stock ?? "",
  madeToOrder: p.madeToOrder ?? "",
  details: p.details || [],
  colors: p.colors || [],
  collections: p.collections || [],
  images: p.images || (p.image ? [p.image] : []),
});

const toProduct = (f) => {
  const images = f.images.map((s) => s.trim()).filter(Boolean);
  const product = {
    ...(f.id ? { id: f.id } : {}),
    name: f.name.trim(),
    category: f.category,
    price: Number(f.price),
    description: f.description.trim(),
    details: f.details.map((d) => d.trim()).filter(Boolean),
    colors: f.colors,
    collections: f.collections,
    images,
    image: images[0] || "",
  };
  if (f.material.trim()) product.material = f.material.trim();
  if (f.dimensions.trim()) product.dimensions = f.dimensions.trim();
  if (f.availability === "made" && f.madeToOrder !== "") product.madeToOrder = Number(f.madeToOrder);
  if (f.availability === "stock" && f.stock !== "") product.stock = Number(f.stock);
  if (f.badge.trim()) product.badge = f.badge.trim();
  if (f.featured) product.featured = true;
  return product;
};

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(isNew ? EMPTY : null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isNew) getProduct(id).then((p) => setForm(p ? toForm(p) : false));
  }, [id, isNew]);

  if (form === null) return <p className="a-muted">Loading…</p>;
  if (form === false) {
    return (
      <>
        <p>Product not found.</p>
        <Link to="/admin/products" className="a-link"><ArrowLeft size={16} /> Back to products</Link>
      </>
    );
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const saved = await saveProduct(toProduct(form));
    setSaving(false);
    toast.success(isNew ? "Product added." : "Changes saved.");
    if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true });
  };

  const remove = async () => {
    await deleteProduct(form.id);
    toast.info("Product deleted.");
    navigate("/admin/products");
  };

  return (
    <>
      <div className="a-head">
        <h1>{isNew ? "Add product" : form.name || "Edit product"}</h1>
      </div>

      <form className="a-form" onSubmit={submit}>
        <div className="a-grid-2 wide-left">
          <div className="a-stack">
            <section className="a-card">
              <h2>Basics</h2>
              <label className="a-field">
                <span>Name</span>
                <input value={form.name} onChange={set("name")} required />
              </label>
              <div className="a-row">
                <label className="a-field">
                  <span>Category</span>
                  <select value={form.category} onChange={set("category")}>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </label>
                <label className="a-field">
                  <span>Price (KSh)</span>
                  <input type="number" min="0" step="50" value={form.price} onChange={set("price")} required />
                </label>
              </div>
              <label className="a-field">
                <span>Description</span>
                <textarea rows="3" value={form.description} onChange={set("description")} required />
              </label>
              <label className="a-field">
                <span>Bullet points (one per line)</span>
                <textarea
                  rows="3"
                  value={form.details.join("\n")}
                  onChange={(e) => setForm({ ...form, details: e.target.value.split("\n") })}
                />
              </label>
              <div className="a-row">
                <label className="a-field">
                  <span>Material</span>
                  <input value={form.material} onChange={set("material")} placeholder="e.g. Full-grain cowhide" />
                </label>
                <label className="a-field">
                  <span>Size</span>
                  <input value={form.dimensions} onChange={set("dimensions")} placeholder="e.g. 35 × 25 cm" />
                </label>
              </div>
            </section>

            <section className="a-card">
              <h2>Photos</h2>
              <p className="a-muted small">
                One photo path per line; the first is the main photo. Photo uploads arrive with the backend;
                for now put files in public/products/ and enter e.g. /products/classic-belt-1.jpg.
              </p>
              <label className="a-field">
                <span>Photo paths</span>
                <textarea
                  rows="3"
                  value={form.images.join("\n")}
                  onChange={(e) => setForm({ ...form, images: e.target.value.split("\n") })}
                />
              </label>
              {form.images.some((s) => s.trim()) && (
                <div className="a-photos">
                  {form.images.filter((s) => s.trim()).map((src) => <img key={src} src={src.trim()} alt="" />)}
                </div>
              )}
            </section>
          </div>

          <div className="a-stack">
            <section className="a-card">
              <h2>Availability</h2>
              <div className="a-radios">
                <label><input type="radio" name="avail" checked={form.availability === "stock"} onChange={() => setForm({ ...form, availability: "stock" })} /> In stock</label>
                <label><input type="radio" name="avail" checked={form.availability === "made"} onChange={() => setForm({ ...form, availability: "made" })} /> Made to order</label>
              </div>
              {form.availability === "stock" ? (
                <label className="a-field">
                  <span>How many (0 = sold out)</span>
                  <input type="number" min="0" value={form.stock} onChange={set("stock")} />
                </label>
              ) : (
                <label className="a-field">
                  <span>Days to make</span>
                  <input type="number" min="1" value={form.madeToOrder} onChange={set("madeToOrder")} />
                </label>
              )}
            </section>

            <section className="a-card">
              <h2>Colours</h2>
              <div className="a-checks">
                {Object.entries(colorNames).map(([hex, name]) => (
                  <label key={hex}>
                    <input type="checkbox" checked={form.colors.includes(hex)} onChange={() => setForm({ ...form, colors: toggle(form.colors, hex) })} />
                    <span className="a-swatch" style={{ background: hex }} /> {name}
                  </label>
                ))}
              </div>
            </section>

            <section className="a-card">
              <h2>Collections</h2>
              <div className="a-checks">
                {collections.map((c) => (
                  <label key={c.slug}>
                    <input type="checkbox" checked={form.collections.includes(c.slug)} onChange={() => setForm({ ...form, collections: toggle(form.collections, c.slug) })} />
                    {c.name}
                  </label>
                ))}
              </div>
            </section>

            <section className="a-card">
              <h2>On the shop</h2>
              <label className="a-field">
                <span>Badge (optional)</span>
                <input value={form.badge} onChange={set("badge")} placeholder="e.g. New or Best seller" />
              </label>
              <label className="a-check">
                <input type="checkbox" checked={form.featured} onChange={set("featured")} /> Feature in the big rows on the shop page
              </label>
            </section>
          </div>
        </div>

        <div className="a-form-bar">
          {!isNew && <button type="button" className="a-btn danger" onClick={() => setConfirmDelete(true)}>Delete product</button>}
          <button type="submit" className="a-btn" disabled={saving}>{isNew ? "Add product" : "Save changes"}</button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete “${form.name}”?`}
        body="It's removed from the dashboard and can't be brought back."
        confirmLabel="Delete product"
        danger
        onConfirm={remove}
      />
    </>
  );
};

export default ProductForm;
