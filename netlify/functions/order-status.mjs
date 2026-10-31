// GET /api/order-status?ref=NL-XXXXXXXX
// Used by the confirmation page after Paystack sends the customer back. If the
// webhook hasn't arrived yet, asks Paystack directly so the customer isn't left waiting.
import { getOrder, json } from "./_lib/db.mjs";
import { checkPayment, matchesOrder } from "./_lib/paystack.mjs";
import { markPaid, publicOrder } from "./_lib/orders.mjs";

export default async (req) => {
  const ref = new URL(req.url).searchParams.get("ref") || "";
  if (!/^NL-[A-Z0-9]{6,12}$/.test(ref)) return json({ error: "Order not found" }, 404);

  let order = await getOrder(ref);
  if (!order) return json({ error: "Order not found" }, 404);

  if (order.status === "pending_payment") {
    try {
      const charge = await checkPayment(ref);
      if (matchesOrder(charge, order)) order = (await markPaid(order, charge)) || (await getOrder(ref));
    } catch (e) {
      // not paid yet, or Paystack unreachable: report the order as it stands
    }
  }
  return json(publicOrder(order));
};
