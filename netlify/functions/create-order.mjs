// POST /api/create-order
// Body: { items: [{ productId, colour, quantity }], contact, town, gift, method }
// Prices the order on the server, saves it as awaiting payment and returns the
// Paystack page to send the customer to.
import { saveOrder, json } from "./_lib/db.mjs";
import { priceOrder, OrderError } from "./_lib/pricing.mjs";
import { startPayment, isLiveKey } from "./_lib/paystack.mjs";
import { DEMO } from "../../src/config.js";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let order;
  try {
    order = priceOrder(await req.json());
  } catch (e) {
    if (e instanceof OrderError) return json({ error: e.message }, 400);
    return json({ error: "We couldn't read your order. Please try again." }, 400);
  }

  // never take real money for the sample products
  if (DEMO && isLiveKey()) return json({ error: "The shop isn't taking orders yet." }, 503);

  try {
    await saveOrder(order);
    const site = process.env.URL || new URL(req.url).origin;
    const payment = await startPayment(order, `${site}/order/confirmation?ref=${order.id}`);
    return json({ orderId: order.id, paymentUrl: payment.authorization_url });
  } catch (e) {
    console.error("create-order failed", e.message);
    return json({ error: "We couldn't start the payment. Please try again in a moment." }, 502);
  }
};
