import React, { createContext, useContext, useEffect, useState } from "react";

export const CartContext = createContext();

export const SHIPPING_OPTIONS = {
  Nairobi: { Westlands: 200, ThikaRoad: 500, CBD: 150, Karen: 250, Ngong: 100, Kikuyu: 200, Kiambu: 300 },
  Mombasa: { Mombasa: 1300, Lamu: 1200, Malindi: 1500, Kilifi: 2000, Ukunda: 2000 },
  Others: { Nakuru: 350, Kisumu: 400, Eldoret: 1800, Muranga: 1000 },
};

const COUPONS = { SAVE100: 100 };

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

  // slide-out mini cart; opened automatically whenever something is added
  const [drawerOpen, setDrawerOpen] = useState(false);

  // kept here (not in the cart page) so the discount carries through to checkout
  const [coupon, setCoupon] = useState(() => localStorage.getItem("coupon") || "");

  useEffect(() => {
    localStorage.setItem("coupon", coupon);
  }, [coupon]);

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
    setDrawerOpen(true);
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
    setCoupon("");
  };

  const selectShipping = (town) => {
    setShippingLocation(town);
    let price = 0;
    Object.values(SHIPPING_OPTIONS).forEach((towns) => {
      if (towns[town]) price = towns[town];
    });
    setShippingCost(price);
  };

  // returns false when the code isn't recognised
  const applyCoupon = (code) => {
    const key = code.trim().toUpperCase();
    if (!COUPONS[key]) return false;
    setCoupon(key);
    return true;
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = COUPONS[coupon] || 0;

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
        drawerOpen,
        setDrawerOpen,
        selectShipping,
        coupon,
        applyCoupon,
        removeCoupon: () => setCoupon(""),
        subtotal,
        discount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
