import React from "react";

/**
 * Reusable Select Component
 * @param {string} label - Select label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Options array [{value, label}]
 * @param {boolean} required - Required field
 * @param {string} placeholder - Placeholder option text
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props passed to select
 */
const Select = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = "Select an option",
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white ${
          error ? "border-rose-500 focus:ring-rose-500" : ""
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
};

export default Select;
