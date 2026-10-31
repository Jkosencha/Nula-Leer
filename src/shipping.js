// Delivery fees in KSh by region and town. Shared by the shop and the server
// (netlify/functions), so the fee a customer sees is the fee they're charged.
export const SHIPPING_OPTIONS = {
  Nairobi: { Westlands: 200, ThikaRoad: 500, CBD: 150, Karen: 250, Ngong: 100, Kikuyu: 200, Kiambu: 300 },
  Mombasa: { Mombasa: 1300, Lamu: 1200, Malindi: 1500, Kilifi: 2000, Ukunda: 2000 },
  Others: { Nakuru: 350, Kisumu: 400, Eldoret: 1800, Muranga: 1000 },
};

// "ThikaRoad" -> "Thika Road"
export const townLabel = (town) => town.replace(/([a-z])([A-Z])/g, "$1 $2");

// fee for a town key, or null if we don't deliver there
export const deliveryFee = (town) => {
  for (const towns of Object.values(SHIPPING_OPTIONS)) if (town in towns) return towns[town];
  return null;
};
