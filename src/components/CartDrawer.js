import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "../pages/CartContext";
import { colorNames } from "../pages/Products";

const CartDrawer = () => {
  const { cartItems, drawerOpen, setDrawerOpen, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCart();
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
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
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" aria-label="Close cart" onClick={close}><FiX /></button>
        </div>

        {cartItems.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn" onClick={close}>Start shopping</Link>
          </div>
        ) : (
          <>
            <ul className="drawer-items">
              {cartItems.map((item) => (
                <li key={item.cartId} className="line">
                  <img src={item.image} alt={item.name} />
                  <div className="line-info">
                    <div className="line-top">
                      <span className="name">{item.name}</span>
                      <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    {item.selectedColor && (
                      <span className="meta">{colorNames[item.selectedColor] || item.selectedColor}</span>
                    )}
                    <div className="line-bottom">
                      <div className="stepper sm">
                        <button aria-label="Decrease" onClick={() => decreaseQuantity(item.cartId)}><FiMinus /></button>
                        <span>{item.quantity}</span>
                        <button aria-label="Increase" onClick={() => increaseQuantity(item.cartId)}><FiPlus /></button>
                      </div>
                      <button className="link-btn" onClick={() => removeFromCart(item.cartId)}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="row strong">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <p className="note">Delivery calculated in your cart.</p>
              <Link to="/cart" className="btn" onClick={close}>View cart &amp; check out</Link>
              <button className="btn outline" onClick={close}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
