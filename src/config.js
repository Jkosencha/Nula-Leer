// Site-wide settings. Update these in one place.

// Demo mode (`npm run demo`): fills the shop with sample products and opens the
// cart/checkout so the full shopping flow can be previewed. Never on in a normal build.
export const DEMO = process.env.REACT_APP_DEMO === "true";

// Cart, checkout and wishlist. Set to false to hide them again
// (products then show "Enquire" instead of "Add to cart").
export const SHOP_OPEN = true;

export const CONTACT = {
  email: "kosenchajennifer@gmail.com",
  phone: "+254704239554",
  phoneDisplay: "0704 239 554",
  location: "Nairobi, Kenya",
};

// Opens the visitor's email app with a pre-filled message to us.
export const mailto = (subject, body = "") =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
