import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiMinus, FiPlus, FiArrowRight } from "react-icons/fi";
import { useCart, SHIPPING_OPTIONS } from "../pages/CartContext";
import { categories, colorNames } from "../pages/Products";
import ProductImage from "./ProductImage";

const nairobiFrom = Math.min(...Object.values(SHIPPING_OPTIONS.Nairobi));

const CartDrawer = () => {
  const { cartItems, drawerOpen, setDrawerOpen, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, subtotal } =
    useCart();
  const count = cartItems.reduce((s, i) => s + i.quantity, 0);
  const close = () => setDrawerOpen(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      <div className={`scrim drawer-scrim ${drawerOpen ? "show" : ""}`} onClick={close} />
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen} aria-label="Cart">
        <div className="drawer-head">
          <h2>
            Your cart {count > 0 && <span className="drawer-count">({count})</span>}
          </h2>
          <button className="icon-btn" aria-label="Close cart" onClick={close}><FiX /></button>
        </div>

        {cartItems.length === 0 ? (
          <div className="drawer-empty">
            <h3>Your cart is empty</h3>
            <p className="muted">Have a look around and add something you like.</p>
            <ul className="drawer-links">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${c.slug}`} onClick={close}>
                    {c.name} <FiArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <ul className="drawer-items">
              {cartItems.map((item) => (
                <li key={item.cartId} className="dline">
                  <Link to={`/productDetails/${item.id}`} className="dline-img" onClick={close}>
                    <ProductImage src={item.image} product={item} alt={item.name} />
                  </Link>
                  <div className="dline-info">
                    <div className="dline-top">
                      <Link to={`/productDetails/${item.id}`} className="name" onClick={close}>{item.name}</Link>
                      <span className="price">KSh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {item.selectedColor && (
                      <span className="dline-colour">
                        <span className="dot" style={{ background: item.selectedColor }} />
                        {colorNames[item.selectedColor] || item.selectedColor}
                      </span>
                    )}
                    <div className="dline-bottom">
                      <div className="stepper sm">
                        <button aria-label="Decrease" onClick={() => decreaseQuantity(item.cartId)}><FiMinus /></button>
                        <span>{item.quantity}</span>
                        <button aria-label="Increase" onClick={() => increaseQuantity(item.cartId)}><FiPlus /></button>
                      </div>
                      <button className="dline-remove" onClick={() => removeFromCart(item.cartId)}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="drawer-foot">
              <div className="drawer-subtotal">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <p className="drawer-note">
                Delivery is added at checkout, Nairobi from KSh {nairobiFrom}.
              </p>
              <Link to="/checkout" className="btn square block" onClick={close}>Check out</Link>
              <div className="drawer-links-row">
                <Link to="/cart" className="drawer-viewcart" onClick={close}>View cart</Link>
                <button className="drawer-viewcart" onClick={clearCart}>Clear cart</button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
