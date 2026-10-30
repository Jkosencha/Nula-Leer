import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import { CartProvider } from "./pages/CartContext";
import { WishlistProvider } from "./pages/WishlistContext";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Contact from "./pages/Contact";
import Collections from "./pages/Collections";
import CollectionPage from "./pages/CollectionPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import Policy from "./pages/Policy";
import { SHOP_OPEN } from "./config";
import "./App.css";

// the admin dashboard is loaded only when /admin is opened
const AdminApp = lazy(() => import("./admin/AdminApp"));

const NotFound = () => (
  <div className="wrap empty" style={{ padding: "120px 0" }}>
    <h1>Page not found</h1>
    <p className="muted">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn">Back home</Link>
  </div>
);

const App = () => (
  <Router>
    <CartProvider>
      <WishlistProvider>
        <ToastContainer position="bottom-center" autoClose={2500} hideProgressBar theme="dark" />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/shop" element={<Layout><Shop /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/productDetails/:id" element={<Layout><ProductDetails /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/collections" element={<Layout><Collections /></Layout>} />
          <Route path="/collections/:slug" element={<Layout><CollectionPage /></Layout>} />
          <Route path="/policies/:slug" element={<Layout><Policy /></Layout>} />
          {SHOP_OPEN && (
            <>
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/checkout" element={<Layout checkout><Checkout /></Layout>} />
              <Route path="/order/confirmation" element={<Layout checkout><OrderConfirmation /></Layout>} />
              <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
            </>
          )}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<p style={{ padding: 32 }}>Loading…</p>}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </WishlistProvider>
    </CartProvider>
  </Router>
);

export default App;
