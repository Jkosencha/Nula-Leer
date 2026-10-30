import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Eye, MessageCircle, ArrowRightCircle, XCircle } from "lucide-react";
import { listOrders, updateOrderStatus } from "./api";
import { ORDER_STATUSES } from "../orders";
import DataTable from "./DataTable";
import { PageHead, STATUS, StatusBadge, RowMenu, ConfirmDialog, Avatar, ksh, shortDate, customerName, waNumber } from "./ui";

const Orders = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "all";
  const [q, setQ] = useState(params.get("q") || "");
  const [all, setAll] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(() => listOrders().then(setAll), []);
  useEffect(() => {
    load();
  }, [load]);

  const advance = useCallback(
    async (list, next) => {
      for (const o of list) await updateOrderStatus(o.id, next);
      await load();
      toast.success(
        list.length === 1
          ? `${list[0].id} marked as ${STATUS[next].label.toLowerCase()}.`
          : `${list.length} orders marked as ${STATUS[next].label.toLowerCase()}.`
      );
    },
    [load]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order",
        cell: ({ getValue }) => <Link to={`/admin/orders/${getValue()}`} className="a-strong">{getValue()}</Link>,
      },
      { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => shortDate(getValue()) },
      {
        id: "customer",
        header: "Customer",
        accessorFn: (o) => customerName(o.customer),
        cell: ({ row }) => (
          <span className="a-person">
            <Avatar person={row.original.customer} />
            <span>
              {customerName(row.original.customer)}
              <span className="a-sub">{row.original.delivery.area}</span>
            </span>
          </span>
        ),
      },
      { id: "items", header: "Items", accessorFn: (o) => o.items.reduce((s, i) => s + i.quantity, 0), meta: { align: "right" } },
      {
        id: "payment",
        header: "Payment",
        accessorFn: (o) => o.payment.status,
        cell: ({ row }) => (
          <span>
            {row.original.payment.method === "mpesa" ? "M-Pesa" : "Card"}
            <span className="a-sub">{row.original.payment.status === "paid" ? "Paid" : "Unpaid"}</span>
          </span>
        ),
      },
      { id: "total", header: "Total", accessorFn: (o) => o.totals.total, cell: ({ getValue }) => ksh(getValue()), meta: { align: "right" } },
      {
        accessorKey: "status",
        header: "Status",
        sortingFn: (a, b) => ORDER_STATUSES.indexOf(a.original.status) - ORDER_STATUSES.indexOf(b.original.status),
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        meta: { className: "a-col-menu" },
        cell: ({ row }) => {
          const o = row.original;
          const meta = STATUS[o.status];
          const open = !["delivered", "cancelled"].includes(o.status);
          return (
            <RowMenu
              label={`Actions for ${o.id}`}
              items={[
                { label: "View order", icon: <Eye size={15} />, onSelect: () => navigate(`/admin/orders/${o.id}`) },
                open && { label: meta.action, icon: <ArrowRightCircle size={15} />, onSelect: () => advance([o], meta.next) },
                { label: "WhatsApp customer", icon: <MessageCircle size={15} />, href: `https://wa.me/${waNumber(o.customer.phone)}` },
                open && "sep",
                open && { label: "Cancel order", icon: <XCircle size={15} />, danger: true, onSelect: () => setCancelling(o) },
              ]}
            />
          );
        },
      },
    ],
    [navigate, advance]
  );

  const shown = useMemo(() => {
    if (!all) return [];
    const term = q.trim().toLowerCase();
    return all.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!term ||
          o.id.toLowerCase().includes(term) ||
          customerName(o.customer).toLowerCase().includes(term) ||
          o.customer.phone.includes(term) ||
          o.customer.email.toLowerCase().includes(term))
    );
  }, [all, status, q]);

  if (!all) return <p className="a-muted">Loading…</p>;

  const count = (s) => (s === "all" ? all.length : all.filter((o) => o.status === s).length);

  // one button per next step that applies to at least one ticked order
  const bulkBar = (rows, clear) =>
    ["paid", "processing", "shipped", "delivered"].map((next) => {
      const eligible = rows.filter((o) => STATUS[o.status].next === next);
      if (!eligible.length) return null;
      const from = ORDER_STATUSES.find((s) => STATUS[s].next === next);
      return (
        <button
          key={next}
          className="a-btn small ghost"
          onClick={async () => {
            await advance(eligible, next);
            clear();
          }}
        >
          {STATUS[from].action} ({eligible.length})
        </button>
      );
    });

  return (
    <>
      <PageHead title="Orders" sub={`${all.length} orders in total`} />

      <div className="a-tabs" role="tablist" aria-label="Filter by status">
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

      <section className="a-card flush">
        <div className="a-toolbar">
          <label className="a-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by order number, name, phone or email"
              aria-label="Search orders"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <span className="a-muted small">Tick orders to update several at once</span>
        </div>
        <DataTable
          data={shown}
          columns={columns}
          getRowId={(o) => o.id}
          label="Orders"
          selectable
          bulkBar={bulkBar}
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
          empty={q ? `No orders match “${q}”.` : "No orders with this status."}
        />
      </section>

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(v) => !v && setCancelling(null)}
        title={`Cancel order ${cancelling?.id}?`}
        body="The order moves to Cancelled. If the customer has paid, refund them separately."
        confirmLabel="Cancel order"
        danger
        onConfirm={() => advance([cancelling], "cancelled")}
      />
    </>
  );
};

export default Orders;
