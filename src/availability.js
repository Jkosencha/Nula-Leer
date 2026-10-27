// Availability from optional product fields:
//   stock: number left (0 = sold out)      madeToOrder: days to make it
// Returns null when neither is set.
export const availability = (product) => {
  if (product.stock === 0) return { soldOut: true, label: "Sold out" };
  if (product.madeToOrder) return { label: `Made to order, ready in about ${product.madeToOrder} days` };
  if (product.stock > 0 && product.stock <= 3) return { label: `Only ${product.stock} left`, low: true };
  if (product.stock > 3) return { label: "In stock" };
  return null;
};
