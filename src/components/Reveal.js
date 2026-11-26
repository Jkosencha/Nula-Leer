import React from "react";

// Marks content for the site-wide scroll reveal (src/useReveal.js).
// <Reveal> fades a block in; <Reveal stagger> makes its children arrive one after another.
// as: the element or component to render (default div).
const Reveal = ({ as: Tag = "div", stagger = false, className = "", children, ...rest }) => (
  <Tag className={`${className} ${stagger ? "rv-group" : "rv-src"}`.trim()} {...rest}>
    {children}
  </Tag>
);

// A child of <Reveal stagger>. It needs no special behaviour; it exists so pages read clearly.
const Item = ({ as: Tag = "div", children, ...rest }) => <Tag {...rest}>{children}</Tag>;

Reveal.Item = Item;

export default Reveal;
