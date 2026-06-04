import React, { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext();

// A cart line is uniquely identified by product id + chosen colour,
// so the same product in two colours shows as two lines.
const makeCartId = (product) => `${product.id}-${product.selectedColor || "default"}`;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingLocation, setShippingLocation] = useState(
    () => localStorage.getItem("shippingLocation") || ""
  );

  const [shippingCost, setShippingCost] = useState(() => {
    const saved = localStorage.getItem("shippingCost");
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("shippingLocation", shippingLocation);
  }, [shippingLocation]);

  useEffect(() => {
    localStorage.setItem("shippingCost", shippingCost);
  }, [shippingCost]);

  // FIX: respect the quantity passed in (the old version always forced 1),
  // and key by cartId so colour variants don't merge.
  const addToCart = (product) => {
    const qty = product.quantity && product.quantity > 0 ? product.quantity : 1;
    const cartId = makeCartId(product);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty, cartId }];
    });
  };

  const increaseQuantity = (cartId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (cartId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingLocation("");
    setShippingCost(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        shippingLocation,
        setShippingLocation,
        shippingCost,
        setShippingCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
