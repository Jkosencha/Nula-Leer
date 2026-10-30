import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { listOrders, listProducts } from "./api";
import { availability } from "../availability";
import SalesChart from "./SalesChart";
import { PageHead, StatusBadge, ksh, shortDate, customerName } from "./ui";

const DAY = 86400000;

const Overview = () => {
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    listOrders().then(setOrders);
    listProducts().then(setProducts);
  }, []);

  if (!orders) return <p className="a-muted">Loading…</p>;

  const since = Date.now() - 30 * DAY;
  const recent = orders.filter((o) => new Date(o.createdAt) >= since);
  const paid = recent.filter((o) => o.payment.status === "paid" && o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + o.totals.total, 0);
  const toFulfil = orders.filter((o) => ["paid", "processing"].includes(o.status));
  const awaiting = orders.filter((o) => o.status === "pending_payment");
  const lowStock = products.filter((p) => availability(p)?.soldOut || availability(p)?.low);

  const tiles = [
    { label: "Sales, last 30 days", value: ksh(revenue), note: `${paid.length} paid orders` },
    { label: "Average order", value: paid.length ? ksh(revenue / paid.length) : "—", note: "Paid orders, last 30 days" },
    { label: "To prepare and send", value: toFulfil.length, note: "Paid or being prepared", to: "/admin/orders?status=paid" },
    { label: "Awaiting payment", value: awaiting.length, note: "Follow up with the buyer", to: "/admin/orders?status=pending_payment" },
  ];

  return (
    <>
      <PageHead title="Overview" />

      <div className="a-tiles">
        {tiles.map((t) => {
          const body = (
            <>
              <span className="a-tile-label">{t.label}</span>
              <span className="a-tile-value">{t.value}</span>
              <span className="a-muted small">{t.note}</span>
            </>
          );
          return t.to ? (
            <Link key={t.label} to={t.to} className="a-tile link">{body}</Link>
          ) : (
            <div key={t.label} className="a-tile">{body}</div>
          );
        })}
      </div>

      <div className="a-grid-2">
        <SalesChart orders={orders} />

        <section className="a-card">
          <div className="a-card-head">
            <h2>Stock to watch</h2>
            <Link to="/admin/products" className="a-link">Products</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="a-muted">Nothing running low.</p>
          ) : (
            <ul className="a-list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`}>{p.name}</Link>
                  <span className={availability(p).soldOut ? "a-badge off" : "a-badge wait"}>{availability(p).label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="a-card">
        <div className="a-card-head">
          <h2>Latest orders</h2>
          <Link to="/admin/orders" className="a-link">All orders <FiArrowRight /></Link>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Customer</th><th className="num">Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/orders/${o.id}`} className="a-strong">{o.id}</Link></td>
                  <td>{shortDate(o.createdAt)}</td>
                  <td>{customerName(o.customer)}</td>
                  <td className="num">{ksh(o.totals.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Overview;
