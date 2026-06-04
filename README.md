# Nula Leer — refreshed frontend

Drop the contents of this `src/` into your Create React App project (replacing the
matching files). Structure:

```
src/
├── App.js                  routes via <Layout>, broken /products route removed, 404 added
├── App.css                 ONE consolidated stylesheet (new design system, all pages)
├── index.css               minimal base reset
├── components/
│   ├── Layout.js           Navbar + page + Contact + Footer (kills the copy-paste)
│   ├── Navbar.js           shared nav, scroll-solid, mobile menu, cart count
│   ├── Footer.js           shared footer
│   ├── ContactSection.js   shared contact band (toast on submit)
│   └── Reveal.js           scroll-reveal wrapper (IntersectionObserver)
└── pages/
    ├── Home.js
    ├── Shop.js             working category + price filters, fixed sort
    ├── About.js
    ├── ProductDetails.js   crash-on-bad-id fixed, quantity respected, ratings kept
    ├── Cart.js             cartId-based qty/remove (colour variants no longer merge)
    ├── Checkout.js         env-based API URL, toasts
    ├── CartContext.js      addToCart respects quantity + colour
    └── Products.js         data (now has `category` for the shop filter)
```

## Install dependencies
```bash
npm install react-router-dom react-toastify react-icons
```
(`slick-carousel` / `react-slick` are no longer used — the carousel was replaced by the
editorial hero. You can uninstall them if nothing else needs them.)

## Font
Loaded automatically via @import at the top of App.css (Fraunces). No extra setup.

## Images
The pages reference your existing files in `public/`:
`wallet1.jpeg`, `belt1.jpeg`, `purse1.jpeg`, `logo-transparent.png`, `Kosencha.jpg`.
Keep those where they are.

## Backend (later)
Checkout reads `process.env.REACT_APP_API_URL` (falls back to http://localhost:5000).
When you build the backend, add `REACT_APP_API_URL=...` to a `.env` file.

## Key bug fixes included
1. Product-page quantity now actually adds that many (was hardcoded to 1).
2. ProductDetails no longer crashes on an unknown product id.
3. Same product in two colours = two cart lines (was merging into one).
4. Removed the dead `/products/:id` route that pointed at a data file.
5. `class=` → `className=` throughout; alerts/popups → toast notifications.
```
