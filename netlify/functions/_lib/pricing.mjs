// Builds an order from what the browser sends, using the server's own prices and
// delivery fees. The browser only says which products, colours and quantities;
// it never decides what anything costs.
import { randomBytes } from "node:crypto";
import products, { colorNames } from "../../../src/pages/Products.js";
import { deliveryFee, townLabel } from "../../../src/shipping.js";

const MAX_QTY = 20;

const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);

export const newOrderId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I to misread
  const bytes = randomBytes(8);
  return "NL-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

export class OrderError extends Error {}

export const priceOrder = ({ items, contact, town, gift, method }) => {
  if (!Array.isArray(items) || items.length === 0) throw new OrderError("Your cart is empty.");

  const lines = items.map((it) => {
    const product = products.find((p) => String(p.id) === String(it.productId));
    if (!product) throw new OrderError("Something in your cart is no longer available.");
    if (product.stock === 0) throw new OrderError(`${product.name} is sold out.`);
    const quantity = Math.floor(Number(it.quantity));
    if (!(quantity >= 1 && quantity <= MAX_QTY)) throw new OrderError("Please check the quantities in your cart.");
    const colour = it.colour && product.colors?.includes(it.colour) ? colorNames[it.colour] || it.colour : null;
    return {
      productId: product.id,
      name: product.name,
      colour,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
    };
  });

  const fee = deliveryFee(town);
  if (fee === null) throw new OrderError("Please choose a delivery area.");

  const customer = {
    firstName: clean(contact?.firstName, 80),
    lastName: clean(contact?.lastName, 80),
    email: clean(contact?.email, 160).toLowerCase(),
    phone: clean(contact?.phone, 30),
  };
  if (!customer.firstName || !customer.lastName) throw new OrderError("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new OrderError("Please enter a valid email address.");
  if (customer.phone.replace(/\D/g, "").length < 9) throw new OrderError("Please enter a valid phone number.");
  const address = clean(contact?.address, 300);
  if (!address) throw new OrderError("Please enter your delivery address.");

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const now = new Date().toISOString();

  return {
    id: newOrderId(),
    createdAt: now,
    status: "pending_payment",
    customer,
    delivery: { area: townLabel(town), fee, address, notes: clean(contact?.notes, 300) },
    gift: { isGift: !!gift?.isGift, message: gift?.isGift ? clean(gift.message, 240) : "" },
    items: lines,
    totals: { subtotal, delivery: fee, discount: 0, total: subtotal + fee },
    payment: { method: method === "card" ? "card" : "mpesa", status: "unpaid", reference: null },
    history: [{ status: "pending_payment", at: now, note: "" }],
    notes: [],
  };
};
