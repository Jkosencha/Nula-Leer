import React from "react";
import { Link } from "react-router-dom";
import products from "./Products";
import { useWishlist } from "./WishlistContext";
import ProductCard from "../components/ProductCard";
import usePageTitle from "../usePageTitle";

const Wishlist = () => {
  usePageTitle("Wishlist");
  const { wishlist } = useWishlist();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="wrap shop-page">
      <div className="shop-head">
        <h1>Wishlist</h1>
        <p className="muted">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
      </div>
      {items.length === 0 ? (
        <div className="empty">
          <h2>Nothing saved yet</h2>
          <p className="muted">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn">Browse products</Link>
        </div>
      ) : (
        <div className="prod-grid four">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
