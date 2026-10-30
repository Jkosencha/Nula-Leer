import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { listOrders } from "./api";
import { ORDER_STATUSES } from "../orders";
import { PageHead, STATUS, StatusBadge, ksh, shortDate, customerName } from "./ui";

const Orders = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "all";
  const [q, setQ] = useState(params.get("q") || "");
  const [all, setAll] = useState(null);

  useEffect(() => {
    listOrders().then(setAll);
  }, []);

  if (!all) return <p className="a-muted">Loading…</p>;

  const term = q.trim().toLowerCase();
  const shown = all.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (!term ||
        o.id.toLowerCase().includes(term) ||
        customerName(o.customer).toLowerCase().includes(term) ||
        o.customer.phone.includes(term) ||
        o.customer.email.toLowerCase().includes(term))
  );
  const count = (s) => (s === "all" ? all.length : all.filter((o) => o.status === s).length);

  return (
    <>
      <PageHead title="Orders" />

      <div className="a-tabs" role="tablist">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={status === s}
            className={status === s ? "on" : ""}
            onClick={() => setParams(s === "all" ? {} : { status: s })}
          >
            {s === "all" ? "All" : STATUS[s].label}
            <span className="a-count">{count(s)}</span>
          </button>
        ))}
      </div>

      <label className="a-search">
        <FiSearch />
        <input
          type="search"
          placeholder="Search by order number, name, phone or email"
          aria-label="Search orders"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <section className="a-card flush">
        {shown.length === 0 ? (
          <p className="a-empty">No orders here.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Order</th><th>Date</th><th>Customer</th><th>Items</th>
                  <th>Payment</th><th className="num">Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/admin/orders/${o.id}`} className="a-strong">{o.id}</Link></td>
                    <td>{shortDate(o.createdAt)}</td>
                    <td>
                      {customerName(o.customer)}
                      <span className="a-sub">{o.delivery.area}</span>
                    </td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>
                      {o.payment.method === "mpesa" ? "M-Pesa" : "Card"}
                      <span className="a-sub">{o.payment.status === "paid" ? "Paid" : "Unpaid"}</span>
                    </td>
                    <td className="num">{ksh(o.totals.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default Orders;
