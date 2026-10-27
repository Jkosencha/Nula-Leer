import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import products, { categories } from "../pages/Products";
import { SHOP_OPEN } from "../config";

const Navbar = () => {
  const { cartItems, setDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setQuery("");
  };

  return (
    <header className="header">
      <div className="nav-inner">
        <button className="icon-btn burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <FiMenu />
        </button>

        <Link to="/" className="brand">
          <img src="/logo.png" alt="" />
          Nula Leer
        </Link>

        <nav className={`nav-links ${menuOpen ? "show" : ""}`}>
          <button className="icon-btn nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
          <NavLink to="/shop" end>Shop</NavLink>
          {categories.map((c) => (
            <Link key={c.slug} to={`/shop?category=${c.slug}`} className="mobile-only">{c.name}</Link>
          ))}
          <NavLink to="/collections">Collections</NavLink>
          <NavLink to="/about">Our story</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

        <div className="nav-actions">
          {products.length > 0 && (
            <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              {searchOpen ? <FiX /> : <FiSearch />}
            </button>
          )}
          {SHOP_OPEN ? (
            <>
              <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
                <FiHeart />
                {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
              </Link>
              <button className="icon-btn" aria-label="Cart" onClick={() => setDrawerOpen(true)}>
                <FiShoppingBag />
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </button>
            </>
          ) : (
            <Link to="/contact" className="btn sm nav-cta">Get in touch</Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <form className="search-bar" onSubmit={submitSearch}>
          <FiSearch />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search wallets, belts, bags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      )}
    </header>
  );
};

export default Navbar;
