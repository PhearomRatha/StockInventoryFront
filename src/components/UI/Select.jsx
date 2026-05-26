import React, { useState } from "react";
import ModalSelect from "./ModalSelect";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * Reusable Select Component (Deprecated Wrapper)
 * Wraps ModalSelect for backward compatibility.
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
  const [isOpen, setIsOpen] = useState(false);

  // Convert legacy options {value, label} to ModalSelect format
  const mappedOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const selectedOpt = mappedOptions.find((o) => o.value == value);
  const displayValue = selectedOpt ? selectedOpt.label : placeholder;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button replacing the native select */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all flex items-center justify-between bg-white text-left ${
          error ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        <span className={!selectedOpt ? "text-gray-400" : "text-gray-900"}>
          {displayValue}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </button>

      {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}

      <ModalSelect
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || placeholder}
        options={mappedOptions}
        selectedValue={value}
        onSelect={(val) => onChange(val)}
        placeholder={`Search ${label ? label.toLowerCase() : "options"}...`}
      />
    </div>
  );
};

export default Select;
