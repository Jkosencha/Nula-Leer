import React, { useEffect, useState } from "react";
import { NavLink, Link, Routes, Route, useLocation } from "react-router-dom";
import { FiGrid, FiShoppingBag, FiBox, FiUsers, FiExternalLink, FiMenu, FiX } from "react-icons/fi";
import Overview from "./Overview";
import Orders from "./Orders";
import OrderDetail from "./OrderDetail";
import Products from "./Products";
import ProductForm from "./ProductForm";
import Customers from "./Customers";
import usePageTitle from "../usePageTitle";
import "./admin.css";

const NAV = [
  { to: "/admin", label: "Overview", icon: <FiGrid />, end: true },
  { to: "/admin/orders", label: "Orders", icon: <FiShoppingBag /> },
  { to: "/admin/products", label: "Products", icon: <FiBox /> },
  { to: "/admin/customers", label: "Customers", icon: <FiUsers /> },
];

// The whole admin area. Not linked from the shop; reached at /admin.
// No sign-in yet: that comes with the backend, and until then the data is
// sample data kept in this browser only.
const AdminApp = () => {
  usePageTitle("Admin");
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="admin">
      <aside className={`a-side ${navOpen ? "open" : ""}`}>
        <div className="a-brand">
          <Link to="/admin">Nula Leer</Link>
          <span>Admin</span>
        </div>
        <nav className="a-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              {n.icon} {n.label}
            </NavLink>
          ))}
        </nav>
        <a href="/" className="a-viewshop" target="_blank" rel="noreferrer">
          <FiExternalLink /> View shop
        </a>
      </aside>
      {navOpen && <div className="a-scrim" onClick={() => setNavOpen(false)} />}

      <div className="a-main">
        <header className="a-top">
          <button className="a-burger" aria-label={navOpen ? "Close menu" : "Open menu"} onClick={() => setNavOpen((v) => !v)}>
            {navOpen ? <FiX /> : <FiMenu />}
          </button>
          <p className="a-preview">
            Preview with sample data stored in this browser. Sign-in and live orders arrive with the backend.
          </p>
        </header>

        <div className="a-content">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="customers" element={<Customers />} />
            <Route path="*" element={<p className="a-muted">Page not found.</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;
