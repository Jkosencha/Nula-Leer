// The shape of an order. Checkout builds one of these; once a backend exists it
// is what gets sent to the server and what the admin dashboard lists and manages.
//
// {
//   id: "NL-LX3K9Q2A",              // shown to the customer
//   createdAt: "2026-10-27T10:15:00.000Z",
//   status: "pending_payment",      // pending_payment | paid | processing | shipped | delivered | cancelled
//   customer: { firstName, lastName, email, phone },
//   delivery: { area, fee, address, notes },
//   gift: { isGift, message },
//   items: [{ productId, name, colour, quantity, unitPrice, lineTotal }],
//   totals: { subtotal, delivery, discount, total },   // KSh
//   payment: { method: "mpesa" | "card", status: "unpaid" | "paid" | "failed", reference: null },
// }

import { colorNames } from "./pages/Products";

export const ORDER_STATUSES = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

const newOrderId = () => `NL-${Date.now().toString(36).toUpperCase()}`;

export const createOrder = ({ cartItems, contact, deliveryArea, deliveryFee, gift, paymentMethod, discount = 0 }) => {
  const items = cartItems.map((i) => ({
    productId: i.id,
    name: i.name,
    colour: i.selectedColor ? colorNames[i.selectedColor] || i.selectedColor : null,
    quantity: i.quantity,
    unitPrice: i.price,
    lineTotal: i.price * i.quantity,
  }));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  return {
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    status: "pending_payment",
    customer: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    },
    delivery: { area: deliveryArea, fee: deliveryFee, address: contact.address, notes: contact.notes },
    gift: { isGift: !!gift?.isGift, message: gift?.isGift ? gift.message : "" },
    items,
    totals: { subtotal, delivery: deliveryFee, discount, total: subtotal + deliveryFee - discount },
    payment: { method: paymentMethod, status: "unpaid", reference: null },
  };
};

// Until there is a backend, the most recent order is kept in this browser so the
// confirmation page has something to show (demo preview only).
const LAST_ORDER_KEY = "lastOrder";

export const saveLastOrder = (order) => {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    // storage full or blocked: the confirmation page will show its empty state
  }
};

export const getLastOrder = () => {
  try {
    return JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
  } catch (e) {
    return null;
  }
};
