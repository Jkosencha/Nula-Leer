import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "./CartContext";
import { colorNames } from "./Products";
import CheckoutSteps from "../components/CheckoutSteps";
import ProductImage from "../components/ProductImage";
import DeliveryPicker, { townLabel } from "../components/DeliveryPicker";
import { DEMO, LIVE } from "../config";
import { createOrder, saveLastOrder } from "../orders";
import usePageTitle from "../usePageTitle";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Field = ({ label, className = "", ...props }) => (
  <label className={`uline ${className}`.trim()}>
    <span>{label}</span>
    <input {...props} />
  </label>
);

const Checkout = () => {
  usePageTitle("Checkout");
  const { cartItems, shippingCost, shippingLocation, selectShipping, subtotal, discount, coupon } = useCart();
  const [step, setStep] = useState("shipping");
  const [contact, setContact] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [card, setCard] = useState({ name: "", cardNumber: "", expiry: "", cvv: "" });
  const [gift, setGift] = useState({ isGift: false, message: "" });
  const navigate = useNavigate();

  const total = subtotal + (shippingCost || 0) - discount;
  const update = (key) => (e) => setContact({ ...contact, [key]: e.target.value });

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

  const continueToPayment = (e) => {
    e.preventDefault();
    if (!shippingLocation) return toast.error("Please choose a delivery area.");
    if (!mpesaNumber) setMpesaNumber(contact.phone);
    setStep("payment");
    window.scrollTo(0, 0);
  };

  // the order that will be sent to the backend (and shown in the admin dashboard)
  const buildOrder = () =>
    createOrder({
      cartItems,
      contact,
      deliveryArea: townLabel(shippingLocation),
      deliveryFee: shippingCost || 0,
      gift,
      paymentMethod,
      discount,
    });

  const completePurchase = (e) => {
    e.preventDefault();
    if (!LIVE.payments) return;
    if (paymentMethod === "mpesa") handleMpesa();
    else handleCard();
  };

  // demo only: see the confirmation page with this checkout's details
  const previewConfirmation = async () => {
    const order = buildOrder();
    saveLastOrder(order);
    // so the order shows up in the admin dashboard (loaded only here)
    const { saveOrder } = await import("../admin/api");
    await saveOrder(order);
    navigate("/order/confirmation");
  };

  if (cartItems.length === 0) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>Your cart is empty</h1>
        <Link to="/shop" className="btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="wrap co-page">
      <CheckoutSteps current={step} onStep={setStep} />

      <div className="co-grid">
        {step === "shipping" ? (
          <form onSubmit={continueToPayment}>
            <h1 className="co-title">Contact</h1>
            <div className="uline-grid">
              <Field label="First name" value={contact.firstName} onChange={update("firstName")} autoComplete="given-name" required />
              <Field label="Last name" value={contact.lastName} onChange={update("lastName")} autoComplete="family-name" required />
              <Field label="Email" type="email" value={contact.email} onChange={update("email")} autoComplete="email" required />
              <Field label="Phone" type="tel" value={contact.phone} onChange={update("phone")} autoComplete="tel" required />
            </div>

            <h2 className="co-title">Delivery</h2>
            <DeliveryPicker value={shippingLocation} onChange={selectShipping} />
            <div className="uline-grid">
              <Field
                label="Street, building, house no."
                className="full"
                value={contact.address}
                onChange={update("address")}
                autoComplete="street-address"
                required
              />
              <Field
                label="Delivery notes (optional)"
                className="full"
                value={contact.notes}
                onChange={update("notes")}
              />
            </div>

            <div className="gift">
              <label className="gift-check">
                <input
                  type="checkbox"
                  checked={gift.isGift}
                  onChange={(e) => setGift({ ...gift, isGift: e.target.checked })}
                />
                This order is a gift
              </label>
              {gift.isGift && (
                <label className="uline">
                  <span>Gift note (optional, we'll include it with the order)</span>
                  <textarea
                    rows="2"
                    maxLength={240}
                    value={gift.message}
                    onChange={(e) => setGift({ ...gift, message: e.target.value })}
                  />
                </label>
              )}
            </div>

            <div className="co-actions">
              <button type="submit" className="btn square">Continue to payment</button>
              <Link to="/cart" className="under-link">Back to shopping cart</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={completePurchase}>
            <h1 className="co-title">Payment method</h1>
            {!LIVE.payments && (
              <p className="off-banner">
                Online payment is being set up and isn't available yet. To order now, contact us
                and we'll arrange payment with you directly.
              </p>
            )}
            <fieldset className="pay-fieldset" disabled={!LIVE.payments}>
              <div className="radio-list">
                <label className="radio">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "mpesa"}
                    onChange={() => setPaymentMethod("mpesa")}
                  />
                  M-Pesa
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  Credit or debit card
                </label>
              </div>

              {paymentMethod === "mpesa" ? (
                <div className="uline-grid">
                  <Field
                    label="M-Pesa number"
                    type="tel"
                    placeholder="2547XXXXXXXX"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    required
                  />
                  <p className="muted small pay-note">
                    You'll get a prompt on your phone to pay KSh {total.toLocaleString()}.
                  </p>
                </div>
              ) : (
                <div className="uline-grid">
                  <Field
                    label="Name on card"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    autoComplete="cc-name"
                  />
                  <Field
                    label="Card number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.cardNumber}
                    onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                  />
                  <Field
                    label="Expiry date"
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                  <Field
                    label="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  />
                </div>
              )}

            </fieldset>

            <div className="co-actions">
              <button type="submit" className="btn square" disabled={!LIVE.payments}>
                Complete purchase · KSh {total.toLocaleString()}
              </button>
              {!LIVE.payments && DEMO && (
                <button type="button" className="under-link" onClick={previewConfirmation}>
                  Preview the confirmation page
                </button>
              )}
              <button type="button" className="under-link" onClick={() => setStep("shipping")}>
                Back to shipping
              </button>
            </div>
          </form>
        )}

        <aside className="co-summary">
          <div className="co-summary-head">
            <h2 className="co-title">Your order</h2>
            <Link to="/cart" className="under-link">Edit cart</Link>
          </div>
          <ul className="co-mini">
            {cartItems.map((item) => (
              <li key={item.cartId}>
                <div className="thumb"><ProductImage src={item.image} product={item} alt={item.name} /></div>
                <div className="grow">
                  <div className="name">{item.name}</div>
                  <span className="meta">
                    {item.selectedColor && `${colorNames[item.selectedColor] || item.selectedColor} · `}
                    Qty {item.quantity}
                  </span>
                </div>
                <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="co-rows">
            <div className="row"><span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span></div>
            <div className="row">
              <span>Delivery{shippingLocation && ` · ${townLabel(shippingLocation)}`}</span>
              <span>{shippingLocation ? `KSh ${shippingCost.toLocaleString()}` : "—"}</span>
            </div>
            {discount > 0 && (
              <div className="row"><span>Discount ({coupon})</span><span>− KSh {discount.toLocaleString()}</span></div>
            )}
          </div>
          <div className="row total"><span>Total</span><span>KSh {total.toLocaleString()}</span></div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
