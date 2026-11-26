import { useLayoutEffect } from "react";

// Scroll reveals for the whole site. Run once per page (Layout.js): content blocks
// fade and rise into place as they scroll into view, and cards in a grid follow
// one another. Works with no per-page code; <Reveal> (components/Reveal.js) marks extra
// blocks with .rv-src and staggered groups with .rv-group.

// whole blocks
const BLOCKS = [
  ".section-head", ".page-intro", ".coll-hero", ".coll-panel-text", ".story", ".founder-quote > *", ".cta-band",
  ".about-hero .wrap", ".contact-top", ".contact-split", ".policy-nav", ".policy-body > *", ".gallery", ".info",
  ".center-title", ".shop-head", ".empty", ".rv-src",
].join(",");
// items that follow one another inside their grid
const ITEMS = [
  ".prod-grid > *", ".type-grid > *", ".coll-panel-cards > *", ".coll-mini-grid > *", ".craft-steps > li",
  ".values > *", ".coll-rows > *", ".rv-group > *",
].join(",");
// never animate: the hero has its own slideshow, and the cart/checkout should feel instant
const SKIP = ".hero, .co-page, [data-no-reveal]";

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const useReveal = (key) => {
  // layout effect: elements are hidden before the first paint, so nothing flashes
  useLayoutEffect(() => {
    const root = document.getElementById("main");
    if (!root || reduced() || !("IntersectionObserver" in window)) return undefined;

    const prepared = new Set();
    const finish = (el) => {
      el.classList.remove("rv", "rv-in");
      el.style.removeProperty("--rv-delay");
    };
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          io.unobserve(el);
          prepared.delete(el);
          el.classList.add("rv-in");
          // hand the element back to its own hover transitions once it has arrived
          el.addEventListener("transitionend", function done(ev) {
            if (ev.target !== el || ev.propertyName !== "transform") return;
            el.removeEventListener("transitionend", done);
            finish(el);
          });
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    const prep = (scope) => {
      scope.querySelectorAll(`${BLOCKS},${ITEMS}`).forEach((el) => {
        if (el.dataset.rv || el.closest(SKIP) || el.parentElement?.closest(".rv")) return;
        el.dataset.rv = "1";
        if (el.matches(ITEMS)) {
          const i = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.setProperty("--rv-delay", `${(i % 4) * 90}ms`);
        }
        el.classList.add("rv");
        prepared.add(el);
        io.observe(el);
      });
    };

    prep(root);
    // content that arrives later (filters, pages of results, loaded data)
    const mo = new MutationObserver((muts) =>
      muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && prep(n.parentElement || root)))
    );
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      // release anything not yet revealed, so a fresh run (or React's double
      // effect run in development) can pick it up again instead of leaving it hidden
      prepared.forEach((el) => {
        finish(el);
        delete el.dataset.rv;
      });
    };
  }, [key]);
};

export default useReveal;
