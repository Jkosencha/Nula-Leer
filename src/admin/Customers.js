import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MessageCircle, Mail, Receipt } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { listCustomers } from "./api";
import DataTable from "./DataTable";
import { PageHead, RowMenu, Avatar, ksh, shortDate, customerName, waNumber } from "./ui";

// Everyone who has ordered, grouped by phone number, biggest spenders first.
const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    listCustomers().then(setCustomers);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Customer",
        accessorFn: (c) => customerName(c),
        cell: ({ row }) => (
          <span className="a-person">
            <Avatar person={row.original} />
            <span>
              <Link to={`/admin/orders?q=${encodeURIComponent(row.original.phone)}`} className="a-strong">
                {customerName(row.original)}
              </Link>
              <span className="a-sub">{row.original.email}</span>
            </span>
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableSorting: false,
        cell: ({ row }) => (
          <a
            href={`https://wa.me/${waNumber(row.original.phone)}`}
            target="_blank"
            rel="noreferrer"
            className="a-wa"
            aria-label={`WhatsApp ${customerName(row.original)}`}
          >
            <FaWhatsapp /> {row.original.phone}
          </a>
        ),
      },
      { accessorKey: "area", header: "Area" },
      { accessorKey: "orders", header: "Orders", meta: { align: "right" } },
      { accessorKey: "spent", header: "Spent", cell: ({ getValue }) => ksh(getValue()), meta: { align: "right" } },
      { accessorKey: "lastOrder", header: "Last order", cell: ({ getValue }) => shortDate(getValue()) },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        meta: { className: "a-col-menu" },
        cell: ({ row }) => (
          <RowMenu
            label={`Actions for ${customerName(row.original)}`}
            items={[
              {
                label: "See their orders",
                icon: <Receipt size={15} />,
                onSelect: () => navigate(`/admin/orders?q=${encodeURIComponent(row.original.phone)}`),
              },
              { label: "WhatsApp", icon: <MessageCircle size={15} />, href: `https://wa.me/${waNumber(row.original.phone)}` },
              { label: "Email", icon: <Mail size={15} />, onSelect: () => (window.location.href = `mailto:${row.original.email}`) },
            ]}
          />
        ),
      },
    ],
    [navigate]
  );

  const shown = useMemo(() => {
    if (!customers) return [];
    const term = q.trim().toLowerCase();
    return customers.filter(
      (c) => !term || customerName(c).toLowerCase().includes(term) || c.phone.includes(term) || c.email.toLowerCase().includes(term)
    );
  }, [customers, q]);

  if (!customers) return <p className="a-muted">Loading…</p>;

  return (
    <>
      <PageHead title="Customers" sub={`${customers.length} people have ordered`} />
      <section className="a-card flush">
        <div className="a-toolbar">
          <label className="a-search">
            <Search size={16} />
            <input type="search" placeholder="Search by name, phone or email" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <DataTable
          data={shown}
          columns={columns}
          getRowId={(c) => c.phone}
          label="Customers"
          initialSort={[{ id: "spent", desc: true }]}
          empty={q ? `No customers match “${q}”.` : "No customers yet."}
        />
      </section>
    </>
  );
};

export default Customers;
