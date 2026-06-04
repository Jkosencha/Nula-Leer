import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";
import products from "./Products";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const product = products.find((item) => item.id === parseInt(id, 10));

  // FIX: use optional chaining so these hooks never crash on an unknown id.
  const [mainImage, setMainImage] = useState(product?.images?.[0] || "");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // ratings (kept from your original, stored per-product in localStorage)
  const userId = "user123"; // TODO: replace with real auth user id later
  const [allRatings, setAllRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`ratings-${id}`);
    const ratings = saved ? JSON.parse(saved) : [];
    setAllRatings(ratings);
    const mine = ratings.find((r) => r.userId === userId);
    setUserRating(mine ? mine.rating : 0);
  }, [id]);

  if (!product) {
    return (
      <div className="wrap page-head" style={{ padding: "120px 0" }}>
        <h1>Product not found</h1>
        <Link to="/shop" className="btn fill" style={{ marginTop: 20 }}>Back to shop</Link>
      </div>
    );
  }

  const handleStarClick = (star) => {
    const updated = [...allRatings];
    const idx = updated.findIndex((r) => r.userId === userId);
    if (idx !== -1) updated[idx].rating = star;
    else updated.push({ userId, rating: star });
    setAllRatings(updated);
    setUserRating(star);
    localStorage.setItem(`ratings-${id}`, JSON.stringify(updated));
  };

  const handleDeleteRating = () => {
    const updated = allRatings.filter((r) => r.userId !== userId);
    setAllRatings(updated);
    setUserRating(0);
    localStorage.setItem(`ratings-${id}`, JSON.stringify(updated));
  };

  const averageRating =
    allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
      : null;

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast.error("Please choose a colour first.");
      return;
    }
    addToCart({ ...product, selectedColor, quantity });
    toast.success(
      <span>
        Added to cart —{" "}
        <button
          onClick={() => navigate("/cart")}
          style={{ background: "none", border: "none", color: "#fff", textDecoration: "underline", cursor: "pointer", padding: 0 }}
        >
          view cart
        </button>
      </span>
    );
  };

  return (
    <>
      <div className="wrap pdp">
        <div className="gallery">
          <img className="main" src={mainImage} alt={product.name} />
          <div className="thumbs">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} ${i + 1}`}
                className={mainImage === img ? "active" : ""}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="info">
          <div className="cat">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="price">KSh {product.price.toLocaleString()}</div>
          <p className="desc">{product.description}</p>

          <span className="label">Select colour</span>
          <div className="color-row">
            {product.colors?.map((color, i) => (
              <button
                key={i}
                className={`color-dot ${selectedColor === color ? "sel" : ""}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Colour ${color}`}
              />
            ))}
          </div>

          <span className="label">Quantity</span>
          <div className="qty">
            <div className="ctrl">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span className="num">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
          </div>

          <button
            className="btn fill add-cart"
            onClick={handleAddToCart}
            disabled={!selectedColor}
          >
            Add to cart
          </button>
        </div>
      </div>

      <div className="wrap ratings">
        <div className="box">
          <h3>Rate this product</h3>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${userRating >= star ? "on" : ""}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
            {userRating > 0 && (
              <button className="remove-rating" onClick={handleDeleteRating}>
                ✖ Remove
              </button>
            )}
          </div>
          {averageRating && (
            <p className="avg">
              Average rating: <strong>{averageRating}</strong> ({allRatings.length} rating
              {allRatings.length > 1 ? "s" : ""})
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
