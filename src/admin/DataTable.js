import React, { useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

// Ticks the box without a label of its own: the row or header supplies it.
const Check = ({ checked, indeterminate, onChange, label }) => (
  <input
    type="checkbox"
    className="a-checkbox"
    aria-label={label}
    checked={checked}
    ref={(el) => el && (el.indeterminate = !checked && indeterminate)}
    onChange={onChange}
  />
);

const selectColumn = {
  id: "select",
  enableSorting: false,
  meta: { className: "a-col-check" },
  header: ({ table }) => (
    <Check
      label="Select all on this page"
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => <Check label="Select row" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
};

// Clicks on links, buttons, inputs and menus inside a row keep their own job.
const isControl = (target) => target.closest("a,button,input,select,label,[role=menuitem]");

/*
  Sortable, paginated table shared by every list in the dashboard.
  columns: TanStack column defs; meta.align "right" for numbers, meta.className for widths.
  selectable + bulkBar(rows, clear): a bar of actions for the ticked rows.
*/
const DataTable = ({
  data,
  columns,
  getRowId,
  pageSize = 10,
  initialSort = [],
  selectable = false,
  bulkBar,
  onRowClick,
  empty = "Nothing here yet.",
  label,
}) => {
  const [sorting, setSorting] = useState(initialSort);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  // a new filter or search starts again from the first page
  useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [data]);

  const table = useReactTable({
    data,
    columns: selectable ? [selectColumn, ...columns] : columns,
    state: { sorting, rowSelection, pagination },
    getRowId,
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const selected = table.getSelectedRowModel().rows.map((r) => r.original);
  const rows = table.getRowModel().rows;
  const total = data.length;
  const { pageIndex } = table.getState().pagination;
  const from = total ? pageIndex * pageSize + 1 : 0;
  const to = Math.min(total, (pageIndex + 1) * pageSize);

  return (
    <div className="a-dt">
      {selectable && selected.length > 0 && (
        <div className="a-bulk" role="region" aria-label="Actions for selected rows">
          <span className="a-strong">{selected.length} selected</span>
          {bulkBar(selected, () => setRowSelection({}))}
          <button className="a-link" onClick={() => setRowSelection({})}>
            Clear
          </button>
        </div>
      )}

      {total === 0 ? (
        <div className="a-empty">{empty}</div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table" aria-label={label}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const meta = h.column.columnDef.meta || {};
                    const sort = h.column.getIsSorted();
                    const cls = [meta.align === "right" && "num", meta.className].filter(Boolean).join(" ");
                    return (
                      <th key={h.id} className={cls} aria-sort={sort ? (sort === "asc" ? "ascending" : "descending") : undefined}>
                        {h.column.getCanSort() ? (
                          <button className="a-sort" onClick={h.column.getToggleSortingHandler()}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {sort === "asc" ? (
                              <ArrowUp size={13} />
                            ) : sort === "desc" ? (
                              <ArrowDown size={13} />
                            ) : (
                              <ChevronsUpDown size={13} className="idle" />
                            )}
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${row.getIsSelected() ? "selected" : ""} ${onRowClick ? "clickable" : ""}`}
                  onClick={onRowClick ? (e) => !isControl(e.target) && onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta || {};
                    const cls = [meta.align === "right" && "num", meta.className].filter(Boolean).join(" ");
                    return (
                      <td key={cell.id} className={cls}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > pageSize && (
        <div className="a-pager">
          <span className="a-muted">
            {from}–{to} of {total}
          </span>
          <div className="a-pager-btns">
            <button
              className="a-icon-btn"
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="a-pager-page">
              Page {pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="a-icon-btn"
              aria-label="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
