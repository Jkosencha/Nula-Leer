import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "./CartContext";
import { colorNames } from "./Products";
import CheckoutSteps from "../components/CheckoutSteps";
import ProductImage from "../components/ProductImage";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    subtotal,
    discount,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const [code, setCode] = useState("");

  const submitCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(code)) {
      toast.success("Discount applied.");
      setCode("");
    } else {
      toast.error("That code isn't valid.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>Your cart is empty</h1>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="wrap co-page">
      <CheckoutSteps current="cart" />

      <div className="co-grid">
        <section>
          <h1 className="co-title">Shopping cart</h1>
          <ul className="co-lines">
            {cartItems.map((item) => (
              <li key={item.cartId}>
                <Link to={`/productDetails/${item.id}`} className="thumb">
                  <ProductImage src={item.image} product={item} alt={item.name} />
                </Link>
                <div className="co-line-info">
                  <Link to={`/productDetails/${item.id}`} className="name">{item.name}</Link>
                  <span className="meta">
                    {item.selectedColor && `${colorNames[item.selectedColor] || item.selectedColor} · `}
                    KSh {item.price.toLocaleString()}
                  </span>
                  <div className="qty-row">
                    <span className="meta">Quantity</span>
                    <div className="stepper sm">
                      <button aria-label="Decrease" onClick={() => decreaseQuantity(item.cartId)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button aria-label="Increase" onClick={() => increaseQuantity(item.cartId)}><FiPlus /></button>
                    </div>
                  </div>
                </div>
                <div className="co-line-end">
                  <button className="link-btn" onClick={() => removeFromCart(item.cartId)}>Remove</button>
                  <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="co-summary">
          <h2 className="co-title">Total</h2>
          <div className="co-rows">
            <div className="row"><span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span></div>
            <div className="row"><span>Delivery</span><span className="muted">Calculated at next step</span></div>
            {discount > 0 && (
              <div className="row">
                <span>
                  Discount ({coupon}){" "}
                  <button className="link-btn" onClick={removeCoupon}>Remove</button>
                </span>
                <span>− KSh {discount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="row total"><span>Total</span><span>KSh {(subtotal - discount).toLocaleString()}</span></div>

          <form className="code-field" onSubmit={submitCoupon}>
            <input
              type="text"
              placeholder="Discount code"
              aria-label="Discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" aria-label="Apply discount code"><FiArrowRight /></button>
          </form>

          <Link to="/checkout" className="btn square block">Checkout now</Link>
          <div className="cart-links">
            <Link to="/shop" className="under-link">Continue shopping</Link>
            <button className="under-link" onClick={clearCart}>Clear cart</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
