import React from "react";
import { FaInstagram, FaTiktok, FaFacebookF, FaPinterestP } from "react-icons/fa";
import { SOCIAL } from "../config";

const NETWORKS = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "pinterest", label: "Pinterest", Icon: FaPinterestP },
];

// Icons link out once a URL is set in config.js; until then they're plain icons.
const SocialIcons = ({ className = "" }) => (
  <div className={`socials ${className}`.trim()}>
    {NETWORKS.map(({ key, label, Icon }) =>
      SOCIAL[key] ? (
        <a key={key} href={SOCIAL[key]} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <Icon />
        </a>
      ) : (
        <span key={key} className="social-soon" title={`${label}: coming soon`} aria-hidden="true">
          <Icon />
        </span>
      )
    )}
  </div>
);

export default SocialIcons;
