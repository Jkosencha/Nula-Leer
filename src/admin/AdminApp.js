import React, { useCallback, useEffect, useState } from "react";
import { NavLink, Link, Routes, Route, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ExternalLink,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  RotateCcw,
  LogOut,
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
import { ConfirmDialog } from "./ui";
import usePageTitle from "../usePageTitle";
import "./admin.css";

const NAV = [
  { group: null, items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }] },
  {
    group: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag, count: "toPrepare" },
      { to: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  { group: "Catalogue", items: [{ to: "/admin/products", label: "Products", icon: Package }] },
];

const CRUMBS = { orders: "Orders", products: "Products", customers: "Customers", new: "New product" };

const readCollapsed = () => {
  try {
    return localStorage.getItem("admin.sidebar") === "collapsed";
  } catch (e) {
    return false;
  }
};

const SideNav = ({ collapsed, counts, onReset, email }) => (
  <>
    <div className="a-brand">
      <Link to="/admin" aria-label="Nula Leer admin home">
        {collapsed ? "NL" : "Nula Leer"}
      </Link>
    </div>

    <nav className="a-nav" aria-label="Dashboard">
      {NAV.map((g, gi) => (
        <div key={gi} className="a-nav-group">
          {g.group && !collapsed && <p className="a-nav-label">{g.group}</p>}
          {g.items.map((n) => {
            const Icon = n.icon;
            const count = n.count ? counts[n.count] : 0;
            const link = (
              <NavLink to={n.to} end={n.end} aria-label={collapsed ? n.label : undefined}>
                <Icon size={18} strokeWidth={1.75} />
                {!collapsed && <span>{n.label}</span>}
                {count > 0 && <span className="a-nav-count" aria-label={`${count} to prepare`}>{count}</span>}
              </NavLink>
            );
            return collapsed ? (
              <Tooltip.Root key={n.to}>
                <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={10} className="a-tooltip">{n.label}</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ) : (
              <React.Fragment key={n.to}>{link}</React.Fragment>
            );
          })}
        </div>
      ))}
    </nav>

    <div className="a-side-foot">
      {email && !collapsed && (
        <div className="a-user">
          <span className="a-user-email" title={email}>{email}</span>
          <button className="a-side-btn" onClick={() => supabase.auth.signOut()}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
      {!email && !collapsed && (
        <div className="a-preview-card">
          <p className="a-strong">Preview mode</p>
          <p>Sample orders kept in this browser. Live orders and sign-in come with the backend.</p>
          <button className="a-side-btn" onClick={onReset}>
            <RotateCcw size={14} /> Reset sample data
          </button>
        </div>
      )}
      <a href="/" className="a-viewshop" target="_blank" rel="noreferrer" aria-label="View shop">
        <ExternalLink size={16} strokeWidth={1.75} />
        {!collapsed && "View shop"}
      </a>
    </div>
  </>
);

// The whole admin area. Not linked from the shop; reached at /admin.
const AdminApp = ({ email }) => {
  usePageTitle("Admin");
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [counts, setCounts] = useState({ toPrepare: 0 });

  useEffect(() => setSheetOpen(false), [pathname]);

  // nav badge: paid orders waiting to be prepared or sent
  useEffect(() => {
    listOrders().then((orders) =>
      setCounts({ toPrepare: orders.filter((o) => ["paid", "processing"].includes(o.status)).length })
    );
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("admin.sidebar", c ? "open" : "collapsed");
      } catch (e) {
        // fine: it just won't be remembered
      }
      return !c;
    });
  };

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
  const crumbs = [{ label: "Overview", to: "/admin" }].concat(
    parts.map((p, i) => ({
      label: CRUMBS[p] || (parts[0] === "orders" ? p : `Edit product`),
      to: `/admin/${parts.slice(0, i + 1).join("/")}`,
    }))
  );
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className={`admin ${collapsed ? "collapsed" : ""}`}>
        <aside className="a-side">
          <SideNav collapsed={collapsed} counts={counts} email={email} onReset={() => setResetOpen(true)} />
        </aside>

        {/* phones: the same navigation in a sheet */}
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="a-overlay" />
            <Dialog.Content className="a-sheet" aria-describedby={undefined}>
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <SideNav collapsed={false} counts={counts} email={email} onReset={() => setResetOpen(true)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="a-main">
          <header className="a-top">
            <button className="a-icon-btn a-burger" aria-label="Open menu" onClick={() => setSheetOpen(true)}>
              <Menu size={20} />
            </button>
            <button
              className="a-icon-btn a-collapse"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleCollapsed}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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

            <button className="a-search-trigger" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>Search orders, products…</span>
              <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
            </button>
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
    </Tooltip.Provider>
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
