import React from "react";

/**
 * Reusable Input Component
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} type - Input type (text, number, email, password, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Required field
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props passed to input
 */
const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
          error ? "border-rose-500 focus:ring-rose-500" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
    </div>
  );
};

/**
 * Number Input Component
 */
export const NumberInput = (props) => (
  <Input type="number" {...props} />
);

/**
 * Email Input Component
 */
export const EmailInput = (props) => (
  <Input type="email" {...props} />
);

/**
 * Password Input Component
 */
export const PasswordInput = (props) => (
  <Input type="password" {...props} />
);

/**
 * File Input Component
 */
export const FileInput = ({ label, onChange, accept, required, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
    )}
    <input
      type="file"
      accept={accept}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    />
  </div>
);

export default Input;
