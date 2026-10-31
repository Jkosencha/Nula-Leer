// Paystack: start a payment, check one, and recognise genuine webhook calls.
// Amounts go to Paystack in the smallest unit (KSh × 100).
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.paystack.co";
const secret = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY must be set");
  return key;
};

const call = async (path, options = {}) => {
  const res = await fetch(API + path, {
    ...options,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) throw new Error(`Paystack ${path}: ${body.message || res.status}`);
  return body.data;
};

export const isLiveKey = () => secret().startsWith("sk_live_");

// Returns { authorization_url, access_code, reference }
export const startPayment = (order, callbackUrl) =>
  call("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: order.customer.email,
      amount: order.totals.total * 100,
      currency: "KES",
      reference: order.id,
      callback_url: callbackUrl,
      // M-Pesa shows Paystack's mobile money option; card also offers Apple Pay where available
      channels: order.payment.method === "card" ? ["card", "apple_pay"] : ["mobile_money"],
      metadata: { order_id: order.id, customer: `${order.customer.firstName} ${order.customer.lastName}` },
    }),
  });

export const checkPayment = (reference) => call(`/transaction/verify/${encodeURIComponent(reference)}`);

// Paystack signs each webhook body with our secret key (HMAC SHA-512).
export const isGenuineWebhook = (rawBody, signature) => {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && timingSafeEqual(a, b);
};

// A successful charge only counts if it's for this order's full amount in KSh.
export const matchesOrder = (charge, order) =>
  charge?.status === "success" && charge.currency === "KES" && Number(charge.amount) === order.totals.total * 100;
