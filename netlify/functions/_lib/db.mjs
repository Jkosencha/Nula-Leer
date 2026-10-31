// Server-side database access. Uses the service role key, which bypasses the
// row-level security in supabase/schema.sql, so it must never reach the browser.
import { createClient } from "@supabase/supabase-js";

let client;

export const db = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
};

// Database rows use created_at; the site and dashboard use createdAt.
export const fromRow = ({ created_at, ...rest }) => ({ ...rest, createdAt: created_at });
export const toRow = ({ createdAt, ...rest }) => ({ ...rest, created_at: createdAt });

export const getOrder = async (id) => {
  const { data, error } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
};

export const saveOrder = async (order) => {
  const { error } = await db().from("orders").upsert(toRow(order));
  if (error) throw error;
  return order;
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
