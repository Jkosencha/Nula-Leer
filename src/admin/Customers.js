import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { listCustomers } from "./api";
import { PageHead, ksh, shortDate, customerName, waNumber } from "./ui";

// Everyone who has ordered, grouped by phone number, biggest spenders first.
const Customers = () => {
  const [customers, setCustomers] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    listCustomers().then(setCustomers);
  }, []);

  if (!customers) return <p className="a-muted">Loading…</p>;

  const term = q.trim().toLowerCase();
  const shown = customers.filter(
    (c) => !term || customerName(c).toLowerCase().includes(term) || c.phone.includes(term) || c.email.toLowerCase().includes(term)
  );

  return (
    <>
      <PageHead title="Customers" />
      <label className="a-search">
        <FiSearch />
        <input type="search" placeholder="Search by name, phone or email" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      <section className="a-card flush">
        {shown.length === 0 ? (
          <p className="a-empty">No customers yet.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Area</th><th>Orders</th><th className="num">Spent</th><th>Last order</th></tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.phone}>
                    <td>
                      <Link to={`/admin/orders?q=${encodeURIComponent(c.phone)}`} className="a-strong">{customerName(c)}</Link>
                      <span className="a-sub">{c.email}</span>
                    </td>
                    <td>
                      <a href={`https://wa.me/${waNumber(c.phone)}`} target="_blank" rel="noreferrer" className="a-wa" aria-label={`WhatsApp ${customerName(c)}`}>
                        <FaWhatsapp /> {c.phone}
                      </a>
                    </td>
                    <td>{c.area}</td>
                    <td>{c.orders}</td>
                    <td className="num">{ksh(c.spent)}</td>
                    <td>{shortDate(c.lastOrder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default Customers;
