import React, { useCallback, useEffect, useState } from "react";
import { NavLink, Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ExternalLink,
  Menu,
  Search,
  Bell,
  ChevronDown,
  RotateCcw,
  LogOut,
  Banknote,
} from "lucide-react";
import Overview from "./Overview";
import Orders from "./Orders";
import OrderDetail from "./OrderDetail";
import Products from "./Products";
import ProductForm from "./ProductForm";
import Customers from "./Customers";
import CommandMenu from "./CommandMenu";
import Login from "./Login";
import { listOrders, resetSampleData, BACKEND } from "./api";
import { supabase } from "./backend";
import { ADMIN_USER, ConfirmDialog, Avatar, ksh, customerName } from "./ui";
import usePageTitle from "../usePageTitle";
import "./admin.css";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, count: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

const CRUMBS = { orders: "Orders", products: "Products", customers: "Customers", new: "New product" };

// Floating leather rail: icon above label, like a tool belt.
const Rail = ({ toPrepare }) => (
  <>
    <Link to="/admin" className="a-mono" aria-label="Nula Leer dashboard home">NL</Link>
    <nav className="a-rail-nav" aria-label="Dashboard">
      {NAV.map((n) => {
        const Icon = n.icon;
        return (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <span className="a-rail-icon">
              <Icon size={20} strokeWidth={1.75} />
              {n.count && toPrepare > 0 && <span className="a-rail-count" aria-label={`${toPrepare} to prepare`}>{toPrepare}</span>}
            </span>
            <span>{n.label}</span>
          </NavLink>
        );
      })}
    </nav>
    <a href="/" className="a-rail-shop" target="_blank" rel="noreferrer">
      <span className="a-rail-icon"><ExternalLink size={18} strokeWidth={1.75} /></span>
      <span>View shop</span>
    </a>
  </>
);

// Bell: paid orders still waiting to be prepared or sent.
const Notifications = ({ waiting }) => {
  const navigate = useNavigate();
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="a-round-btn" aria-label={`Notifications, ${waiting.length} orders to prepare`}>
        <Bell size={18} />
        {waiting.length > 0 && <span className="a-dot" />}
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className="a-menu wide" align="end" sideOffset={8}>
          <p className="a-menu-title">To prepare and send</p>
          {waiting.length === 0 && <p className="a-menu-empty">You're all caught up.</p>}
          {waiting.slice(0, 6).map((o) => (
            <Dropdown.Item key={o.id} className="a-menu-item tall" onSelect={() => navigate(`/admin/orders/${o.id}`)}>
              <span className="a-menu-ic"><Banknote size={15} /></span>
              <span className="a-menu-text">
                <b>{customerName(o.customer)}</b> paid {ksh(o.totals.total)}
                <small>{o.id} · {o.delivery.area}</small>
              </span>
            </Dropdown.Item>
          ))}
          {waiting.length > 0 && (
            <>
              <Dropdown.Separator className="a-menu-sep" />
              <Dropdown.Item className="a-menu-item" onSelect={() => navigate("/admin/orders?status=paid")}>
                See all orders to prepare
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

const UserMenu = ({ email, onReset }) => (
  <Dropdown.Root>
    <Dropdown.Trigger className="a-user-pill">
      <Avatar person={ADMIN_USER} />
      <span className="a-user-name">
        {ADMIN_USER.firstName} {ADMIN_USER.lastName}
        <small>{email ? ADMIN_USER.role : "Preview mode"}</small>
      </span>
      <ChevronDown size={16} />
    </Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Content className="a-menu" align="end" sideOffset={8}>
        {email ? (
          <p className="a-menu-title">{email}</p>
        ) : (
          <p className="a-menu-note">Sample orders kept in this browser. Live orders arrive once the backend is connected.</p>
        )}
        <Dropdown.Item className="a-menu-item" onSelect={() => window.open("/", "_blank", "noopener")}>
          <ExternalLink size={15} /> View shop
        </Dropdown.Item>
        <Dropdown.Separator className="a-menu-sep" />
        {email ? (
          <Dropdown.Item className="a-menu-item" onSelect={() => supabase.auth.signOut()}>
            <LogOut size={15} /> Sign out
          </Dropdown.Item>
        ) : (
          <Dropdown.Item className="a-menu-item" onSelect={onReset}>
            <RotateCcw size={15} /> Reset sample data
          </Dropdown.Item>
        )}
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);

// The whole admin area. Not linked from the shop; reached at /admin.
const AdminApp = ({ email }) => {
  usePageTitle("Admin");
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [waiting, setWaiting] = useState([]);

  useEffect(() => setSheetOpen(false), [pathname]);

  // rail badge and bell: paid orders waiting to be prepared or sent
  useEffect(() => {
    listOrders().then((orders) => setWaiting(orders.filter((o) => ["paid", "processing"].includes(o.status))));
  }, [pathname]);

  const onKey = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setSearchOpen((o) => !o);
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumbs = [{ label: "Dashboard", to: "/admin" }].concat(
    parts.map((p, i) => ({
      label: CRUMBS[p] || (parts[0] === "orders" ? p : `Edit product`),
      to: `/admin/${parts.slice(0, i + 1).join("/")}`,
    }))
  );
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="admin">
      <aside className="a-rail">
        <Rail toPrepare={waiting.length} />
      </aside>

      {/* phones: the same rail in a sheet */}
      <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="a-overlay" />
          <Dialog.Content className="a-rail a-sheet" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Rail toPrepare={waiting.length} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="a-main">
        <header className="a-top">
          <button className="a-round-btn a-burger" aria-label="Open menu" onClick={() => setSheetOpen(true)}>
            <Menu size={18} />
          </button>

          <nav aria-label="Breadcrumb" className="a-crumbs">
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.to}>
                  {i === crumbs.length - 1 ? <span aria-current="page">{c.label}</span> : <Link to={c.to}>{c.label}</Link>}
                </li>
              ))}
            </ol>
          </nav>

          <div className="a-top-right">
            <button className="a-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={16} />
              <span>Search orders, products…</span>
              <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
            </button>
            <Notifications waiting={waiting} />
            <UserMenu email={email} onReset={() => setResetOpen(true)} />
          </div>
        </header>

        <main className="a-content">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="customers" element={<Customers />} />
            <Route path="*" element={<p className="a-muted">Page not found.</p>} />
          </Routes>
        </main>
      </div>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset sample data?"
        body="This clears the sample orders and product edits in this browser and starts again with fresh sample data."
        confirmLabel="Reset"
        danger
        onConfirm={async () => {
          await resetSampleData();
          window.location.reload();
        }}
      />
    </div>
  );
};

// With a backend, the dashboard opens only for signed-in admins; without one it
// runs on sample data with no sign-in.
const AdminGate = () => {
  const [auth, setAuth] = useState(BACKEND ? { loading: true } : { email: null, allowed: true });

  useEffect(() => {
    if (!BACKEND) return undefined;
    const check = async (session) => {
      if (!session) return setAuth({ allowed: false });
      // the admins table only returns rows to admins (supabase/schema.sql)
      const { data } = await supabase.from("admins").select("email").limit(1);
      setAuth({ email: session.user.email, allowed: data?.length > 0, denied: !data?.length });
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    // deferred: Supabase calls made inside this listener can stall
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setTimeout(() => check(session), 0));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (auth.loading) return <div className="a-login"><p className="a-muted">Loading…</p></div>;
  if (!auth.allowed) return <Login denied={auth.denied} />;
  return <AdminApp email={auth.email} />;
};

export default AdminGate;
