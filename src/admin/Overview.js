import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import {
  ArrowRight,
  PackageCheck,
  Clock,
  AlertTriangle,
  CircleCheck,
  Truck,
  Banknote,
  ShoppingBag,
  XCircle,
  Sparkles,
  Users,
  Plus,
} from "lucide-react";
import { listOrders, listProducts } from "./api";
import { availability } from "../availability";
import { categoryName } from "../pages/Products";
import { DEMO } from "../config";
import ProductImage from "../components/ProductImage";
import SalesChart, { dailySales } from "./SalesChart";
import DataTable from "./DataTable";
import { ADMIN_USER, StatusBadge, Delta, Avatar, ksh, shortDate, customerName } from "./ui";

const DAY = 86400000;
const RANGES = [7, 30];

const isPaid = (o) => o.payment.status === "paid" && o.status !== "cancelled";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
};

// what each step in an order's history reads like in the activity feed
const EVENT = {
  pending_payment: { icon: ShoppingBag, text: (o) => <>New order from <b>{customerName(o.customer)}</b></> },
  paid: { icon: Banknote, text: (o) => <><b>{customerName(o.customer)}</b> paid {ksh(o.totals.total)}</> },
  processing: { icon: Sparkles, text: (o) => <>Started preparing <b>{o.id}</b></> },
  shipped: { icon: Truck, text: (o) => <><b>{o.id}</b> sent to {o.delivery.area}</> },
  delivered: { icon: CircleCheck, text: (o) => <><b>{o.id}</b> delivered</> },
  cancelled: { icon: XCircle, text: (o) => <><b>{o.id}</b> cancelled</> },
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

const SparkTip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="a-tip dark">
      <span>{payload[0].payload.label}</span>
      <b>{ksh(payload[0].payload.sales)}</b>
    </div>
  ) : null;

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

    const byProduct = new Map();
    const byCategory = new Map();
    cur.forEach((o) =>
      o.items.forEach((i) => {
        const p = byProduct.get(i.productId) || { id: i.productId, name: i.name, units: 0, sales: 0 };
        p.units += i.quantity;
        p.sales += i.lineTotal;
        byProduct.set(i.productId, p);
        const cat = products.find((x) => String(x.id) === String(i.productId))?.category || "other";
        byCategory.set(cat, (byCategory.get(cat) || 0) + i.lineTotal);
      })
    );

    const activity = orders
      .flatMap((o) => (o.history || []).map((h) => ({ ...h, order: o })))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 7);

    const placed = orders.filter((o) => inRange(o, now - days * DAY, now + 1));
    const split = [
      { key: "delivered", label: "Delivered", count: placed.filter((o) => o.status === "delivered").length },
      { key: "moving", label: "In progress", count: placed.filter((o) => ["paid", "processing", "shipped"].includes(o.status)).length },
      { key: "waiting", label: "Awaiting payment", count: placed.filter((o) => o.status === "pending_payment").length },
      { key: "off", label: "Cancelled", count: placed.filter((o) => o.status === "cancelled").length },
    ];

    return {
      placed: placed.length,
      split,
      customers: new Set(orders.map((o) => o.customer.phone)).size,
      sales: sum(cur),
      salesBefore: sum(prev),
      count: cur.length,
      countBefore: prev.length,
      avg: cur.length ? sum(cur) / cur.length : 0,
      avgBefore: prev.length ? sum(prev) / prev.length : 0,
      units: cur.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0),
      top: [...byProduct.values()].sort((a, b) => b.sales - a.sales).slice(0, 5),
      categories: [...byCategory.entries()].map(([slug, sales]) => ({ slug, sales })).sort((a, b) => b.sales - a.sales),
      daily: dailySales(orders, days),
      activity,
    };
  }, [orders, products, days]);

  if (!orders) return <p className="a-muted">Loading…</p>;

  const toPrepare = orders.filter((o) => ["paid", "processing"].includes(o.status));
  const awaiting = orders.filter((o) => o.status === "pending_payment");
  const lowStock = products.filter((p) => availability(p)?.soldOut || availability(p)?.low);
  const topMax = Math.max(1, ...stats.top.map((p) => p.sales));
  const catMax = Math.max(1, ...stats.categories.map((c) => c.sales));
  const catTotal = Math.max(1, stats.categories.reduce((s, c) => s + c.sales, 0));
  const productOf = (id) => products.find((p) => String(p.id) === String(id));
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });

  const tiles = [
    { icon: PackageCheck, tone: "tan", label: "To prepare", value: toPrepare.length, to: "/admin/orders?status=paid" },
    { icon: Clock, tone: "gold", label: "Awaiting payment", value: awaiting.length, to: "/admin/orders?status=pending_payment" },
    { icon: AlertTriangle, tone: "oxblood", label: "Sold out or low", value: lowStock.length, to: "/admin/products" },
    { icon: Users, tone: "olive", label: "Customers", value: stats.customers, to: "/admin/customers" },
  ];

  return (
    <>
      <div className="a-ov">
        <div className="a-ov-main">
        {/* leather header: the period at a glance */}
        <section className="a-hero">
          <div className="a-hero-top">
            <div>
              <h1>{greeting()}, {ADMIN_USER.firstName}</h1>
              <p className="a-hero-sub">{today}</p>
            </div>
            <div className="a-segment dark" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r} aria-pressed={days === r} onClick={() => setDays(r)}>
                  Last {r} days
                </button>
              ))}
            </div>
          </div>

          <div className="a-hero-body">
            <div className="a-hero-figure">
              <span className="a-hero-label">Sales, last {days} days</span>
              <span className="a-hero-value">{ksh(stats.sales)}</span>
              <span className="a-hero-delta">
                <Delta now={stats.sales} before={stats.salesBefore} /> on the previous {days} days
              </span>
            </div>
            <div className="a-hero-spark" aria-hidden="true">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={stats.daily} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e6c88c" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#e6c88c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<SparkTip />} cursor={{ stroke: "rgba(230,200,140,.5)", strokeDasharray: "3 3" }} isAnimationActive={false} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#e6c88c"
                    strokeWidth={2}
                    fill="url(#heroFill)"
                    activeDot={{ r: 4, fill: "#e6c88c", stroke: "#2e1d12", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <dl className="a-hero-stats">
            <div>
              <dt>Paid orders</dt>
              <dd>{stats.count}</dd>
              <Delta now={stats.count} before={stats.countBefore} />
            </div>
            <div>
              <dt>Average order</dt>
              <dd>{stats.count ? ksh(stats.avg) : "—"}</dd>
              <Delta now={stats.avg} before={stats.avgBefore} />
            </div>
            <div>
              <dt>Pieces sold</dt>
              <dd>{stats.units}</dd>
              <span className="a-delta flat">handmade and sent</span>
            </div>
          </dl>
        </section>

          <SalesChart orders={orders} days={days} />

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
                {stats.top.map((p, i) => {
                  const product = productOf(p.id);
                  return (
                    <li key={p.id}>
                      <span className="a-rank-thumb">
                        {product ? <ProductImage src={product.image} product={product} alt="" eager /> : null}
                        <span className="a-rank-n">{i + 1}</span>
                      </span>
                      <span className="a-rank-body">
                        <span className="a-rank-row">
                          <Link to={`/admin/products/${p.id}`} className="a-strong">{p.name}</Link>
                          <span className="a-strong">{ksh(p.sales)}</span>
                        </span>
                        <span className="a-meter thin"><span style={{ width: `${(p.sales / topMax) * 100}%` }} /></span>
                        <span className="a-muted small">{p.units} sold</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <div className="a-ov-side">
          <section className="a-card">
            <div className="a-card-head">
              <div>
                <h2>Orders, last {days} days</h2>
                <p className="a-muted small">{stats.placed} placed</p>
              </div>
              <Link to="/admin/orders" className="a-link small">View all</Link>
            </div>
            <div className="a-split" role="img" aria-label={stats.split.map((x) => `${x.label} ${x.count}`).join(", ")}>
              {stats.split.filter((x) => x.count > 0).map((x) => (
                <span key={x.key} className={`a-split-seg ${x.key}`} style={{ flexGrow: x.count }} />
              ))}
            </div>
            <dl className="a-split-legend">
              {stats.split.map((x) => (
                <div key={x.key}>
                  <dt><span className={`a-split-dot ${x.key}`} />{x.label}</dt>
                  <dd>{x.count}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="a-mini-tiles">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.label} to={t.to} className="a-mini">
                  <span className={`a-mini-icon ${t.tone}`}><Icon size={18} strokeWidth={1.9} /></span>
                  <span className="a-mini-label">{t.label}</span>
                  <span className="a-mini-value">{t.value}</span>
                </Link>
              );
            })}
          </div>

          <section className="a-promo">
            {DEMO ? (
              <>
                <h2>Add your real pieces before launch</h2>
                <p>The shop is showing sample products. Swap in your own pieces and photos when they're ready.</p>
                <Link to="/admin/products/new" className="a-promo-btn"><Plus size={15} /> Add a product</Link>
              </>
            ) : (
              <>
                <h2>See the shop the way customers do</h2>
                <p>Check new pieces, prices and photos look right on the live site.</p>
                <a href="/" target="_blank" rel="noreferrer" className="a-promo-btn">Open the shop <ArrowRight size={15} /></a>
              </>
            )}
          </section>

          <section className="a-card">
            <div className="a-card-head">
              <div>
                <h2>Recent activity</h2>
                <p className="a-muted small">Orders and payments as they happen</p>
              </div>
            </div>
            <ol className="a-feed">
              {stats.activity.map((e, k) => {
                const ev = EVENT[e.status];
                const Icon = ev.icon;
                return (
                  <li key={k} className={`s-${e.status}`}>
                    <span className="a-feed-icon"><Icon size={15} strokeWidth={1.9} /></span>
                    <Link to={`/admin/orders/${e.order.id}`} className="a-feed-text">{ev.text(e.order)}</Link>
                    <span className="a-feed-time">{ago(e.at)}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="a-card">
            <div className="a-card-head">
              <div>
                <h2>Sales by category</h2>
                <p className="a-muted small">Last {days} days</p>
              </div>
            </div>
            {stats.categories.length === 0 ? (
              <p className="a-muted">No sales in this period.</p>
            ) : (
              <ul className="a-meter-list">
                {stats.categories.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/admin/products`}>
                      <span className="a-meter-label">{categoryName(c.slug)}</span>
                      <span className="a-meter-value">
                        {ksh(c.sales)} <span className="a-muted small">· {Math.round((c.sales / catTotal) * 100)}%</span>
                      </span>
                      <span className="a-meter"><span style={{ width: `${(c.sales / catMax) * 100}%` }} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
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
