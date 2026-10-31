# Nula Leer backend: setup

How the pieces fit:

| Job | Service | Cost |
|---|---|---|
| Website + server functions (`netlify/functions`) | Netlify | Free plan |
| Orders database + dashboard sign-in | Supabase | Free plan |
| Payments: M-Pesa, cards (incl. international), Apple Pay | Paystack | Per payment: M-Pesa 1.5%, Kenyan cards 2.9%, foreign cards 3.8% |
| Order emails | Resend | Free up to 3,000 a month |
| Order SMS | Africa's Talking | Roughly KSh 0.5–0.8 per SMS, prepaid |
| Visitor numbers | Umami Cloud | Free plan |

Each one switches on by itself when its settings are added in Netlify (list in `.env.example`).
Nothing needs a code change.

## 1. Supabase (database and sign-in)

1. Sign up at supabase.com, then **New project**. Name it `nula-leer`, region **Frankfurt** (closest to Kenya), and save the database password somewhere safe.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` and press **Run**.
3. **Authentication → Users → Add user → Create new user**: your email and a strong password. Tick "Auto confirm".
4. **SQL Editor** again, run (with your email, in lowercase):
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. **Project Settings → Data API**: copy the Project URL (just `https://xxxx.supabase.co`, without `/rest/v1/`).
   **Project Settings → API Keys → Legacy API keys**: copy the `anon` and `service_role` keys for step 3.
6. **Authentication → URL Configuration**: set **Site URL** to your site (e.g. `https://nula-leer.netlify.app`)
   and add `https://nula-leer.netlify.app/admin` under **Redirect URLs**, so "Forgot password?" emails link back
   to the dashboard.

If you set things up before profile pictures existed, run `supabase/schema.sql` again: it adds the
`avatars` storage bucket and is safe to re-run.

## 2. Paystack (payments)

1. Sign up at paystack.com, country Kenya, and choose **Starter Business** (unregistered).
   You need your national ID or passport and a personal bank account or M-Pesa number
   in the same name. Starter accounts can collect up to a lifetime limit (Paystack lists
   KES 600,000; check your dashboard). After that you register the business to continue.
2. While waiting for approval, use the **Test mode** keys: everything works with test
   cards and test M-Pesa numbers, and no real money moves.
3. **Settings → Preferences**: request **international payments** so cards from abroad
   work. Prices stay in KSh; the customer's bank converts.
4. **Settings → API Keys & Webhooks**: set the webhook URL to
   `https://YOUR-SITE/api/paystack-webhook`, and copy the **Secret key**.

## 3. Netlify (hosting)

1. Sign up at netlify.com with GitHub and **Add new site → Import an existing project**,
   pick this repository and the branch to publish. Build settings come from `netlify.toml`.
2. **Site configuration → Environment variables**: add the settings from `.env.example`.
   Start with `REACT_APP_PAYMENTS=on`, the Supabase ones and `PAYSTACK_SECRET_KEY` (test key).
3. Redeploy. Place a test order with a Paystack test card, then open `/admin` and sign in.

## 4. Emails (Resend)

1. Sign up at resend.com and create an API key; set `RESEND_API_KEY`, `EMAIL_FROM` and `OWNER_EMAIL`.
2. Until a domain is verified, Resend only delivers to your own sign-up email, so you get
   new-order alerts but customers don't get receipts yet.
3. After buying the domain: **Domains → Add domain**, add the DNS records it shows, and
   set `EMAIL_FROM` to e.g. `Nula Leer <orders@nulaleer.com>`.

## 5. SMS (Africa's Talking), optional

1. Sign up at africastalking.com. Test with `AT_USERNAME=sandbox` and the sandbox API key.
2. For real messages, create a live app, top up, and set its username and API key.
   Messages come from a shared sender until a sender ID ("NULALEER") is approved,
   which needs business documents.

## 6. Visitor numbers (Umami), optional

1. Sign up at umami.is (Cloud, free Hobby plan) and add the website.
2. Set `REACT_APP_UMAMI_WEBSITE_ID`. Page views plus "Add to cart", "Start payment" and
   "Order paid" appear in Umami. The dashboard (/admin) is never counted.

## Before taking real money

- `DEMO = false` in `src/config.js`, real products added, `public/demo/` deleted.
  (The server refuses live payments while the sample products are showing.)
- Swap the Paystack test key for the live key, and update the webhook URL if the domain changed.
- Place one real small order and refund it from the Paystack dashboard.

## What's not built yet

- Products and photos are still edited in `src/pages/Products.js`. Editing them from the
  dashboard (with photo uploads) comes once there are real products.
- Stock isn't reduced automatically when something sells; update it after each sale.
- Delivery is Kenya-only. Shipping abroad needs courier rates first.
