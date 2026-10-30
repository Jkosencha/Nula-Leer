import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { LayoutDashboard, ShoppingBag, Package, Users, Plus, ExternalLink, Receipt, Tag } from "lucide-react";
import { listOrders, listProducts } from "./api";
import { STATUS, customerName, ksh } from "./ui";

const PAGES = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Orders to prepare", to: "/admin/orders?status=paid", icon: ShoppingBag },
  { label: "Orders awaiting payment", to: "/admin/orders?status=pending_payment", icon: ShoppingBag },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Customers", to: "/admin/customers", icon: Users },
];

// ⌘K / Ctrl K: jump to any page, order or product by typing.
const CommandMenu = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!open) return;
    listOrders().then(setOrders);
    listProducts().then(setProducts);
  }, [open]);

  const go = (to) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="a-overlay" />
        <Dialog.Content className="a-cmdk" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Search the dashboard</Dialog.Title>
          <Command label="Search the dashboard">
            <Command.Input placeholder="Search orders, customers, products or pages" />
            <Command.List>
              <Command.Empty>No matches.</Command.Empty>

              <Command.Group heading="Pages">
                {PAGES.map((p) => (
                  <Command.Item key={p.to} value={`page ${p.label}`} onSelect={() => go(p.to)}>
                    <p.icon size={16} /> {p.label}
                  </Command.Item>
                ))}
                <Command.Item value="action add new product" onSelect={() => go("/admin/products/new")}>
                  <Plus size={16} /> Add a product
                </Command.Item>
                <Command.Item
                  value="action view shop"
                  onSelect={() => {
                    onOpenChange(false);
                    window.open("/", "_blank", "noopener");
                  }}
                >
                  <ExternalLink size={16} /> View shop
                </Command.Item>
              </Command.Group>

              {orders.length > 0 && (
                <Command.Group heading="Orders">
                  {orders.map((o) => (
                    <Command.Item
                      key={o.id}
                      value={`order ${o.id} ${customerName(o.customer)} ${o.customer.phone}`}
                      onSelect={() => go(`/admin/orders/${o.id}`)}
                    >
                      <Receipt size={16} />
                      <span className="a-cmdk-main">
                        {o.id} · {customerName(o.customer)}
                      </span>
                      <span className="a-cmdk-meta">
                        {STATUS[o.status].label} · {ksh(o.totals.total)}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {products.length > 0 && (
                <Command.Group heading="Products">
                  {products.map((p) => (
                    <Command.Item
                      key={p.id}
                      value={`product ${p.name} ${p.category}`}
                      onSelect={() => go(`/admin/products/${p.id}`)}
                    >
                      <Tag size={16} />
                      <span className="a-cmdk-main">{p.name}</span>
                      <span className="a-cmdk-meta">{ksh(p.price)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandMenu;
