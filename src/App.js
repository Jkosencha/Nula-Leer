import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import { CartProvider } from "./pages/CartContext";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import "./App.css";

const NotFound = () => (
  <div className="page-head" style={{ padding: "120px 0" }}>
    <span className="kicker">404</span>
    <h1>Page not found</h1>
    <p className="sub">The page you're looking for doesn't exist.</p>
    <div style={{ marginTop: 24 }}>
      <Link to="/" className="btn fill">Back home</Link>
    </div>
  </div>
);

const App = () => (
  <Router>
    <CartProvider>
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar theme="colored" />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/shop" element={<Layout><Shop /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/productDetails/:id" element={<Layout><ProductDetails /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<Layout hideContact><Checkout /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </CartProvider>
  </Router>
);

export default App;
