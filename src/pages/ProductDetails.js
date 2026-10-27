import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMinus, FiPlus, FiStar, FiMail, FiPhone } from "react-icons/fi";
import { useCart, SHIPPING_OPTIONS } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import products, { colorNames, categoryName } from "./Products";
import { SHOP_OPEN, LIVE, CONTACT, mailto } from "../config";
import { availability } from "../availability";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import usePageTitle from "../usePageTitle";

const nairobiFrom = Math.min(...Object.values(SHIPPING_OPTIONS.Nairobi));

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const { isWished, toggleWish } = useWishlist();

  const product = products.find((item) => item.id === parseInt(id, 10));
  usePageTitle(product?.name, product?.description);

  const [mainImage, setMainImage] = useState(product?.images?.[0] || product?.image || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  // ratings, stored per-product in localStorage
  const userId = "user123"; // TODO: replace with real auth user id later
  const [allRatings, setAllRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);

  // reset selections when navigating between products (e.g. via related items)
  useEffect(() => {
    setMainImage(product?.images?.[0] || product?.image || "");
    setSelectedColor(product?.colors?.[0] || "");
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [product]);

  useEffect(() => {
    const saved = localStorage.getItem(`ratings-${id}`);
    const ratings = saved ? JSON.parse(saved) : [];
    setAllRatings(ratings);
    const mine = ratings.find((r) => r.userId === userId);
    setUserRating(mine ? mine.rating : 0);
  }, [id]);

  if (!product) {
    return (
      <div className="wrap empty" style={{ padding: "120px 0" }}>
        <h1>Product not found</h1>
        <Link to="/shop" className="btn">Back to shop</Link>
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

  const related = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => (b.category === product.category) - (a.category === product.category))
    .slice(0, 4);

  const wished = isWished(product.id);
  const images = product.images || [];
  const colorLabel = colorNames[selectedColor] || selectedColor;

  const buyNow = () => {
    addToCart({ ...product, selectedColor, quantity });
    setDrawerOpen(false);
    navigate("/cart");
  };

  return (
    <>
      <nav className="crumbs center" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`}>{categoryName(product.category)}</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="wrap pdp">
        <div className="gallery">
          <ProductImage src={mainImage} product={product} tone={selectedColor} alt={product.name} className="main" />
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={mainImage === img ? "active" : ""}
                  onClick={() => setMainImage(img)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info">
          <div className="title-row">
            <h1>{product.name}</h1>
            <span className="price">KSh {product.price.toLocaleString()}</span>
          </div>
          {availability(product) && (
            <p className={`avail ${availability(product).low ? "low" : ""} ${availability(product).soldOut ? "out" : ""}`}>
              {availability(product).label}
            </p>
          )}
          {LIVE.reviews && averageRating && (
            <span className="rating-sum">
              <FiStar /> {averageRating} ({allRatings.length})
            </span>
          )}

          {product.colors?.length > 0 && (
            <div className="opt">
              <span className="label">
                Colour: <b>{colorLabel}</b>
              </span>
              <div className="color-row">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`color-dot ${selectedColor === color ? "sel" : ""}`}
                    style={{ "--c": color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={colorNames[color] || color}
                    title={colorNames[color] || color}
                  />
                ))}
              </div>
            </div>
          )}

          {SHOP_OPEN ? (
            <>
              <div className="opt">
                <span className="label">Quantity</span>
                <div className="stepper">
                  <button aria-label="Decrease" onClick={() => setQuantity((q) => Math.max(1, q - 1))}><FiMinus /></button>
                  <span>{quantity}</span>
                  <button aria-label="Increase" onClick={() => setQuantity((q) => q + 1)}><FiPlus /></button>
                </div>
              </div>
              <div className="buy-row">
                <button
                  className="btn square tan"
                  disabled={availability(product)?.soldOut}
                  onClick={() => addToCart({ ...product, selectedColor, quantity })}
                >
                  {availability(product)?.soldOut ? "Sold out" : "Add to cart"}
                </button>
                <button className="btn square outline" disabled={availability(product)?.soldOut} onClick={buyNow}>
                  Buy now
                </button>
                <button
                  className={`icon-btn boxed ${wished ? "on" : ""}`}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={() => toggleWish(product.id)}
                >
                  <FiHeart />
                </button>
              </div>
            </>
          ) : (
            <div className="buy-row">
              <a
                className="btn square tan"
                href={mailto(
                  `Enquiry: ${product.name}`,
                  `Hi Nula Leer,\n\nI'm interested in the ${product.name}${selectedColor ? ` (${colorLabel})` : ""}.\n\n`
                )}
              >
                <FiMail /> Enquire by email
              </a>
              <a className="btn square outline" href={`tel:${CONTACT.phone}`}><FiPhone /> Call us</a>
            </div>
          )}

          <div className="accordion">
            <details open>
              <summary>Description</summary>
              <div>
                <p>{product.description}</p>
                {product.details?.length > 0 && (
                  <ul className="bullets">
                    {product.details.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                )}
              </div>
            </details>
            {(product.material || product.dimensions) && (
              <details>
                <summary>Material & size</summary>
                <dl className="specs">
                  {product.material && (
                    <>
                      <dt>Material</dt>
                      <dd>{product.material}</dd>
                    </>
                  )}
                  {product.dimensions && (
                    <>
                      <dt>Size</dt>
                      <dd>{product.dimensions}</dd>
                    </>
                  )}
                </dl>
              </details>
            )}
            <details>
              <summary>Care</summary>
              <p>
                Wipe clean with a soft, dry cloth. Keep away from prolonged sun and moisture,
                and condition the leather every few months to keep it supple.
              </p>
            </details>
            <details>
              <summary>Shipping</summary>
              <p>
                {SHOP_OPEN
                  ? `Delivery fees depend on your area and are shown at checkout. Nairobi deliveries start from KSh ${nairobiFrom}; we also deliver to Mombasa, Nakuru, Kisumu, Eldoret and more.`
                  : "Get in touch and we'll confirm delivery options and the fee for your area."}
              </p>
            </details>
            <details>
              <summary>Reviews</summary>
              <div>
                <div className={`stars ${LIVE.reviews ? "" : "is-off"}`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={!LIVE.reviews}
                      className={`star ${userRating >= star ? "on" : ""}`}
                      onClick={() => handleStarClick(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                  {LIVE.reviews && userRating > 0 && (
                    <button className="link-btn" onClick={handleDeleteRating}>Remove</button>
                  )}
                </div>
                <p className="muted small">
                  {!LIVE.reviews
                    ? "Reviews will open once the shop launches."
                    : averageRating
                    ? `Average ${averageRating} from ${allRatings.length} rating${allRatings.length > 1 ? "s" : ""}`
                    : "No ratings yet. Tap a star to rate this piece."}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="wrap section related">
          <h2 className="display center-title">You may also like</h2>
          <div className="prod-grid four">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetails;
