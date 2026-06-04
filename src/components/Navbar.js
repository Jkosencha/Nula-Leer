import React, { useContext, useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { CartContext } from "../pages/CartContext";

const Navbar = () => {
  const { cartItems } = useContext(CartContext);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`nav ${solid ? "solid" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="dot" /> Nula Leer
        </Link>

        <ul className={`nav-links ${open ? "show" : ""}`}>
          <li><NavLink to="/" end onClick={close}>Home</NavLink></li>
          <li><NavLink to="/shop" onClick={close}>Shop</NavLink></li>
          <li><NavLink to="/about" onClick={close}>About</NavLink></li>
        </ul>

        <Link to="/cart" className="cart-btn">
          Cart {totalItems > 0 && <span className="n">{totalItems}</span>}
        </Link>

        <button
          className={`burger ${open ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
