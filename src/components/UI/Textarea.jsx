import React from "react";

/**
 * Reusable Textarea Component
 * @param {string} label - Textarea label
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {number} rows - Number of rows
 * @param {boolean} required - Required field
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props passed to textarea
 */
const Textarea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  required = false,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none ${
          error ? "border-rose-500 focus:ring-rose-500" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
};

export default Textarea;
