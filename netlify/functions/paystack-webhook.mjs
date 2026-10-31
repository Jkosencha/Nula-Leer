// POST /api/paystack-webhook
// Paystack calls this when a payment succeeds. Set the URL in Paystack →
// Settings → API Keys & Webhooks (see BACKEND.md).
import { getOrder, json } from "./_lib/db.mjs";
import { isGenuineWebhook, matchesOrder } from "./_lib/paystack.mjs";
import { markPaid } from "./_lib/orders.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const raw = await req.text();
  if (!isGenuineWebhook(raw, req.headers.get("x-paystack-signature"))) return json({ error: "Invalid signature" }, 401);

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return json({ ok: true }); // other events aren't used yet

  const charge = event.data;
  const order = await getOrder(charge.reference);
  if (!order) {
    console.error("webhook: no order for", charge.reference);
    return json({ ok: true });
  }
  if (!matchesOrder(charge, order)) {
    console.error("webhook: amount or currency mismatch", charge.reference, charge.amount, charge.currency);
    return json({ ok: true });
  }

  await markPaid(order, charge);
  return json({ ok: true });
};
