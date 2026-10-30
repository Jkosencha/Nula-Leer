import React from "react";

// Labels, next actions and badge tone for each order status (orders.js ORDER_STATUSES).
export const STATUS = {
  pending_payment: { label: "Awaiting payment", tone: "wait", next: "paid", action: "Mark as paid" },
  paid: { label: "Paid", tone: "go", next: "processing", action: "Start preparing" },
  processing: { label: "Preparing", tone: "go", next: "shipped", action: "Mark as sent" },
  shipped: { label: "Out for delivery", tone: "go", next: "delivered", action: "Mark as delivered" },
  delivered: { label: "Delivered", tone: "done" },
  cancelled: { label: "Cancelled", tone: "off" },
};

export const StatusBadge = ({ status }) => (
  <span className={`a-badge ${STATUS[status]?.tone || ""}`}>{STATUS[status]?.label || status}</span>
);

export const ksh = (n) => `KSh ${Math.round(n).toLocaleString()}`;

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

export const dateTime = (iso) =>
  new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const customerName = (c) => `${c.firstName} ${c.lastName}`;

// "254712345678" style for wa.me links
export const waNumber = (phone) => phone.replace(/\D/g, "").replace(/^0/, "254");

export const PageHead = ({ title, children }) => (
  <div className="a-head">
    <h1>{title}</h1>
    {children && <div className="a-head-actions">{children}</div>}
  </div>
);
