// Visitor analytics with Umami: no cookies and no personal data, so no consent
// banner is needed. Off until REACT_APP_UMAMI_WEBSITE_ID is set (see BACKEND.md).
const WEBSITE_ID = process.env.REACT_APP_UMAMI_WEBSITE_ID;

export const startAnalytics = () => {
  if (!WEBSITE_ID || window.location.pathname.startsWith("/admin")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://cloud.umami.is/script.js";
  s.dataset.websiteId = WEBSITE_ID;
  document.head.appendChild(s);
};

// Shop events shown in Umami next to page views, e.g. track("Add to cart", { product: "Classic Belt" })
export const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch (e) {
    // analytics must never break the shop
  }
};
