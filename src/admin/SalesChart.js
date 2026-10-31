import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ksh, shortDate } from "./ui";

const DAY = 86400000;
const INK = { accent: "#a8782a", hover: "#8d6a2f", grid: "rgba(120,110,95,.16)", base: "rgba(120,110,95,.35)", muted: "#735f4c" }; // gold: 3.5:1 on the glass

const tickLabel = (v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : v);

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="a-tip">
      <span className="a-muted">{d.label}</span>
      <span className="a-strong">{ksh(d.sales)}</span>
      <span className="a-muted">{d.orders} {d.orders === 1 ? "order" : "orders"}</span>
    </div>
  );
};

// Paid (not cancelled) sales per day for the last `days` days, oldest first.
export const dailySales = (orders, days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const start = new Date(today.getTime() - (days - 1 - i) * DAY);
    const end = start.getTime() + DAY;
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return o.status !== "cancelled" && o.payment.status === "paid" && t >= start.getTime() && t < end;
    });
    return {
      label: shortDate(start.toISOString()),
      sales: dayOrders.reduce((s, o) => s + o.totals.total, 0),
      orders: dayOrders.length,
    };
  });
};

// Daily sales (paid, not cancelled) over the chosen range. One series, so no legend: the title names it.
const SalesChart = ({ orders, days }) => {
  const [asTable, setAsTable] = useState(false);

  const data = useMemo(() => dailySales(orders, days), [orders, days]);

  const total = data.reduce((s, d) => s + d.sales, 0);

  return (
    <section className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Sales</h2>
          <p className="a-muted small">{ksh(total)} from paid orders, last {days} days</p>
        </div>
        <button className="a-link small" onClick={() => setAsTable((v) => !v)}>
          {asTable ? "Show as chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <div className="a-table-wrap a-chart-table">
          <table className="a-table compact">
            <thead>
              <tr><th>Day</th><th className="num">Orders</th><th className="num">Sales</th></tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td className="num">{d.orders}</td>
                  <td className="num">{ksh(d.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="a-chart" role="img" aria-label={`Daily sales for the last ${days} days, ${ksh(total)} in total`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="18%">
              <CartesianGrid vertical={false} stroke={INK.grid} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: INK.base }}
                tick={{ fontSize: 11, fill: INK.muted }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tickFormatter={tickLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: INK.muted }}
                width={40}
                allowDecimals={false}
              />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,.5)" }} isAnimationActive={false} />
              <Bar
                dataKey="sales"
                fill={INK.accent}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                activeBar={{ fill: INK.hover }}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default SalesChart;
