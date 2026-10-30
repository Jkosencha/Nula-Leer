import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Banknote, ShoppingBag, Receipt, PackageCheck } from "lucide-react";
import { listOrders, listProducts } from "./api";
import { availability } from "../availability";
import SalesChart from "./SalesChart";
import DataTable from "./DataTable";
import { ADMIN_USER, PageHead, StatusBadge, Delta, Avatar, STATUS, ksh, shortDate, customerName } from "./ui";

const DAY = 86400000;
const RANGES = [7, 30];

const isPaid = (o) => o.payment.status === "paid" && o.status !== "cancelled";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const latestColumns = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => <Link to={`/admin/orders/${row.original.id}`} className="a-strong">{row.original.id}</Link>,
  },
  {
    id: "customer",
    header: "Customer",
    accessorFn: (o) => customerName(o.customer),
    cell: ({ row }) => (
      <span className="a-person">
        <Avatar person={row.original.customer} />
        {customerName(row.original.customer)}
      </span>
    ),
  },
  { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => shortDate(getValue()) },
  { id: "total", header: "Total", accessorFn: (o) => o.totals.total, cell: ({ getValue }) => ksh(getValue()), meta: { align: "right" } },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
];

const Overview = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    listOrders().then(setOrders);
    listProducts().then(setProducts);
  }, []);

  const stats = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const inRange = (o, from, to) => {
      const t = new Date(o.createdAt).getTime();
      return t >= from && t < to;
    };
    const cur = orders.filter((o) => isPaid(o) && inRange(o, now - days * DAY, now + 1));
    const prev = orders.filter((o) => isPaid(o) && inRange(o, now - 2 * days * DAY, now - days * DAY));
    const sum = (list) => list.reduce((s, o) => s + o.totals.total, 0);

    // best sellers by takings in the range
    const byProduct = new Map();
    cur.forEach((o) =>
      o.items.forEach((i) => {
        const p = byProduct.get(i.productId) || { id: i.productId, name: i.name, units: 0, sales: 0 };
        p.units += i.quantity;
        p.sales += i.lineTotal;
        byProduct.set(i.productId, p);
      })
    );

    return {
      sales: sum(cur),
      salesBefore: sum(prev),
      count: cur.length,
      countBefore: prev.length,
      avg: cur.length ? sum(cur) / cur.length : 0,
      avgBefore: prev.length ? sum(prev) / prev.length : 0,
      top: [...byProduct.values()].sort((a, b) => b.sales - a.sales).slice(0, 5),
      pipeline: ["pending_payment", "paid", "processing", "shipped"].map((s) => ({
        status: s,
        count: orders.filter((o) => o.status === s).length,
      })),
    };
  }, [orders, days]);

  if (!orders) return <p className="a-muted">Loading…</p>;

  const toPrepare = orders.filter((o) => ["paid", "processing"].includes(o.status)).length;
  const awaiting = orders.filter((o) => o.status === "pending_payment").length;
  const lowStock = products.filter((p) => availability(p)?.soldOut || availability(p)?.low);
  const topMax = Math.max(1, ...stats.top.map((p) => p.sales));
  const pipeMax = Math.max(1, ...stats.pipeline.map((p) => p.count));
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });

  const tiles = [
    { label: "Sales", icon: Banknote, value: ksh(stats.sales), delta: <Delta now={stats.sales} before={stats.salesBefore} /> },
    { label: "Paid orders", icon: Receipt, value: stats.count, delta: <Delta now={stats.count} before={stats.countBefore} /> },
    {
      label: "Average order",
      icon: ShoppingBag,
      value: stats.count ? ksh(stats.avg) : "—",
      delta: <Delta now={stats.avg} before={stats.avgBefore} />,
    },
    {
      label: "To prepare and send",
      icon: PackageCheck,
      value: toPrepare,
      delta: <span className="a-muted">{awaiting} awaiting payment</span>,
      to: "/admin/orders?status=paid",
    },
  ];

  return (
    <>
      <PageHead title={`${greeting()}, ${ADMIN_USER.firstName}`} sub={`Here's how the shop is doing. ${today}.`}>
        <div className="a-segment" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} aria-pressed={days === r} onClick={() => setDays(r)}>
              Last {r} days
            </button>
          ))}
        </div>
      </PageHead>

      <div className="a-tiles">
        {tiles.map((t) => {
          const Icon = t.icon;
          const body = (
            <>
              <span className="a-tile-top">
                <span className="a-tile-label">{t.label}</span>
                <span className="a-tile-icon"><Icon size={16} strokeWidth={1.75} /></span>
              </span>
              <span className="a-tile-value">{t.value}</span>
              <span className="a-tile-foot">
                {t.delta}
                {!t.to && <span className="a-muted"> vs previous {days} days</span>}
              </span>
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
        <SalesChart orders={orders} days={days} />

        <section className="a-card">
          <div className="a-card-head">
            <div>
              <h2>Open orders</h2>
              <p className="a-muted small">Where each unfinished order is now</p>
            </div>
          </div>
          <ul className="a-meter-list">
            {stats.pipeline.map((p) => (
              <li key={p.status}>
                <Link to={`/admin/orders?status=${p.status}`}>
                  <span className="a-meter-label">{STATUS[p.status].label}</span>
                  <span className="a-meter-value">{p.count}</span>
                  <span className="a-meter"><span style={{ width: `${(p.count / pipeMax) * 100}%` }} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="a-grid-2 even">
        <section className="a-card">
          <div className="a-card-head">
            <div>
              <h2>Best sellers</h2>
              <p className="a-muted small">By takings, last {days} days</p>
            </div>
            <Link to="/admin/products" className="a-link small">Products</Link>
          </div>
          {stats.top.length === 0 ? (
            <p className="a-muted">No sales in this period.</p>
          ) : (
            <ol className="a-rank">
              {stats.top.map((p, i) => (
                <li key={p.id}>
                  <span className="a-rank-n">{i + 1}</span>
                  <span className="a-rank-body">
                    <span className="a-rank-row">
                      <Link to={`/admin/products/${p.id}`} className="a-strong">{p.name}</Link>
                      <span>{ksh(p.sales)}</span>
                    </span>
                    <span className="a-meter thin"><span style={{ width: `${(p.sales / topMax) * 100}%` }} /></span>
                    <span className="a-muted small">{p.units} sold</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <div>
              <h2>Stock to watch</h2>
              <p className="a-muted small">Sold out or running low</p>
            </div>
          </div>
          {lowStock.length === 0 ? (
            <p className="a-muted">Nothing running low.</p>
          ) : (
            <ul className="a-list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}`} className="a-strong">{p.name}</Link>
                  <span className={availability(p).soldOut ? "a-badge off" : "a-badge wait"}>{availability(p).label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="a-card flush">
        <div className="a-card-head padded">
          <h2>Latest orders</h2>
          <Link to="/admin/orders" className="a-link small">All orders <ArrowRight size={14} /></Link>
        </div>
        <DataTable
          data={orders.slice(0, 6)}
          columns={latestColumns}
          getRowId={(o) => o.id}
          pageSize={6}
          label="Latest orders"
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
        />
      </section>
    </>
  );
};

export default Overview;
