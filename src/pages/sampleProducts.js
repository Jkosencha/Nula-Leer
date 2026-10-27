// TEMPORARY demo content for designing the site: sample products plus Unsplash
// photos in public/demo/ (see CREDITS.md there). Only used while DEMO is on in
// src/config.js. Before launch: set DEMO = false and delete public/demo/.
const d = (file) => `/demo/${file}`;

export const demoHeroImage = d("hero.jpg");
export const demoContactImage = d("wallet-2.jpg");

export const demoCategoryImages = {
  belts: d("belt-1.jpg"),
  wallets: d("wallet-1.jpg"),
  purses: d("purse-1.jpg"),
  "laptop-sleeves": d("sleeve-1.jpg"),
  "wash-bags": d("washbag.jpg"),
  "key-holders": d("cardholder.jpg"),
};

export const demoCollectionImages = {
  safari: d("organiser.jpg"),
  gifts: d("wallet-1.jpg"),
  workday: d("sleeve-2.jpg"),
  weekender: d("washbag.jpg"),
};

const sampleProducts = [
  {
    id: 101, material: "Sample: vegetable-tanned leather", dimensions: "Sample: 3.5 cm wide, sizes 30–42", stock: 2, featured: true, badge: "Best seller", name: "Classic Belt", category: "belts", price: 2200,
    image: d("belt-1.jpg"), images: [d("belt-1.jpg"), d("belt-2.jpg")],
    description: "An everyday belt with a simple buckle, made to wear in.",
    details: ["Sample product for preview", "Sizes on request"],
    colors: ["#1c1c1c", "#6b4226", "#b07d4f"], collections: ["safari", "gifts"],
  },
  {
    id: 102, featured: true, name: "Bifold Wallet", category: "wallets", price: 1800,
    image: d("wallet-1.jpg"), images: [d("wallet-1.jpg"), d("wallet-2.jpg")],
    description: "A slim bifold with card slots and a note pocket.",
    details: ["Sample product for preview", "Six card slots"],
    colors: ["#6b4226", "#1c1c1c"], collections: ["gifts", "workday"],
  },
  {
    id: 103, name: "Card Holder", category: "wallets", price: 950,
    image: d("cardholder.jpg"), images: [d("cardholder.jpg"), d("wallet-2.jpg")],
    description: "Four slots and a centre pocket, small enough for any pocket.",
    details: ["Sample product for preview"],
    colors: ["#b07d4f", "#1c1c1c"], collections: ["gifts", "workday"],
  },
  {
    id: 104, material: "Sample: full-grain leather", dimensions: "Sample: 35 × 38 cm", madeToOrder: 7, name: "Leather Tote", category: "purses", price: 2600,
    image: d("purse-1.jpg"), images: [d("purse-1.jpg"), d("purse-2.jpg"), d("purse-3.jpg")],
    description: "An open tote with room for the essentials.",
    details: ["Sample product for preview"],
    colors: ["#6b4226", "#efe9e0"], collections: ["gifts"],
  },
  {
    id: 105, badge: "New", name: "13\" Laptop Sleeve", category: "laptop-sleeves", price: 4500,
    image: d("sleeve-1.jpg"), images: [d("sleeve-1.jpg"), d("sleeve-2.jpg"), d("sleeve-3.jpg")],
    description: "A leather sleeve for 13-inch laptops.",
    details: ["Sample product for preview", "Fits most 13\" laptops"],
    colors: ["#1c1c1c", "#6b4226"], collections: ["workday", "safari"],
  },
  {
    id: 106, badge: "New", name: "Travel Wash Bag", category: "wash-bags", price: 3200,
    image: d("washbag.jpg"), images: [d("washbag.jpg")],
    description: "A zip-top wash bag for weekends away.",
    details: ["Sample product for preview"],
    colors: ["#6b4226", "#b07d4f"], collections: ["safari", "weekender"],
  },
  {
    id: 107, name: "Loop Key Holder", category: "key-holders", price: 650,
    image: d("cardholder.jpg"), images: [d("cardholder.jpg")],
    description: "A stitched leather loop that keeps your keys together.",
    details: ["Sample product for preview"],
    colors: ["#b07d4f", "#6b4226", "#1c1c1c"], collections: ["gifts", "weekender"],
  },
  {
    id: 108, stock: 0, name: "Travel Organiser", category: "wallets", price: 2800,
    image: d("organiser.jpg"), images: [d("organiser.jpg")],
    description: "A fold-out organiser for cards, cables and small tools.",
    details: ["Sample product for preview"],
    colors: ["#b07d4f", "#6b4226"], collections: ["safari", "weekender"],
  },
];

export default sampleProducts;
