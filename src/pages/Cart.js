import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";

const SHIPPING_OPTIONS = {
  Nairobi: { Westlands: 200, ThikaRoad: 500, CBD: 150, Karen: 250, Ngong: 100, Kikuyu: 200, Kiambu: 300 },
  Mombasa: { Mombasa: 1300, Lamu: 1200, Malindi: 1500, Kilifi: 2000, Ukunda: 2000 },
  Others: { Nakuru: 350, Kisumu: 400, Eldoret: 1800, Muranga: 1000 },
};

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    decreaseQuantity,
    increaseQuantity,
    shippingLocation,
    setShippingLocation,
    shippingCost,
    setShippingCost,
  } = useContext(CartContext);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingCost || 0;
  const couponDiscount = appliedCoupon ? 100 : 0;
  const total = subtotal + shipping - couponDiscount;

  const applyCoupon = () => {
    if (couponCode.trim().toLowerCase() === "save100") {
      setAppliedCoupon("SAVE100");
      toast.success("Coupon applied — KSh 100 off.");
    } else {
      setAppliedCoupon(null);
      toast.error("Invalid coupon code.");
    }
  };

  const handleLocationChange = (town) => {
    setShippingLocation(town);
    let price = 0;
    Object.values(SHIPPING_OPTIONS).forEach((towns) => {
      if (towns[town]) price = towns[town];
    });
    setShippingCost(price);
  };

  return (
    <div className="wrap cart">
      <div className="page-head" style={{ padding: "10px 0 30px" }}>
        <span className="kicker">Your Bag</span>
        <h1>Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="big">🛍️</div>
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn fill">Go to shop</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cartId}>
                    <td>
                      <div className="cart-prod">
                        <button className="rm" onClick={() => removeFromCart(item.cartId)}>✕</button>
                        <img src={item.image} alt={item.name} />
                        <div>
                          <div className="name">{item.name}</div>
                          {item.selectedColor && (
                            <small>
                              Colour:{" "}
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: item.selectedColor,
                                  verticalAlign: "middle",
                                  border: "1px solid #0002",
                                }}
                              />
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>KSh {item.price.toLocaleString()}</td>
                    <td>
                      <div className="qty-mini">
                        <button onClick={() => decreaseQuantity(item.cartId)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item.cartId)}>+</button>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-actions">
              <div className="coupon">
                <input
                  type="text"
                  placeholder="Coupon code (try SAVE100)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button className="btn ghost" onClick={applyCoupon}>Apply</button>
              </div>
              <button
                className="btn ghost"
                onClick={() => {
                  if (window.confirm("Clear your entire cart?")) {
                    clearCart();
                    toast.info("Cart cleared.");
                  }
                }}
              >
                Clear cart
              </button>
            </div>
          </div>

          <div className="summary">
            <h3>Order Summary</h3>
            <div className="row"><span>Items</span><span>{totalItems}</span></div>
            <div className="row"><span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span></div>

            <div style={{ margin: "14px 0" }}>
              <label className="kicker" style={{ color: "var(--muted)" }}>Delivery location</label>
              <select value={shippingLocation} onChange={(e) => handleLocationChange(e.target.value)}>
                <option value="">— Select location —</option>
                {Object.entries(SHIPPING_OPTIONS).map(([city, towns]) => (
                  <optgroup key={city} label={city}>
                    {Object.entries(towns).map(([town, price]) => (
                      <option key={town} value={town}>
                        {town} — KSh {price}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="row"><span>Shipping</span><span>KSh {shipping.toLocaleString()}</span></div>
            {appliedCoupon && (
              <div className="row"><span>Coupon ({appliedCoupon})</span><span>− KSh {couponDiscount}</span></div>
            )}
            <div className="row total"><span>Total</span><span>KSh {total.toLocaleString()}</span></div>

            <Link to="/checkout" className="btn fill">Proceed to checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
