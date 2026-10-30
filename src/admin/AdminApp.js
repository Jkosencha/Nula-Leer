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
} from "lucide-react";
import Overview from "./Overview";
import Orders from "./Orders";
import OrderDetail from "./OrderDetail";
import Products from "./Products";
import ProductForm from "./ProductForm";
import Customers from "./Customers";
import CommandMenu from "./CommandMenu";
import { listOrders, resetSampleData } from "./api";
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

const SideNav = ({ collapsed, counts, onReset }) => (
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
      {!collapsed && (
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
const AdminApp = () => {
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
          <SideNav collapsed={collapsed} counts={counts} onReset={() => setResetOpen(true)} />
        </aside>

        {/* phones: the same navigation in a sheet */}
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="a-overlay" />
            <Dialog.Content className="a-sheet" aria-describedby={undefined}>
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <SideNav collapsed={false} counts={counts} onReset={() => setResetOpen(true)} />
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

export default AdminApp;
