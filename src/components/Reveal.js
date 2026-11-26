import React from "react";
import { m, useReducedMotion } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1];

// motion versions of tags ("div", "section") or components (e.g. react-router's Link), made once each
const cache = new Map();
const motionOf = (as) => {
  if (typeof as === "string") return m[as] || m.div;
  if (!cache.has(as)) cache.set(as, m.create(as));
  return cache.get(as);
};

// Fades its content up into place the first time it scrolls into view.
// as: the element to render (default div). stagger: animate direct <Reveal.Item> children one after another.
const Reveal = ({ as = "div", stagger = false, delay = 0, className, children, ...rest }) => {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const Tag = motionOf(as);
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.18 }}
      variants={
        stagger
          ? { hidden: {}, shown: { transition: { staggerChildren: 0.08, delayChildren: delay } } }
          : { hidden: { opacity: 0, y: 28 }, shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay } } }
      }
      {...rest}
    >
      {children}
    </Tag>
  );
};

// A child of <Reveal stagger>: rises in turn with its siblings.
const Item = ({ as = "div", className, children, ...rest }) => {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const Tag = motionOf(as);
  return (
    <Tag
      className={className}
      variants={{ hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

Reveal.Item = Item;

export default Reveal;
