// Admin data layer. Every screen in the dashboard reads and writes through these
// functions, which return promises like real API calls. For now they're backed by
// the browser's localStorage (seeded with sample data); when the backend exists,
// swap each body for a fetch() to the matching endpoint and the screens won't change.
//
//   listOrders({ status, q })      GET    /api/orders?status=&q=
//   getOrder(id)                   GET    /api/orders/:id
//   saveOrder(order)               POST   /api/orders
//   updateOrderStatus(id, s, note) PATCH  /api/orders/:id/status
//   addOrderNote(id, note)         POST   /api/orders/:id/notes
//   listProducts()                 GET    /api/products
//   getProduct(id)                 GET    /api/products/:id
//   saveProduct(product)           PUT    /api/products/:id  (POST when new)
//   deleteProduct(id)              DELETE /api/products/:id
//   listCustomers()                GET    /api/customers

import shopProducts from "../pages/Products";
import { ORDER_STATUSES } from "../orders";

const ORDERS_KEY = "admin.orders";
const PRODUCTS_KEY = "admin.products";

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage full or blocked: changes last until the page is reloaded
  }
};
const respond = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

// ---------- sample data (only used until a backend exists) ----------

const SAMPLE_CUSTOMERS = [
  ["Amina", "Wanjiru", "Westlands", 200],
  ["Brian", "Otieno", "Kisumu", 400],
  ["Cynthia", "Mutua", "CBD", 150],
  ["David", "Kamau", "Karen", 250],
  ["Esther", "Njeri", "Kiambu", 300],
  ["Felix", "Ochieng", "Nakuru", 350],
  ["Grace", "Akinyi", "Mombasa", 1300],
  ["Hassan", "Ali", "Ngong", 100],
];

// small deterministic random so the sample data is the same on every load
const seeded = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const seedOrders = () => {
  const rand = seeded(7);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const products = shopProducts.filter((p) => p.stock !== 0);
  if (products.length === 0) return [];

  const orders = [];
  for (let i = 0; i < 26; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const created = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 8) * 3600000);
    const who = Math.floor(rand() * SAMPLE_CUSTOMERS.length);
    const [firstName, lastName, area, fee] = SAMPLE_CUSTOMERS[who];
    const lines = [pick(products), ...(rand() > 0.6 ? [pick(products)] : [])];
    const items = [...new Map(lines.map((p) => [p.id, p])).values()].map((p) => {
      const quantity = rand() > 0.85 ? 2 : 1;
      return {
        productId: p.id,
        name: p.name,
        colour: null,
        quantity,
        unitPrice: p.price,
        lineTotal: p.price * quantity,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);

    // older orders are further along
    const status =
      daysAgo > 12
        ? rand() > 0.12 ? "delivered" : "cancelled"
        : daysAgo > 6
          ? pick(["shipped", "delivered", "processing"])
          : pick(["pending_payment", "paid", "paid", "processing"]);
    const flow = ["pending_payment", "paid", "processing", "shipped", "delivered"];
    const reached = status === "cancelled" ? ["pending_payment", "cancelled"] : flow.slice(0, flow.indexOf(status) + 1);
    // space the steps out, but never past the current time
    const step = Math.min(20 * 3600000, (Date.now() - created.getTime()) / reached.length);
    const history = reached.map((s, k) => ({ status: s, at: new Date(created.getTime() + k * step).toISOString(), note: "" }));
    const paid = !["pending_payment", "cancelled"].includes(status);

    orders.push({
      id: `NL-${Math.floor(created.getTime() / 1000).toString(36).toUpperCase().slice(-5)}${i}`,
      createdAt: created.toISOString(),
      status,
      customer: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `07${String(12345678 + who * 9876543).slice(0, 8)}`, // one fixed number per sample customer
      },
      delivery: { area, fee, address: "Sample address", notes: "" },
      gift: { isGift: rand() > 0.8, message: "" },
      items,
      totals: { subtotal, delivery: fee, discount: 0, total: subtotal + fee },
      payment: {
        method: rand() > 0.3 ? "mpesa" : "card",
        status: paid ? "paid" : "unpaid",
        reference: paid ? `S${Math.floor(rand() * 1e9).toString(36).toUpperCase()}` : null,
      },
      history,
      notes: [],
      sample: true,
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

const allOrders = () => {
  let orders = read(ORDERS_KEY);
  if (!orders) {
    orders = seedOrders();
    write(ORDERS_KEY, orders);
  }
  return orders;
};

const allProducts = () => {
  let products = read(PRODUCTS_KEY);
  if (!products) {
    products = shopProducts.map((p) => ({ ...p }));
    write(PRODUCTS_KEY, products);
  }
  return products;
};

// ---------- orders ----------

export const listOrders = ({ status = "all", q = "" } = {}) => {
  const term = q.trim().toLowerCase();
  const orders = allOrders().filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (!term ||
        o.id.toLowerCase().includes(term) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(term) ||
        o.customer.phone.includes(term) ||
        o.customer.email.toLowerCase().includes(term))
  );
  return respond(orders);
};

export const getOrder = (id) => respond(allOrders().find((o) => o.id === id) || null);

// New orders from checkout (orders.js shape); history and notes are added here.
export const saveOrder = (order) => {
  const orders = allOrders().filter((o) => o.id !== order.id);
  const saved = {
    ...order,
    history: order.history || [{ status: order.status, at: order.createdAt, note: "" }],
    notes: order.notes || [],
  };
  write(ORDERS_KEY, [saved, ...orders]);
  return respond(saved);
};

export const updateOrderStatus = (id, status, note = "") => {
  if (!ORDER_STATUSES.includes(status)) return Promise.reject(new Error(`Unknown status: ${status}`));
  let updated = null;
  const orders = allOrders().map((o) => {
    if (o.id !== id) return o;
    updated = {
      ...o,
      status,
      payment: status === "paid" ? { ...o.payment, status: "paid" } : o.payment,
      history: [...(o.history || []), { status, at: new Date().toISOString(), note }],
    };
    return updated;
  });
  write(ORDERS_KEY, orders);
  return respond(updated);
};

export const addOrderNote = (id, text) => {
  let updated = null;
  const orders = allOrders().map((o) => {
    if (o.id !== id) return o;
    updated = { ...o, notes: [...(o.notes || []), { text, at: new Date().toISOString() }] };
    return updated;
  });
  write(ORDERS_KEY, orders);
  return respond(updated);
};

// ---------- products ----------

export const listProducts = () => respond(allProducts());

export const getProduct = (id) => respond(allProducts().find((p) => String(p.id) === String(id)) || null);

export const saveProduct = (product) => {
  const products = allProducts();
  const isNew = !product.id;
  const saved = isNew ? { ...product, id: Math.max(0, ...products.map((p) => p.id)) + 1 } : product;
  write(PRODUCTS_KEY, isNew ? [...products, saved] : products.map((p) => (p.id === saved.id ? saved : p)));
  return respond(saved);
};

export const deleteProduct = (id) => {
  write(PRODUCTS_KEY, allProducts().filter((p) => p.id !== id));
  return respond(true);
};

// ---------- customers (built from orders) ----------

export const listCustomers = () => {
  const byPhone = new Map();
  allOrders().forEach((o) => {
    const key = o.customer.phone;
    const c = byPhone.get(key) || { ...o.customer, orders: 0, spent: 0, lastOrder: o.createdAt, area: o.delivery.area };
    c.orders += 1;
    if (o.status !== "cancelled") c.spent += o.totals.total;
    if (o.createdAt > c.lastOrder) c.lastOrder = o.createdAt;
    byPhone.set(key, c);
  });
  return respond([...byPhone.values()].sort((a, b) => b.spent - a.spent));
};

// Clears local data so the sample data is generated again.
export const resetSampleData = () => {
  localStorage.removeItem(ORDERS_KEY);
  localStorage.removeItem(PRODUCTS_KEY);
  return respond(true);
};
