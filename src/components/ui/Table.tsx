import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id?: number }>({ data, columns, onRowClick }: TableProps<T>) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">No records found.</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? 'clickable-row' : ''}>
                {columns.map((col, j) => (
                  <td key={j}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
