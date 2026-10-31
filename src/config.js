// Site-wide settings. Update these in one place.

// TEMPORARY demo mode for designing: sample products and Unsplash photos from
// public/demo/. Before launch set this to false and delete public/demo/.
export const DEMO = true;

// Cart, checkout and wishlist. Set to false to hide them again
// (products then show "Enquire" instead of "Add to cart").
export const SHOP_OPEN = true;

// Features that need a real backend. While false they stay visible but are
// greyed out with a short note. Switch each on once its backend is connected.
// Payments turn on with REACT_APP_PAYMENTS=on in the hosting settings (see BACKEND.md).
export const LIVE = {
  payments: process.env.REACT_APP_PAYMENTS === "on", // Paystack: M-Pesa and cards
  discounts: false, // discount codes (must be checked server-side)
  reviews: false, // star ratings shared between customers
};

export const CONTACT = {
  email: "kosenchajennifer@gmail.com",
  phone: "+254704239554",
  phoneDisplay: "0704 239 554",
  location: "Nairobi, Kenya",
  whatsapp: "254704239554", // international format, no "+"; set to "" to hide WhatsApp links
};

// Social accounts. Paste each profile URL when ready; empty ones show as plain icons.
export const SOCIAL = {
  instagram: "",
  tiktok: "",
  facebook: "",
  pinterest: "",
};

export const whatsappLink = (text = "") =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Opens the visitor's email app with a pre-filled message to us.
export const mailto = (subject, body = "") =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
