import { db, fromRow } from "./db.mjs";
import { notifyPaid } from "./notify.mjs";

// Marks an order paid exactly once, even if Paystack's webhook and the customer's
// return to the site arrive together: only the update that still finds the order
// awaiting payment wins, and only that one sends the messages.
export const markPaid = async (order, charge) => {
  const at = new Date().toISOString();
  const { data, error } = await db()
    .from("orders")
    .update({
      status: "paid",
      payment: {
        ...order.payment,
        status: "paid",
        reference: charge.reference,
        channel: charge.channel || null,
        method: charge.channel === "mobile_money" ? "mpesa" : charge.channel === "card" ? "card" : order.payment.method,
      },
      history: [...(order.history || []), { status: "paid", at, note: `Paid via Paystack (${charge.channel || "unknown"})` }],
    })
    .eq("id", order.id)
    .eq("status", "pending_payment")
    .select();
  if (error) throw error;
  if (data.length === 0) return null; // already handled
  const paid = fromRow(data[0]);
  await notifyPaid(paid);
  return paid;
};

// What the confirmation page may show: no phone number or street address.
export const publicOrder = (o) => ({
  id: o.id,
  createdAt: o.createdAt,
  status: o.status,
  customer: { firstName: o.customer.firstName, email: o.customer.email },
  delivery: { area: o.delivery.area, fee: o.delivery.fee },
  gift: { isGift: o.gift?.isGift },
  items: o.items,
  totals: o.totals,
  payment: { method: o.payment.method, status: o.payment.status },
});
