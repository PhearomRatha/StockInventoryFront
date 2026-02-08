import React from "react";

/**
 * Reusable DataTable Component
 * @param {Array} columns - Column definitions [{key, label, render?, className?}]
 * @param {Array} data - Data array
 * @param {string} emptyMessage - Message when no data
 * @param {React.ReactNode} emptyAction - Action button when empty
 * @param {function} onRowClick - Row click handler
 * @param {string} minWidth - Minimum table width
 */
const DataTable = ({ 
  columns = [], 
  data = [], 
  emptyMessage = "No data found",
  emptyAction,
  onRowClick,
  minWidth = "1000px"
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50/80 transition-colors duration-200 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-4 px-6 ${col.cellClassName || ""}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-16 h-16 text-gray-300 mb-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
