import React, { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useCart } from "../pages/CartContext";
import { colorNames } from "../pages/Products";
import ProductImage from "./ProductImage";

// Collection "set builder": tap pieces to include them, pick a colour for each,
// and add the whole set at once. Individual prices are left out on purpose;
// only the set total is shown.
const CollectionSet = ({ collection, items }) => {
  const { addManyToCart } = useCart();
  const [picked, setPicked] = useState({});

  // reset when switching collections: everything included, first colour chosen
  useEffect(() => {
    setPicked(Object.fromEntries(items.map((p) => [p.id, { on: true, color: p.colors?.[0] }])));
  }, [items]);

  const chosen = items.filter((p) => picked[p.id]?.on);
  const total = chosen.reduce((sum, p) => sum + p.price, 0);
  const update = (id, change) => setPicked((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

  const addSet = () =>
    addManyToCart(chosen.map((p) => ({ ...p, selectedColor: picked[p.id].color, quantity: 1 })));

  return (
    <div className="set-layout">
      <ul className="set-grid">
        {items.map((p) => {
          const state = picked[p.id] || {};
          return (
            <li key={p.id} className={`set-card ${state.on ? "on" : ""}`}>
              <button
                type="button"
                className="set-card-pick"
                aria-pressed={!!state.on}
                onClick={() => update(p.id, { on: !state.on })}
              >
                <span className="set-card-img">
                  <ProductImage src={p.image} product={p} alt={p.name} />
                  <span className="set-tick" aria-hidden="true">{state.on && <FiCheck />}</span>
                </span>
                <span className="set-card-name">{p.name}</span>
              </button>
              {p.colors?.length > 1 && (
                <div className="set-colors" role="radiogroup" aria-label={`${p.name} colour`}>
                  {p.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={state.color === c}
                      className={state.color === c ? "sel" : ""}
                      style={{ background: c }}
                      title={colorNames[c] || c}
                      aria-label={colorNames[c] || c}
                      onClick={() => update(p.id, { color: c, on: true })}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <aside className="set-panel">
        <h2>Your {collection.name} set</h2>
        <p className="muted small">Tap pieces to add or remove them, and choose a colour for each.</p>

        {chosen.length > 0 ? (
          <ul className="set-summary">
            {chosen.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <span className="muted">{colorNames[picked[p.id].color] || ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="set-empty muted">No pieces selected yet.</p>
        )}

        <div className="row total">
          <span>
            Total · {chosen.length} {chosen.length === 1 ? "piece" : "pieces"}
          </span>
          <span>KSh {total.toLocaleString()}</span>
        </div>
        <button className="btn square tan block" disabled={chosen.length === 0} onClick={addSet}>
          {chosen.length === items.length ? "Add the full set to cart" : "Add set to cart"}
        </button>
      </aside>
    </div>
  );
};

export default CollectionSet;
