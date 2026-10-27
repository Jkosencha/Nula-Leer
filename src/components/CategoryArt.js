import React from "react";

// Stitched line drawings used until a category, collection or product has its own photo.
// Strokes use currentColor; `.st` paths are the dashed "stitching".
const ART = {
  belts: (
    <>
      <rect x="22" y="58" width="168" height="26" rx="4" />
      <path className="st" d="M50 63 H184 M50 79 H184" />
      <rect x="6" y="49" width="34" height="44" rx="7" />
      <path d="M12 71 H44" />
      <rect x="48" y="53" width="11" height="36" rx="2" />
      <circle cx="122" cy="71" r="2.6" />
      <circle cx="138" cy="71" r="2.6" />
      <circle cx="154" cy="71" r="2.6" />
    </>
  ),
  wallets: (
    <>
      <rect x="40" y="32" width="120" height="84" rx="9" />
      <rect className="st" x="47" y="39" width="106" height="70" rx="6" />
      <path d="M100 32 V116" opacity=".35" />
      <path d="M112 54 h34 M112 68 h34 M112 82 h34" />
    </>
  ),
  purses: (
    <>
      <rect x="32" y="46" width="136" height="72" rx="12" />
      <path d="M32 54 L100 92 L168 54" />
      <path className="st" d="M42 58 L100 84 L158 58" />
      <circle cx="100" cy="92" r="5.5" />
      <path className="st" d="M40 110 H160" />
    </>
  ),
  "laptop-sleeves": (
    <>
      <rect x="24" y="24" width="152" height="98" rx="10" />
      <rect className="st" x="31" y="31" width="138" height="84" rx="7" />
      <path d="M150 60 h26 v26 h-26 a8 8 0 0 1 -8 -8 v-10 a8 8 0 0 1 8 -8 z" />
      <circle cx="158" cy="73" r="3.5" />
    </>
  ),
  "wash-bags": (
    <>
      <path d="M44 48 H156 L166 116 Q166 122 160 122 H40 Q34 122 34 116 Z" />
      <path className="st" d="M50 56 H150" />
      <path d="M48 48 Q100 36 152 48" />
      <path d="M140 42 v14 h8" />
      <path d="M161 64 q20 4 18 22 q-2 14 -16 14" />
      <path className="st" d="M44 112 H156" />
    </>
  ),
  "key-holders": (
    <>
      <circle cx="92" cy="30" r="16" />
      <rect x="86" y="44" width="12" height="10" rx="2" />
      <rect x="70" y="54" width="44" height="76" rx="22" />
      <rect className="st" x="77" y="61" width="30" height="62" rx="15" />
      <circle cx="92" cy="70" r="3" />
      <circle cx="128" cy="38" r="9" />
      <path d="M134 45 L162 76 M150 63 l-6 6 M157 70 l-6 6" />
    </>
  ),
  safari: (
    <>
      <circle cx="148" cy="38" r="12" />
      <path d="M38 64 Q100 38 162 64 Q100 74 38 64 Z" />
      <path d="M100 70 L97 116 M98 92 L82 72 M99 84 L118 70" />
      <path d="M20 116 H180" />
      <path className="st" d="M30 124 H170" />
    </>
  ),
  gifts: (
    <>
      <rect x="50" y="64" width="100" height="54" rx="4" />
      <rect x="44" y="48" width="112" height="18" rx="3" />
      <path d="M100 48 V118" />
      <path d="M100 48 C88 30 68 34 78 48 M100 48 C112 30 132 34 122 48" />
      <path className="st" d="M58 72 H92 M108 72 H142" />
    </>
  ),
};

const CategoryArt = ({ slug, className = "" }) => (
  <svg
    className={`cat-art ${className}`.trim()}
    viewBox="0 0 200 140"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ART[slug] || <rect x="40" y="30" width="120" height="84" rx="10" />}
  </svg>
);

export default CategoryArt;
