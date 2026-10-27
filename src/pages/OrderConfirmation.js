import React from "react";
import { Link } from "react-router-dom";
import { getLastOrder } from "../orders";
import { CONTACT } from "../config";
import CheckoutSteps from "../components/CheckoutSteps";
import usePageTitle from "../usePageTitle";

const NEXT_STEPS = [
  { title: "We confirm your order", text: "You'll get a message from us once payment is confirmed." },
  { title: "We prepare your pieces", text: "Each piece is checked, finished and packed by hand." },
  { title: "Delivery", text: "We'll contact you to arrange delivery to your address." },
];

const OrderConfirmation = () => {
  usePageTitle("Order confirmed");
  const order = getLastOrder();

  if (!order) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>No recent order</h1>
        <p className="muted">We couldn't find an order from this browser.</p>
        <Link to="/shop" className="btn">Go to the shop</Link>
      </div>
    );
  }

  const placed = new Date(order.createdAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="wrap co-page confirm">
      <CheckoutSteps current="confirmation" />

      <div className="confirm-head">
        <p className="confirm-id">Order {order.id} · {placed}</p>
        <h1>Thank you, {order.customer.firstName}.</h1>
        <p className="muted">
          We've received your order. A confirmation will be sent to {order.customer.email}.
        </p>
      </div>

      <div className="co-grid">
        <div>
          <h2 className="co-title">What happens next</h2>
          <ol className="next-steps">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="num">{i + 1}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p className="muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="confirm-cols">
            <div>
              <h3>Delivery</h3>
              <p>{order.customer.firstName} {order.customer.lastName}</p>
              <p>{order.delivery.address}</p>
              <p>{order.delivery.area}</p>
              <p>{order.customer.phone}</p>
              {order.delivery.notes && <p className="muted">“{order.delivery.notes}”</p>}
            </div>
            <div>
              <h3>Payment</h3>
              <p>{order.payment.method === "mpesa" ? "M-Pesa" : "Card"}</p>
              {order.gift.isGift && (
                <>
                  <h3 className="gap">Gift note</h3>
                  <p className="muted">{order.gift.message || "No note added."}</p>
                </>
              )}
            </div>
          </div>

          <p className="muted small confirm-help">
            Questions about your order? Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call{" "}
            <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a> and mention order {order.id}.
          </p>
        </div>

        <aside className="co-summary">
          <h2 className="co-title">Your order</h2>
          <ul className="confirm-items">
            {order.items.map((i) => (
              <li key={`${i.productId}-${i.colour}`}>
                <span>
                  {i.name}
                  <small className="muted"> · {i.colour ? `${i.colour} · ` : ""}Qty {i.quantity}</small>
                </span>
                <span>KSh {i.lineTotal.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="co-rows">
            <div className="row"><span>Subtotal</span><span>KSh {order.totals.subtotal.toLocaleString()}</span></div>
            <div className="row"><span>Delivery · {order.delivery.area}</span><span>KSh {order.totals.delivery.toLocaleString()}</span></div>
            {order.totals.discount > 0 && (
              <div className="row"><span>Discount</span><span>− KSh {order.totals.discount.toLocaleString()}</span></div>
            )}
          </div>
          <div className="row total"><span>Total</span><span>KSh {order.totals.total.toLocaleString()}</span></div>
          <Link to="/shop" className="btn square block">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
};

export default OrderConfirmation;
