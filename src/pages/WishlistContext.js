import React, { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

// Stores product ids only; pages look the product up in Products.js.
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const isWished = (id) => wishlist.includes(id);

  const toggleWish = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWished, toggleWish }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
