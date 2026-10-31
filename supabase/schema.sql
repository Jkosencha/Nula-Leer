-- Nula Leer database. Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run again: it only creates what's missing.
--
-- Orders keep the same shape as src/orders.js, so the admin dashboard reads them unchanged.
-- Only the server (Netlify functions, using the service role key) creates orders or marks
-- them paid. Signed-in admins can read orders from the dashboard; changes go through
-- /api/admin-order so customers get their "on its way" messages.

create table if not exists public.orders (
  id          text primary key,                     -- e.g. NL-7K2QX9AB, shown to the customer
  created_at  timestamptz not null default now(),
  status      text not null default 'pending_payment'
              check (status in ('pending_payment','paid','processing','shipped','delivered','cancelled')),
  customer    jsonb not null,                       -- { firstName, lastName, email, phone }
  delivery    jsonb not null,                       -- { area, fee, address, notes }
  gift        jsonb not null default '{"isGift":false,"message":""}',
  items       jsonb not null,                       -- [{ productId, name, colour, quantity, unitPrice, lineTotal }]
  totals      jsonb not null,                       -- { subtotal, delivery, discount, total } in KSh
  payment     jsonb not null,                       -- { method, status, reference, channel }
  history     jsonb not null default '[]',          -- [{ status, at, note }]
  notes       jsonb not null default '[]'           -- [{ text, at }] private to the dashboard
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Who may use the dashboard. Add your email after creating your user (see BACKEND.md).
create table if not exists public.admins (
  email text primary key
);

alter table public.orders enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
  for select to authenticated using (public.is_admin());

-- No insert/update/delete policies: the browser can't change orders directly.
-- The service role key (server only) bypasses these rules.

-- ---------- Profile pictures ----------
-- Public bucket: pictures are readable by link; only admins can add or replace their own.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "admins see own avatars" on storage.objects;
create policy "admins see own avatars" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

drop policy if exists "admins add own avatar" on storage.objects;
create policy "admins add own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

drop policy if exists "admins replace own avatar" on storage.objects;
create policy "admins replace own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

drop policy if exists "admins remove own avatar" on storage.objects;
create policy "admins remove own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());
