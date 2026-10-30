import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import products, { categories } from "../pages/Products";
import { SHOP_OPEN } from "../config";
import SearchSuggestions from "./SearchSuggestions";

const Navbar = () => {
  const { cartItems, setDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false); // mobile menu: categories under "Shop"
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // stop the page scrolling behind the open mobile menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
          Nula Leer
        </Link>

        <nav className={`nav-links ${menuOpen ? "show" : ""}`}>
          <button className="icon-btn nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
          <div className="nav-group">
            <div className="nav-group-row">
              <NavLink to="/shop" end>Shop</NavLink>
              <button
                type="button"
                className={`nav-expand ${shopOpen ? "open" : ""}`}
                aria-expanded={shopOpen}
                aria-label="Show shop categories"
                onClick={() => setShopOpen((v) => !v)}
              >
                <FiChevronDown />
              </button>
            </div>
            <div className={`nav-sub ${shopOpen ? "open" : ""}`}>
              {categories.map((c) => (
                <Link key={c.slug} to={`/shop?category=${c.slug}`}>{c.name}</Link>
              ))}
            </div>
          </div>
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
        <div className="search-wrap">
          <form className="search-bar" onSubmit={submitSearch} role="search">
            <FiSearch />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search products"
              placeholder="Search wallets, belts, bags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
          </form>
          <SearchSuggestions query={query} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
