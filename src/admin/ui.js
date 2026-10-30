import React from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";

// Who is "signed in" until real sign-in arrives with the backend.
export const ADMIN_USER = { firstName: "Jennifer", lastName: "Kosencha", role: "Owner" };

// Labels, next actions and badge tone for each order status (orders.js ORDER_STATUSES).
export const STATUS = {
  pending_payment: { label: "Awaiting payment", tone: "wait", next: "paid", action: "Mark as paid" },
  paid: { label: "Paid", tone: "go", next: "processing", action: "Start preparing" },
  processing: { label: "Preparing", tone: "go", next: "shipped", action: "Mark as sent" },
  shipped: { label: "Out for delivery", tone: "go", next: "delivered", action: "Mark as delivered" },
  delivered: { label: "Delivered", tone: "done" },
  cancelled: { label: "Cancelled", tone: "off" },
};

// The order a parcel moves through; cancelled sits outside it.
export const FLOW = ["pending_payment", "paid", "processing", "shipped", "delivered"];

export const StatusBadge = ({ status }) => (
  <span className={`a-badge ${STATUS[status]?.tone || ""}`}>{STATUS[status]?.label || status}</span>
);

export const ksh = (n) => `KSh ${Math.round(n).toLocaleString()}`;

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

export const dateTime = (iso) =>
  new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const customerName = (c) => `${c.firstName} ${c.lastName}`;

export const initials = (c) => `${c.firstName[0] || ""}${c.lastName[0] || ""}`.toUpperCase();

// "254712345678" style for wa.me links
export const waNumber = (phone) => phone.replace(/\D/g, "").replace(/^0/, "254");

export const PageHead = ({ title, sub, children }) => (
  <div className="a-head">
    <div>
      <h1>{title}</h1>
      {sub && <p className="a-head-sub">{sub}</p>}
    </div>
    {children && <div className="a-head-actions">{children}</div>}
  </div>
);

// Change against the previous period. Direction is shown by arrow and words, not colour alone.
export const Delta = ({ now, before, label }) => {
  if (!before) return <span className="a-delta flat">{label ? `No ${label} to compare` : "New"}</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={`a-delta ${up ? "up" : "down"}`}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(pct)}% {up ? "up" : "down"}
    </span>
  );
};

export const Avatar = ({ person }) => <span className="a-avatar" aria-hidden="true">{initials(person)}</span>;

// Row menu: items are { label, icon, onSelect, href, danger } or "sep".
export const RowMenu = ({ label, items }) => (
  <Dropdown.Root>
    <Dropdown.Trigger className="a-icon-btn" aria-label={label}>
      <MoreHorizontal size={18} />
    </Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content className="a-menu" align="end" sideOffset={4}>
        {items.filter(Boolean).map((it, k) =>
          it === "sep" ? (
            <Dropdown.Separator key={k} className="a-menu-sep" />
          ) : (
            <Dropdown.Item
              key={k}
              className={`a-menu-item ${it.danger ? "danger" : ""}`}
              onSelect={it.href ? () => window.open(it.href, "_blank", "noopener") : it.onSelect}
            >
              {it.icon}
              {it.label}
            </Dropdown.Item>
          )
        )}
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);

// Confirmation in place of window.confirm, so it matches the dashboard and traps focus.
export const ConfirmDialog = ({ open, onOpenChange, title, body, confirmLabel, danger, onConfirm }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="a-overlay" />
      <Dialog.Content className="a-dialog">
        <Dialog.Title className="a-dialog-title">{title}</Dialog.Title>
        <Dialog.Description className="a-dialog-body">{body}</Dialog.Description>
        <div className="a-dialog-actions">
          <Dialog.Close className="a-btn ghost">Keep it</Dialog.Close>
          <button
            className={`a-btn ${danger ? "danger solid" : ""}`}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
