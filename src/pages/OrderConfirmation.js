import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getLastOrder } from "../orders";
import { useCart } from "./CartContext";
import { CONTACT } from "../config";
import CheckoutSteps from "../components/CheckoutSteps";
import usePageTitle from "../usePageTitle";
import { track } from "../analytics";

const NEXT_STEPS = [
  { title: "We confirm your order", text: "You'll get a message from us once payment is confirmed." },
  { title: "We prepare your pieces", text: "Each piece is checked, finished and packed by hand." },
  { title: "Delivery", text: "We'll contact you to arrange delivery to your address." },
];

// After Paystack, the URL carries ?ref=NL-…; the order is loaded from the server,
// which also confirms the payment with Paystack if its webhook hasn't arrived yet.
// Without ?ref (the design preview) the last order saved in this browser is shown.
const useOrder = (ref) => {
  const [state, setState] = useState(() => (ref ? { loading: true } : { order: getLastOrder() }));

  useEffect(() => {
    if (!ref) return undefined;
    let cancelled = false;
    let tries = 0;
    const load = async () => {
      try {
        const res = await fetch(`/api/order-status?ref=${encodeURIComponent(ref)}`);
        const order = res.ok ? await res.json() : null;
        if (cancelled) return;
        setState({ order });
        // M-Pesa can take a few seconds to confirm; check again for about a minute
        if (order?.status === "pending_payment" && ++tries < 12) setTimeout(load, 5000);
      } catch (e) {
        if (!cancelled) setState({ order: null, error: true });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [ref]);

  return state;
};

const OrderConfirmation = () => {
  usePageTitle("Order confirmed");
  const [params] = useSearchParams();
  const ref = params.get("ref");
  const { order, loading, error } = useOrder(ref);
  const { clearCart } = useCart();

  const paid = order && order.status !== "pending_payment" && order.status !== "cancelled";
  useEffect(() => {
    if (ref && paid) {
      clearCart();
      track("Order paid", { total: order.totals.total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, paid]);

  if (loading) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>Confirming your payment…</h1>
        <p className="muted">This takes a few seconds.</p>
      </div>
    );
  }

  if (ref && order && !paid) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>{order.status === "cancelled" ? "This order was cancelled" : "Waiting for your payment"}</h1>
        <p className="muted">
          {order.status === "cancelled"
            ? `Order ${order.id} was cancelled. Contact us if you think this is a mistake.`
            : `We haven't received payment for order ${order.id} yet. If you've just paid, this page updates by itself. If you closed the payment page, go back to checkout and try again.`}
        </p>
        <Link to="/checkout" className="btn">Back to checkout</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="wrap empty" style={{ padding: "100px 0 120px" }}>
        <h1>{error ? "We couldn't load your order" : "No recent order"}</h1>
        <p className="muted">
          {error
            ? `Check your connection and refresh this page. Your order number is ${ref}.`
            : "We couldn't find an order from this browser."}
        </p>
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
              {order.customer.lastName && <p>{order.customer.firstName} {order.customer.lastName}</p>}
              {order.delivery.address && <p>{order.delivery.address}</p>}
              <p>{order.delivery.area}</p>
              {order.customer.phone && <p>{order.customer.phone}</p>}
              {order.delivery.notes && <p className="muted">“{order.delivery.notes}”</p>}
            </div>
            <div>
              <h3>Payment</h3>
              <p>
                {order.payment.method === "mpesa" ? "M-Pesa" : "Card"}
                {order.payment.status === "paid" && " · Paid"}
              </p>
              {order.gift.isGift && (
                <>
                  <h3 className="gap">Gift note</h3>
                  <p className="muted">{order.gift.message || (ref ? "Included as requested." : "No note added.")}</p>
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
