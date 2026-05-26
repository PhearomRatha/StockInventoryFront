import React, { useState } from "react";
import ModalSelect from "./ModalSelect";

/**
 * Reusable Search Input Component
 * @param {string} value - Search value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 */
export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
};

/**
 * Reusable Filter Dropdown Component using ModalSelect
 */
export const FilterDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  icon: Icon,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      )}
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full text-left flex justify-between items-center ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white hover:bg-gray-50`}
      >
        <span className="truncate mr-4 text-gray-700">{selectedOpt?.label || "Select..."}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <ModalSelect
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter"
        options={options}
        selectedValue={value}
        onSelect={onChange}
        placeholder="Search filters..."
      />
    </div>
  );
};

/**
 * Combined Search and Filter Controls Component
 */
export const SearchFilterControls = ({ 
  searchProps = {}, 
  filters = [],
  layout = "horizontal"
}) => {
  const containerClass = layout === "horizontal" 
    ? "flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center" 
    : "space-y-4";

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 ${containerClass}`}>
      <SearchInput {...searchProps} className={layout === "horizontal" ? "lg:w-96" : "w-full"} />
      
      {filters.length > 0 && (
        <div className={`flex flex-wrap gap-3 ${layout === "horizontal" ? "w-full lg:w-auto" : ""}`}>
          {filters.map((filter, index) => (
            <FilterDropdown key={index} {...filter} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Pre-configured product filters
 */
export const productFilters = (categories = []) => [
  {
    value: "All",
    label: "All Categories",
    options: [
      { value: "All", label: "All Categories" },
      ...categories.map((c) => ({ value: c.name, label: c.name }))
    ]
  },
  {
    value: "id",
    label: "Sort by ID",
    options: [
      { value: "id", label: "Sort by ID" },
      { value: "created_at", label: "Sort by Date" },
      { value: "name", label: "Sort by Name" },
      { value: "price", label: "Sort by Price" },
      { value: "stock_quantity", label: "Sort by Stock" }
    ]
  }
];
