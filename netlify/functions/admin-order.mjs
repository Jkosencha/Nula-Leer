// POST /api/admin-order   (dashboard only)
// Header: Authorization: Bearer <Supabase access token of a signed-in admin>
// Body: { id, status, note } to change status, or { id, addNote } to add a private note.
import { db, getOrder, saveOrder, json } from "./_lib/db.mjs";
import { notifyShipped } from "./_lib/notify.mjs";

const STATUSES = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"];

const adminEmail = async (req) => {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!token) return null;
  const { data, error } = await db().auth.getUser(token);
  if (error || !data?.user?.email) return null;
  const { data: row } = await db().from("admins").select("email").eq("email", data.user.email.toLowerCase()).maybeSingle();
  return row ? data.user.email : null;
};

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await adminEmail(req))) return json({ error: "Not signed in" }, 401);

  const body = await req.json().catch(() => ({}));
  const order = await getOrder(String(body.id || ""));
  if (!order) return json({ error: "Order not found" }, 404);
  const at = new Date().toISOString();

  if (body.addNote) {
    const text = String(body.addNote).trim().slice(0, 1000);
    if (!text) return json({ error: "Empty note" }, 400);
    return json(await saveOrder({ ...order, notes: [...(order.notes || []), { text, at }] }));
  }

  if (!STATUSES.includes(body.status)) return json({ error: "Unknown status" }, 400);
  const updated = await saveOrder({
    ...order,
    status: body.status,
    // marking paid by hand is for payments taken outside Paystack (e.g. straight to M-Pesa)
    payment: body.status === "paid" ? { ...order.payment, status: "paid" } : order.payment,
    history: [...(order.history || []), { status: body.status, at, note: String(body.note || "").slice(0, 300) }],
  });
  if (body.status === "shipped") await notifyShipped(updated);
  return json(updated);
};
