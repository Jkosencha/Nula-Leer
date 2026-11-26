// Dashboard charts (ApexCharts), styled from the Nula Leer palette:
// Espresso Black #1f1610, Walnut Brown #523828, Deep Espresso #936d4b, Vanilla Cream #faf0d5.
// Each chart follows the dashboard's light/dark theme (set on <html data-admin-theme>).
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ksh } from "./ui";

// light/dark, kept in step with AdminApp's theme switch
export const useAdminDark = () => {
  const read = () => document.documentElement.dataset.adminTheme === "dark";
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-admin-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
};

const tone = (dark) => ({
  line: dark ? "#c8a585" : "#936d4b", // the measured line or bar: 3:1+ against its background either way
  text: dark ? "#b89878" : "#6e5240",
  strong: dark ? "#faf0d5" : "#1f1610",
  grid: dark ? "rgba(250,240,213,.08)" : "rgba(82,56,40,.12)",
  bg: dark ? "#2a1e16" : "#f1e4c9", // card colour, for the donut gaps and point rings
});

const short = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}K` : `${v}`);

const base = (dark) => ({
  chart: {
    background: "transparent",
    fontFamily: "'Fira Sans', system-ui, sans-serif",
    foreColor: tone(dark).text,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 650, animateGradually: { enabled: true, delay: 40 } },
  },
  theme: { mode: dark ? "dark" : "light" },
  grid: { borderColor: tone(dark).grid, strokeDashArray: 4, padding: { left: 6, right: 6 } },
  dataLabels: { enabled: false },
  legend: { show: false },
  states: { hover: { filter: { type: "darken", value: 0.85 } } },
});

// shared tooltip box, matching the dashboard's glass cards
const tipBox = (title, value, sub) =>
  `<div class="a-apex-tip"><span>${title}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;

/* Daily sales as a smooth area. data: [{ label, sales, orders }] */
export const SalesArea = ({ data, height = 280 }) => {
  const dark = useAdminDark();
  const t = tone(dark);
  const options = {
    ...base(dark),
    chart: { ...base(dark).chart, type: "area", id: "sales" },
    colors: [t.line],
    stroke: { curve: "monotoneCubic", width: 2.5 },
    fill: { type: "solid", opacity: dark ? 0.16 : 0.14 }, // an even tint under the line, no fade
    markers: { size: 0, strokeWidth: 3, strokeColors: t.bg, hover: { size: 6 } },
    xaxis: {
      categories: data.map((d) => d.label),
      tickAmount: Math.min(7, data.length - 1),
      labels: { rotate: 0, hideOverlappingLabels: true, style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { stroke: { color: t.line, dashArray: 3 } },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { formatter: short, style: { fontSize: "11px" } }, min: 0, forceNiceScale: true },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const d = data[dataPointIndex];
        return tipBox(d.label, ksh(d.sales), `${d.orders} ${d.orders === 1 ? "order" : "orders"}`);
      },
    },
  };
  return <Chart type="area" height={height} options={options} series={[{ name: "Sales", data: data.map((d) => d.sales) }]} />;
};

// stage colours, darkest first; the legend beside the donut uses the same order
export const DONUT_COLORS = { light: ["#1f1610", "#936d4b", "#c8a585", "#e6d4b0"], dark: ["#faf0d5", "#c8a585", "#936d4b", "#5c4535"] };

/* Part-to-whole of orders by stage, with the total in the middle. parts: [{ label, count }] */
export const StatusDonut = ({ parts, total, height = 230 }) => {
  const dark = useAdminDark();
  const t = tone(dark);
  const colors = dark ? DONUT_COLORS.dark : DONUT_COLORS.light;
  const options = {
    ...base(dark),
    chart: { ...base(dark).chart, type: "donut" },
    labels: parts.map((p) => p.label),
    colors,
    stroke: { width: 3, colors: [t.bg] },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "74%",
          labels: {
            show: true,
            name: { show: true, fontSize: "12px", color: t.text, offsetY: 18 },
            value: { show: true, fontSize: "28px", fontWeight: 600, color: t.strong, offsetY: -14, fontFamily: "Poppins, sans-serif" },
            total: { show: true, label: "orders", color: t.text, fontSize: "12px", formatter: () => String(total) },
          },
        },
      },
    },
    tooltip: { enabled: false },
  };
  return <Chart type="donut" height={height} options={options} series={parts.map((p) => p.count)} />;
};


/* Takings by category as horizontal bars. rows: [{ label, sales }] */
export const CategoryBars = ({ rows }) => {
  const dark = useAdminDark();
  const t = tone(dark);
  const options = {
    ...base(dark),
    chart: { ...base(dark).chart, type: "bar" },
    colors: [t.line],
    // amounts sit just past each bar in full-strength text (small light text on the bar would be too faint)
    plotOptions: { bar: { horizontal: true, barHeight: "56%", borderRadius: 3, borderRadiusApplication: "end", dataLabels: { position: "top" } } },
    dataLabels: {
      enabled: true,
      formatter: (v) => ksh(v),
      textAnchor: "start",
      offsetX: 10,
      style: { fontSize: "12px", fontWeight: 500, colors: [t.strong] },
    },
    // the scale runs ~55% past the largest amount so every label fits after its bar
    xaxis: {
      categories: rows.map((r) => r.label),
      max: Math.max(1, ...rows.map((r) => r.sales)) * 1.55,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: [t.strong] }, maxWidth: 130 } },
    grid: { ...base(dark).grid, padding: { left: 4, right: 12 }, xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } } },
    tooltip: { custom: ({ dataPointIndex }) => tipBox(rows[dataPointIndex].label, ksh(rows[dataPointIndex].sales)) },
  };
  return <Chart type="bar" height={Math.max(160, rows.length * 44)} options={options} series={[{ name: "Takings", data: rows.map((r) => r.sales) }]} />;
};
