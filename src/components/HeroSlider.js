import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { FiPause, FiPlay, FiArrowRight } from "react-icons/fi";

const DURATION = 6500; // ms each slide stays

/*
  Full-width hero that cross-fades between photos, each with its own words.
  slides: [{ key, image, title, text, cta: { to, label }, cta2?: { to, label }, label }]
  Plays by itself, including under the mouse (the hero fills most of the screen,
  so the cursor usually rests on it). It waits only while someone is using its
  controls or buttons by keyboard, or while the tab is hidden, and has a pause button
  (WCAG 2.2.2). With "reduce motion" on, slides still change but by a plain fade,
  with no zoom or slide-up.
*/
const HeroSlider = ({ slides }) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // the pause button
  const [busy, setBusy] = useState(false); // keyboard focus or pointer on the controls
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  const timer = useRef(null);
  const running = !paused && !busy && !hidden && slides.length > 1;

  const go = useCallback((i) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!running) return undefined;
    timer.current = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(timer.current);
  }, [index, running, go]);

  // wait while the tab is hidden, and carry on when it's back
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const slide = slides[index];

  return (
    <section
      className="hero hero-slider"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onFocus={(e) => e.target.matches(":focus-visible") && setBusy(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setBusy(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="hs-images" aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.key} className={`hs-image ${i === index ? "on" : ""}`}>
            {s.image ? <img src={s.image} alt="" decoding="async" loading={i === 0 ? "eager" : "lazy"} /> : <span className="hs-leather" />}
          </div>
        ))}
      </div>

      <div className="wrap hero-grid">
        <AnimatePresence mode="wait">
          <m.div
            key={slide.key}
            className="hero-copy"
            // reduce motion: a plain fade, no movement
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0.5 : 0.7, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={reduce ? { opacity: 0, transition: { duration: 0.3 } } : { opacity: 0, y: -12, transition: { duration: 0.35 } }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
          >
            <h1>{slide.title}</h1>
            <p className="hero-lead">{slide.text}</p>
            <div className="hero-ctas">
              <Link to={slide.cta.to} className="btn gold">
                {slide.cta.label} <FiArrowRight />
              </Link>
              {slide.cta2 && (
                <Link to={slide.cta2.to} className="btn ghost-light">
                  {slide.cta2.label}
                </Link>
              )}
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="wrap hs-controls" onMouseEnter={() => setBusy(true)} onMouseLeave={() => setBusy(false)}>
          <ol className="hs-dots">
            {slides.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={i === index ? "on" : ""}
                  aria-label={`Show slide ${i + 1}: ${s.label}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => go(i)}
                >
                  <span className="hs-dot-label">{s.label}</span>
                  <span className="hs-track">
                    <span
                      key={`${i}-${index}-${running}`}
                      className={`hs-fill ${i === index && running ? "run" : ""} ${i < index ? "done" : ""}`}
                      style={{ animationDuration: `${DURATION}ms` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="hs-pause"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          >
            {paused ? <FiPlay /> : <FiPause />}
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
