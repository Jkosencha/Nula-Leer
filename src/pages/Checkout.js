import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMobileAlt, FaCreditCard } from "react-icons/fa";
import { useCart } from "./CartContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Checkout = () => {
  const { cartItems, shippingCost, shippingLocation } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [card, setCard] = useState({ cardNumber: "", expiry: "", cvv: "" });

  const itemsTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = itemsTotal + (shippingCost || 0);

  const handleMpesa = async () => {
    if (!mpesaNumber) return toast.error("Please enter your M-Pesa number.");
    try {
      const res = await fetch(`${API_URL}/api/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: mpesaNumber, amount: total }),
      });
      const data = await res.json();
      if (res.ok) toast.success("STK push sent — complete payment on your phone.");
      else toast.error(data.message || "M-Pesa payment failed. Try again.");
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleCard = () => {
    const { cardNumber, expiry, cvv } = card;
    if (!cardNumber || !expiry || !cvv) return toast.error("Please fill in all card details.");
    toast.success("Card payment successful!");
  };

  const placeOrder = () => {
    if (paymentMethod === "mpesa") handleMpesa();
    else if (paymentMethod === "card") handleCard();
    else toast.error("Please select a payment method.");
  };

  const toggle = (method) =>
    setPaymentMethod((prev) => (prev === method ? "" : method));

  return (
    <div className="wrap checkout">
      <div className="page-head" style={{ padding: "10px 0 30px" }}>
        <span className="kicker">Almost there</span>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-grid">
        <div>
          <h3>Customer info</h3>
          <div className="field-grid">
            <input type="text" placeholder="First name" required />
            <input type="text" placeholder="Last name" required />
            <input type="tel" placeholder="Phone" required />
            <input type="email" placeholder="Email" required />
          </div>

          <h3>Payment method</h3>
          <div className="pay">
            <label className={`pay-opt ${paymentMethod === "mpesa" ? "sel" : ""}`}>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "mpesa"}
                onChange={() => toggle("mpesa")}
              />
              <span className="ico"><FaMobileAlt /></span> M-Pesa
            </label>

            {paymentMethod === "mpesa" && (
              <div className="pay-fields">
                <label>M-Pesa number</label>
                <input
                  type="tel"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="e.g. 254712345678"
                />
                <label>Amount</label>
                <input type="number" value={total} readOnly />
                <button className="btn fill" onClick={handleMpesa}>Pay with M-Pesa</button>
              </div>
            )}

            <label className={`pay-opt ${paymentMethod === "card" ? "sel" : ""}`}>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "card"}
                onChange={() => toggle("card")}
              />
              <span className="ico"><FaCreditCard /></span> Credit card
            </label>

            {paymentMethod === "card" && (
              <div className="pay-fields">
                <label>Card number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                />
                <label>Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                />
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div className="item" key={item.cartId}>
              <span>{item.name} × {item.quantity}</span>
              <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="row" style={{ marginTop: 14 }}>
            <span>Items total</span><span>KSh {itemsTotal.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Shipping ({shippingLocation || "N/A"})</span>
            <span>KSh {(shippingCost || 0).toLocaleString()}</span>
          </div>
          <div className="row total"><span>Grand total</span><span>KSh {total.toLocaleString()}</span></div>
          <button className="btn fill" style={{ width: "100%", marginTop: 18 }} onClick={placeOrder}>
            Place order
          </button>
        </div>
      </div>

      <Link to="/cart" className="back-link">← Back to cart</Link>
    </div>
  );
};

export default Checkout;
