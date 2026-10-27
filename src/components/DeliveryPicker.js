import React, { useState } from "react";
import { SHIPPING_OPTIONS } from "../pages/CartContext";
import Select from "./Select";

const REGION_LABELS = { Others: "Rest of Kenya" };

// "ThikaRoad" -> "Thika Road"
export const townLabel = (town) => town.replace(/([a-z])([A-Z])/g, "$1 $2");

const regionOf = (town) =>
  Object.keys(SHIPPING_OPTIONS).find((region) => town in SHIPPING_OPTIONS[region]);

// Region tabs, then a dropdown of that region's towns with their delivery fee.
const DeliveryPicker = ({ value, onChange }) => {
  const [region, setRegion] = useState(() => regionOf(value) || Object.keys(SHIPPING_OPTIONS)[0]);

  return (
    <fieldset className="delivery">
      <legend>Delivery area</legend>

      <div className="region-tabs" role="tablist">
        {Object.entries(SHIPPING_OPTIONS).map(([name, towns]) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={region === name}
            className={region === name ? "on" : ""}
            onClick={() => setRegion(name)}
          >
            {REGION_LABELS[name] || name}
            <small>from KSh {Math.min(...Object.values(towns)).toLocaleString()}</small>
          </button>
        ))}
      </div>

      <Select
        label={`Delivery area in ${REGION_LABELS[region] || region}`}
        placeholder={`Choose your area in ${REGION_LABELS[region] || region}`}
        value={regionOf(value) === region ? value : ""}
        onChange={onChange}
        options={Object.entries(SHIPPING_OPTIONS[region]).map(([town, price]) => ({
          value: town,
          label: townLabel(town),
          meta: `KSh ${price.toLocaleString()}`,
        }))}
      />
    </fieldset>
  );
};

export default DeliveryPicker;
