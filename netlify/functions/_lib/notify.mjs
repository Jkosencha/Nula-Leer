// Order emails (Resend) and SMS (Africa's Talking). Each channel switches itself on
// when its keys are set and is skipped otherwise. A failed message is logged but
// never stops an order from being saved or marked paid.

const site = () => process.env.URL || process.env.SITE_URL || "";
const ksh = (n) => `KSh ${Math.round(n).toLocaleString("en-KE")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---------- email ----------

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM; // e.g. "Nula Leer <orders@nulaleer.com>"
  if (!key || !from || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text, reply_to: replyTo || process.env.OWNER_EMAIL }),
    });
    if (!res.ok) console.error("email failed", to, res.status, await res.text());
  } catch (e) {
    console.error("email failed", to, e.message);
  }
};

const layout = (title, body) => `<!doctype html><html><body style="margin:0;background:#f1f0ec;font-family:Arial,Helvetica,sans-serif;color:#24170f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fafaf8">
<tr><td style="background:#2e1d12;padding:22px 28px;color:#f6ecdc;font-family:Georgia,serif;font-size:20px;letter-spacing:4px">NULA LEER</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:normal;font-size:24px">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #dcd9d2;font-size:12px;color:#735f4c">Handmade leather goods from Nairobi, Kenya</td></tr>
</table></td></tr></table></body></html>`;

const itemsTable = (order) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;font-size:14px">
${order.items
  .map(
    (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e3dd">${esc(i.name)}${i.colour ? ` · ${esc(i.colour)}` : ""} × ${i.quantity}</td>
<td align="right" style="padding:8px 0;border-bottom:1px solid #e5e3dd">${ksh(i.lineTotal)}</td></tr>`
  )
  .join("")}
<tr><td style="padding:8px 0;color:#735f4c">Delivery · ${esc(order.delivery.area)}</td><td align="right" style="padding:8px 0;color:#735f4c">${ksh(order.totals.delivery)}</td></tr>
<tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #24170f">Total paid</td><td align="right" style="padding:10px 0;font-weight:bold;border-top:1px solid #24170f">${ksh(order.totals.total)}</td></tr>
</table>`;

// ---------- SMS ----------

// Kenyan numbers to +2547XXXXXXXX; anything else is skipped
const kenyanMobile = (phone) => {
  const d = String(phone || "").replace(/\D/g, "");
  const local = d.startsWith("254") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return /^[17]\d{8}$/.test(local) ? `+254${local}` : null;
};

const sendSms = async (phone, message) => {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  const to = kenyanMobile(phone);
  if (!username || !apiKey || !to) return;
  const host = username === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
  const form = new URLSearchParams({ username, to, message });
  if (process.env.AT_SENDER_ID) form.set("from", process.env.AT_SENDER_ID);
  try {
    const res = await fetch(`https://${host}/version1/messaging`, {
      method: "POST",
      headers: { apiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) console.error("sms failed", to, res.status, await res.text());
  } catch (e) {
    console.error("sms failed", to, e.message);
  }
};

// ---------- the messages ----------

export const notifyPaid = async (order) => {
  const c = order.customer;
  await Promise.all([
    sendEmail({
      to: c.email,
      subject: `Thank you for your order (${order.id})`,
      text: `Hi ${c.firstName}, thank you for your order ${order.id}. We've received your payment of ${ksh(order.totals.total)} and will be in touch about delivery to ${order.delivery.area}.`,
      html: layout(
        `Thank you, ${c.firstName}.`,
        `<p style="margin:0;line-height:1.6">We've received your payment for order <b>${esc(order.id)}</b>. Each piece is checked and packed by hand, and we'll be in touch about delivery to ${esc(order.delivery.area)}.</p>
${itemsTable(order)}
<p style="margin:0;font-size:14px;color:#54402f">Questions? Just reply to this email.</p>`
      ),
    }),
    sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: `New order ${order.id} · ${ksh(order.totals.total)}`,
      text: `${c.firstName} ${c.lastName} paid ${ksh(order.totals.total)} for ${order.id}. ${site()}/admin/orders/${order.id}`,
      html: layout(
        `New order ${order.id}`,
        `<p style="margin:0;line-height:1.6"><b>${esc(c.firstName)} ${esc(c.lastName)}</b> · ${esc(c.phone)} · ${esc(c.email)}<br>
Delivery to ${esc(order.delivery.area)}: ${esc(order.delivery.address)}${order.gift?.isGift ? "<br><b>Gift</b>" + (order.gift.message ? `: “${esc(order.gift.message)}”` : "") : ""}</p>
${itemsTable(order)}
<p><a href="${site()}/admin/orders/${esc(order.id)}" style="color:#9c5f27">Open in the dashboard</a></p>`
      ),
    }),
    sendSms(c.phone, `Nula Leer: thank you ${c.firstName}! Payment for order ${order.id} (${ksh(order.totals.total)}) received. We'll be in touch about delivery.`),
  ]);
};

export const notifyShipped = async (order) => {
  const c = order.customer;
  await Promise.all([
    sendEmail({
      to: c.email,
      subject: `Your order is on its way (${order.id})`,
      text: `Hi ${c.firstName}, your order ${order.id} is on its way to ${order.delivery.area}.`,
      html: layout(
        "Your order is on its way",
        `<p style="margin:0;line-height:1.6">Hi ${esc(c.firstName)}, order <b>${esc(order.id)}</b> has left our workshop and is on its way to ${esc(order.delivery.area)}. We'll call you on ${esc(c.phone)} if the rider needs directions.</p>
${itemsTable(order)}`
      ),
    }),
    sendSms(c.phone, `Nula Leer: your order ${order.id} is on its way to ${order.delivery.area}.`),
  ]);
};
