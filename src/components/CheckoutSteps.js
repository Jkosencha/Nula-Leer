import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const STEPS = [
  { key: "cart", label: "Shopping cart", to: "/cart" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
];

// "Shopping cart → Shipping → Payment"; earlier steps are links back.
const CheckoutSteps = ({ current, onStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="steps">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        let label = step.label;
        if (done && step.to) label = <Link to={step.to}>{step.label}</Link>;
        else if (done && onStep) label = <button onClick={() => onStep(step.key)}>{step.label}</button>;
        return (
          <li key={step.key} className={i === currentIndex ? "current" : done ? "done" : ""}>
            {i > 0 && <FiArrowRight className="sep" aria-hidden="true" />}
            {label}
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutSteps;
