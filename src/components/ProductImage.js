import React from "react";
import CategoryArt from "./CategoryArt";
import { categories } from "../pages/Products";

const isLight = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 170;
};

// A product photo, or a leather illustration when there's no photo yet.
// `tone` overrides the colour (e.g. the selected colour on the product page).
const ProductImage = ({ src, product, tone, alt = "", className = "", eager = false }) => {
  if (src) return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} decoding="async" />;
  const color = tone || categories.find((c) => c.slug === product.category)?.tone || "#4a2c1c";
  return (
    <div
      className={`img-ph ${isLight(color) ? "light" : ""} ${className}`.trim()}
      style={{ "--tone": color }}
      role="img"
      aria-label={alt}
    >
      <CategoryArt slug={product.category} />
    </div>
  );
};

export default ProductImage;
