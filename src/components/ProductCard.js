import React from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../pages/WishlistContext";
import { colorNames } from "../pages/Products";
import { SHOP_OPEN } from "../config";
import ProductImage from "./ProductImage";
import { availability } from "../availability";

const ProductCard = ({ product }) => {
  const { isWished, toggleWish } = useWishlist();
  const hoverImage = product.images?.find((img) => img !== product.image);
  const wished = isWished(product.id);

  return (
    <article className="card">
      <div className="card-media">
        {availability(product)?.soldOut ? (
          <span className="card-badge out">Sold out</span>
        ) : (
          product.badge && <span className="card-badge">{product.badge}</span>
        )}
        <Link to={`/productDetails/${product.id}`}>
          <ProductImage src={product.image} product={product} alt={product.name} />
          {hoverImage && <img className="alt" src={hoverImage} alt="" aria-hidden="true" />}
        </Link>
        {SHOP_OPEN && (
          <>
            <button
              className={`wish ${wished ? "on" : ""}`}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggleWish(product.id)}
            >
              <FiHeart />
            </button>
            <Link to={`/productDetails/${product.id}`} className="quick-add">
              View
            </Link>
          </>
        )}
      </div>
      <Link to={`/productDetails/${product.id}`} className="card-body">
        <h3>{product.name}</h3>
        <span className="price">KSh {product.price.toLocaleString()}</span>
      </Link>
      {product.colors?.length > 1 && (
        <div className="swatches">
          {product.colors.map((c) => (
            <span key={c} style={{ background: c }} title={colorNames[c] || c} />
          ))}
        </div>
      )}
    </article>
  );
};

export default ProductCard;
