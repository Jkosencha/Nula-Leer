import React, { useEffect, useRef } from "react";

// Wraps content and fades/slides it in once it scrolls into view.
// Usage: <Reveal as="section" className="block">...</Reveal>
const Reveal = ({ as: Tag = "div", className = "", children, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
};

export default Reveal;
