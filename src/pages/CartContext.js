import React, { createContext, useContext, useEffect, useState } from "react";
import { LIVE } from "../config";
import { deliveryFee } from "../shipping";
import { track } from "../analytics";

export const CartContext = createContext();

export { SHIPPING_OPTIONS } from "../shipping";

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
  const addToCart = (product) => addManyToCart([product]);

  // add several products in one go (e.g. a whole collection), opening the drawer once
  const addManyToCart = (list) => {
    list.forEach((p) => track("Add to cart", { product: p.name }));
    setCartItems((prev) =>
      list.reduce((items, product) => {
        const qty = product.quantity && product.quantity > 0 ? product.quantity : 1;
        const cartId = makeCartId(product);
        if (items.some((item) => item.cartId === cartId)) {
          return items.map((item) =>
            item.cartId === cartId ? { ...item, quantity: item.quantity + qty } : item
          );
        }
        return [...items, { ...product, quantity: qty, cartId }];
      }, prev)
    );
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
    setShippingCost(deliveryFee(town) || 0);
  };

  // returns false when the code isn't recognised
  const applyCoupon = (code) => {
    const key = code.trim().toUpperCase();
    if (!COUPONS[key]) return false;
    setCoupon(key);
    return true;
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = LIVE.discounts ? COUPONS[coupon] || 0 : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addManyToCart,
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
