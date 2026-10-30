import React, { useMemo, useState } from "react";
import { ksh, shortDate } from "./ui";

const DAYS = 14;
const W = 640;
const H = 220;
const PAD = { top: 16, right: 8, bottom: 26, left: 52 };
const BAR = 22; // capped column width; the rest of each slot stays empty

const niceMax = (v) => {
  if (v <= 0) return 1000;
  const step = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / step) * step;
};
const tickLabel = (v) => (v >= 10000 ? `${Math.round(v / 1000)}K` : v.toLocaleString());

// Column with a 4px rounded top and a square base on the baseline.
const columnPath = (x, y, w, h) => {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
};

// Daily sales (orders that were paid, excluding cancelled) for the last 14 days.
const SalesChart = ({ orders }) => {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: DAYS }, (_, i) => {
      const start = new Date(today.getTime() - (DAYS - 1 - i) * 86400000);
      const end = new Date(start.getTime() + 86400000);
      const dayOrders = orders.filter(
        (o) =>
          o.status !== "cancelled" &&
          o.payment.status === "paid" &&
          new Date(o.createdAt) >= start &&
          new Date(o.createdAt) < end
      );
      return { date: start.toISOString(), total: dayOrders.reduce((s, o) => s + o.totals.total, 0), count: dayOrders.length };
    });
  }, [orders]);

  const max = niceMax(Math.max(...days.map((d) => d.total)));
  const ticks = [0, max / 2, max];
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / DAYS;
  const y = (v) => PAD.top + plotH - (v / max) * plotH;
  const best = days.reduce((a, b) => (b.total > a.total ? b : a), days[0]);
  const periodTotal = days.reduce((s, d) => s + d.total, 0);

  return (
    <section className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Sales, last 14 days</h2>
          <p className="a-muted">{ksh(periodTotal)} from paid orders</p>
        </div>
        <button className="a-link" onClick={() => setAsTable((v) => !v)}>
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <table className="a-table compact">
          <thead>
            <tr><th>Day</th><th>Orders</th><th className="num">Sales</th></tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}>
                <td>{shortDate(d.date)}</td>
                <td>{d.count}</td>
                <td className="num">{ksh(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="a-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily sales for the last ${DAYS} days, ${ksh(periodTotal)} in total`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
                <text x={PAD.left - 8} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                  {tickLabel(t)}
                </text>
              </g>
            ))}
            {days.map((d, i) => {
              const cx = PAD.left + slot * i + slot / 2;
              const h = Math.max(d.total ? 2 : 0, (d.total / max) * plotH);
              return (
                <g
                  key={d.date}
                  className={`col ${hover === i ? "on" : ""}`}
                  tabIndex={0}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${shortDate(d.date)}: ${ksh(d.total)}, ${d.count} orders`}
                >
                  {/* hit area larger than the column */}
                  <rect x={cx - slot / 2} y={PAD.top} width={slot} height={plotH} className="hit" />
                  {h > 0 && <path d={columnPath(cx - BAR / 2, y(d.total), BAR, h)} className="bar" />}
                  {(i % 2 === 1 || i === DAYS - 1) && (
                    <text x={cx} y={H - 8} className="tick" textAnchor="middle">{shortDate(d.date)}</text>
                  )}
                  {d === best && d.total > 0 && (
                    <text x={cx} y={y(d.total) - 6} className="val" textAnchor="middle">{tickLabel(d.total)}</text>
                  )}
                </g>
              );
            })}
            <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} className="base" />
          </svg>
          {hover !== null && (
            <div
              className="a-tip"
              style={{ left: `${((PAD.left + slot * hover + slot / 2) / W) * 100}%`, top: `${(y(days[hover].total) / H) * 100}%` }}
            >
              <strong>{shortDate(days[hover].date)}</strong>
              <span>{ksh(days[hover].total)}</span>
              <span className="a-muted">{days[hover].count} {days[hover].count === 1 ? "order" : "orders"}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SalesChart;
