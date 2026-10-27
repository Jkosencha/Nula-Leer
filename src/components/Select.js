import React, { useEffect, useRef, useState } from "react";

// Styled dropdown (listbox) with keyboard support.
// options: [{ value, label, meta }] — `meta` shows on the right (e.g. a price).
const Select = ({ options, value, onChange, placeholder = "Select…", label }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  // close when clicking anywhere else
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((i) => Math.min(options.length - 1, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Enter" || e.key === " ") choose(options[active]);
    else if (e.key === "Escape" || e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`select ${open ? "open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {selected ? (
          <>
            <span>{selected.label}</span>
            {selected.meta && <span className="select-meta">{selected.meta}</span>}
          </>
        ) : (
          <span className="select-placeholder">{placeholder}</span>
        )}
        <span className="select-caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="select-list" role="listbox" ref={listRef} aria-label={label}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${i === active ? "active" : ""} ${o.value === value ? "sel" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
            >
              <span>{o.label}</span>
              {o.meta && <span className="select-meta">{o.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
