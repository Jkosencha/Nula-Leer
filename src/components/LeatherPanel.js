import React from "react";
import CategoryArt from "./CategoryArt";

// Leather-textured, stitched panel with a line drawing, or a photo once there is one.
const LeatherPanel = ({ tone, art, image, alt = "", className = "", children }) => (
  <div className={`leather-panel ${image ? "has-img" : ""} ${className}`.trim()} style={{ "--tone": tone }}>
    {image ? <img src={image} alt={alt} /> : <CategoryArt slug={art} />}
    {children}
  </div>
);

export default LeatherPanel;
