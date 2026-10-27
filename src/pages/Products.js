import { DEMO } from "../config";
import sampleProducts, { demoCategoryImages, demoCollectionImages } from "./sampleProducts";

// while DEMO is on, borrow the demo photos for anything without its own image
const withDemoImages = (list, images) =>
  DEMO ? list.map((item) => ({ image: images[item.slug], ...item })) : list;

// Categories show on the site even before they have products.
// `tone` is the leather colour used for the tile until it has a photo.
// Add `image: "/categories/belts.jpg"` (file in public/categories/) to give one a cover photo.
export const categories = withDemoImages([
  { slug: "belts", name: "Belts", tone: "#9a5a2b", description: "Belts for every day and for dressing up." },
  { slug: "wallets", name: "Wallets", tone: "#4a2c1c", description: "Wallets and card holders that soften with age." },
  { slug: "purses", name: "Purses", tone: "#6d2b24", description: "Purses with room for the essentials." },
  { slug: "laptop-sleeves", name: "Laptop sleeves", tone: "#2b2420", description: "Leather sleeves for work and travel." },
  { slug: "wash-bags", name: "Wash bags", tone: "#5a5434", description: "Toiletry bags for weekends away." },
  { slug: "key-holders", name: "Key holders", tone: "#7c4a2a", description: "Small leather pieces that keep keys in order." },
], demoCategoryImages);

export const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

// Collections group pieces across categories (a product can be in several).
// `art` picks the line drawing shown until the collection has a photo (`image`).
export const collections = withDemoImages([
  {
    slug: "safari",
    name: "Safari",
    tone: "#6b6236",
    art: "safari",
    tagline: "Made for the road, the bush and long weekends upcountry.",
    description:
      "Hard-wearing pieces for game drives, road trips and travel: wash bags, belts and sleeves that can take the dust.",
  },
  {
    slug: "gifts",
    name: "The Gift Edit",
    tone: "#6d2b24",
    art: "gifts",
    tagline: "Leather they'll keep, and remember you by.",
    description:
      "Pieces picked for giving: birthdays, graduations, weddings and thank-yous. Small enough to wrap, good enough to keep.",
  },
  {
    slug: "workday",
    name: "Workday",
    tone: "#2b2420",
    art: "laptop-sleeves",
    tagline: "From the morning commute to the boardroom.",
    description: "Laptop sleeves, card holders and belts for the working week in Nairobi and beyond.",
  },
  {
    slug: "weekender",
    name: "Weekender",
    tone: "#9a5a2b",
    art: "wash-bags",
    tagline: "Everything for two nights away.",
    description: "Wash bags, key holders and small leather goods for short trips and weekends away.",
  },
], demoCollectionImages);

// Products. To add one, put its photos in public/products/ and copy this shape.
// `details`, `collections`, `images`, `badge` and `featured` are optional.
//
// {
//   id: 1,                                  // unique number
//   name: "Classic Belt",
//   category: "belts",                      // a slug from the list above
//   price: 1200,                            // KSh
//   image: "/products/classic-belt-1.jpg",  // main photo (cards)
//   images: ["/products/classic-belt-1.jpg", "/products/classic-belt-2.jpg"],
//   description: "Short description shown on the product page.",
//   details: ["Full-grain leather", "Solid brass buckle"],  // bullet points
//   colors: ["#1c1c1c", "#6b4226"],         // hex codes; names come from colorNames below
//   collections: ["safari", "gifts"],       // slugs from the collections list
//   badge: "New",                           // optional corner label, e.g. "New" or "Best seller"
//   featured: true,                         // optional: shown in the big feature rows on the shop page
//   material: "Full-grain cowhide",         // optional, shown under "Material & size"
//   dimensions: "35 × 25 cm",               // optional, shown under "Material & size"
//   stock: 4,                               // optional: 0 = sold out, 1-3 = "Only N left"
//   madeToOrder: 7,                         // optional: days to make it (instead of stock)
// },
const realProducts = [];

const products = DEMO && realProducts.length === 0 ? sampleProducts : realProducts;

export default products;

export const collectionCount = (slug) => products.filter((p) => p.collections?.includes(slug)).length;

export const colorNames = {
  "#1c1c1c": "Black",
  "#6b4226": "Chocolate",
  "#b07d4f": "Tan",
  "#efe9e0": "Cream",
};
