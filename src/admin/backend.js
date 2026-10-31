// The dashboard's connection to the real backend (Supabase for sign-in and reading
// orders, /api/admin-order for changes). Only used when REACT_APP_SUPABASE_URL is set;
// otherwise the dashboard runs on sample data in this browser (see api.js).
import { createClient } from "@supabase/supabase-js";

// only the origin: a URL pasted with /rest/v1/ or a trailing slash breaks sign-in
const projectUrl = (raw) => {
  try {
    return new URL(String(raw).trim()).origin;
  } catch (e) {
    return "";
  }
};

const url = process.env.REACT_APP_SUPABASE_URL && projectUrl(process.env.REACT_APP_SUPABASE_URL);
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

export const BACKEND = !!(url && anonKey);

export const supabase = BACKEND ? createClient(url, anonKey) : null;

const fromRow = ({ created_at, ...rest }) => ({ ...rest, createdAt: created_at });

export const fetchOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
};

export const fetchOrder = async (id) => {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
};

// changes go through the server so it can check the admin and message the customer
export const changeOrder = async (body) => {
  const { data } = await supabase.auth.getSession();
  const res = await fetch("/api/admin-order", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: JSON.stringify(body),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error || "Couldn't save the change");
  return result;
};
