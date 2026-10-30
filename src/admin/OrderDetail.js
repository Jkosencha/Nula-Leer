import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Phone, Mail, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getOrder, updateOrderStatus, addOrderNote } from "./api";
import { STATUS, FLOW, StatusBadge, ConfirmDialog, Avatar, ksh, dateTime, customerName, waNumber } from "./ui";

// Where the order is in its journey, with the time each step was reached.
const Progress = ({ order }) => {
  const reachedAt = (s) => [...(order.history || [])].reverse().find((h) => h.status === s)?.at;
  const current = FLOW.indexOf(order.status);
  return (
    <ol className="a-progress" aria-label="Order progress">
      {FLOW.map((s, i) => {
        const done = order.status !== "cancelled" && i <= current;
        const at = reachedAt(s);
        return (
          <li key={s} className={`${done ? "done" : ""} ${i === current ? "current" : ""}`} aria-current={i === current ? "step" : undefined}>
            <span className="a-progress-dot">{done && <Check size={12} strokeWidth={3} />}</span>
            <span className="a-progress-label">{STATUS[s].label}</span>
            <span className="a-progress-time">{at && done ? dateTime(at) : ""}</span>
          </li>
        );
      })}
    </ol>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(undefined);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    getOrder(id).then(setOrder);
  }, [id]);

  if (order === undefined) return <p className="a-muted">Loading…</p>;
  if (order === null) {
    return (
      <>
        <p>Order {id} wasn't found.</p>
        <Link to="/admin/orders" className="a-link"><ArrowLeft size={16} /> Back to orders</Link>
      </>
    );
  }

  const meta = STATUS[order.status];
  const closed = ["delivered", "cancelled"].includes(order.status);

  const changeStatus = async (status) => {
    setBusy(true);
    const updated = await updateOrderStatus(order.id, status);
    setOrder(updated);
    setBusy(false);
    toast.success(`Order marked as ${STATUS[status].label.toLowerCase()}.`);
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setOrder(await addOrderNote(order.id, note.trim()));
    setNote("");
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1>Order {order.id}</h1>
          <p className="a-muted">
            Placed {dateTime(order.createdAt)} · <StatusBadge status={order.status} />
          </p>
        </div>
        {!closed && (
          <div className="a-head-actions">
            <button className="a-btn ghost" disabled={busy} onClick={() => setConfirmCancel(true)}>
              Cancel order
            </button>
            <button className="a-btn" disabled={busy} onClick={() => changeStatus(meta.next)}>
              {meta.action}
            </button>
          </div>
        )}
      </div>

      {order.status === "cancelled" ? (
        <p className="a-notice">This order was cancelled. If the customer had paid, make sure they were refunded.</p>
      ) : (
        <section className="a-card">
          <Progress order={order} />
        </section>
      )}

      <div className="a-grid-2 wide-left">
        <div className="a-stack">
          <section className="a-card">
            <h2>Items</h2>
            <ul className="a-items">
              {order.items.map((i) => (
                <li key={`${i.productId}-${i.colour}`}>
                  <span>
                    <Link to={`/admin/products/${i.productId}`} className="a-strong">{i.name}</Link>
                    <span className="a-sub">
                      {i.colour ? `${i.colour} · ` : ""}{i.quantity} × {ksh(i.unitPrice)}
                    </span>
                  </span>
                  <span>{ksh(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="a-totals">
              <dt>Subtotal</dt><dd>{ksh(order.totals.subtotal)}</dd>
              <dt>Delivery · {order.delivery.area}</dt><dd>{ksh(order.totals.delivery)}</dd>
              {order.totals.discount > 0 && (<><dt>Discount</dt><dd>− {ksh(order.totals.discount)}</dd></>)}
              <dt className="total">Total</dt><dd className="total">{ksh(order.totals.total)}</dd>
            </dl>
          </section>

          <section className="a-card">
            <h2>History</h2>
            <ol className="a-timeline">
              {[...(order.history || [])].reverse().map((h, k) => (
                <li key={k}>
                  <StatusBadge status={h.status} />
                  <span className="a-muted small">{dateTime(h.at)}</span>
                  {h.note && <p>{h.note}</p>}
                </li>
              ))}
            </ol>
          </section>

          <section className="a-card">
            <h2>Notes</h2>
            <p className="a-muted small">Private: only visible in the dashboard.</p>
            {order.notes?.length > 0 && (
              <ul className="a-notes">
                {order.notes.map((n, k) => (
                  <li key={k}>
                    <p>{n.text}</p>
                    <span className="a-muted small">{dateTime(n.at)}</span>
                  </li>
                ))}
              </ul>
            )}
            <form className="a-note-form" onSubmit={saveNote}>
              <textarea
                rows="2"
                placeholder="e.g. Customer asked for delivery after 5pm"
                aria-label="Add a note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button className="a-btn ghost" type="submit" disabled={!note.trim()}>Add note</button>
            </form>
          </section>
        </div>

        <div className="a-stack">
          <section className="a-card">
            <h2>Customer</h2>
            <p className="a-person">
              <Avatar person={order.customer} />
              <span className="a-strong">{customerName(order.customer)}</span>
            </p>
            <ul className="a-contact">
              <li><Phone size={16} /><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></li>
              <li>
                <FaWhatsapp />
                <a href={`https://wa.me/${waNumber(order.customer.phone)}`} target="_blank" rel="noreferrer">
                  Message on WhatsApp
                </a>
              </li>
              <li><Mail size={16} /><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></li>
            </ul>
          </section>

          <section className="a-card">
            <h2>Delivery</h2>
            <p>{order.delivery.address}</p>
            <p>{order.delivery.area}</p>
            {order.delivery.notes && <p className="a-muted">“{order.delivery.notes}”</p>}
          </section>

          {order.gift?.isGift && (
            <section className="a-card">
              <h2>Gift</h2>
              <p>{order.gift.message ? `“${order.gift.message}”` : "Marked as a gift, no note."}</p>
            </section>
          )}

          <section className="a-card">
            <h2>Payment</h2>
            <dl className="a-dl">
              <dt>Method</dt><dd>{order.payment.method === "mpesa" ? "M-Pesa" : "Card"}</dd>
              <dt>Status</dt><dd>{order.payment.status === "paid" ? "Paid" : "Not paid yet"}</dd>
              {order.payment.reference && (<><dt>Reference</dt><dd>{order.payment.reference}</dd></>)}
            </dl>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={`Cancel order ${order.id}?`}
        body="The order moves to Cancelled. If the customer has paid, refund them separately."
        confirmLabel="Cancel order"
        danger
        onConfirm={() => changeStatus("cancelled")}
      />
    </>
  );
};

export default OrderDetail;
