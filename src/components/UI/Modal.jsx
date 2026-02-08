import React from "react";

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} footer - Modal footer
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' | 'xl'
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = "lg"
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4"
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex justify-end gap-4 p-6 pt-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal Footer with Cancel and Submit buttons
 */
export const ModalFooter = ({ 
  onCancel, 
  onSubmit, 
  cancelText = "Cancel", 
  submitText = "Submit",
  submitting = false,
  submitVariant = "primary"
}) => {
  const submitClass = submitVariant === "primary"
    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
    : "bg-indigo-600 text-white hover:bg-indigo-700";

  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={submitting}
        className={`px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 ${submitClass}`}
      >
        {submitting ? "Processing..." : submitText}
      </button>
    </>
  );
};

export default Modal;
