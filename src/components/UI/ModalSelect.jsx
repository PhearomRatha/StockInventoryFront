import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

/**
 * ModalSelect – replaces every native <select> with a modal dialog.
 *
 * Props:
 *  isOpen          {boolean}  – controls visibility
 *  onClose         {fn}       – called when modal closes
 *  title           {string}   – modal header title
 *  options         {Array}    – [{ value, label, icon?, badge?, category? }]
 *  selectedValue   {any}      – currently selected value
 *  onSelect        {fn}       – called with chosen value when user clicks an item
 *  placeholder     {string}   – search placeholder
 *  pageSize        {number}   – items per page (default 8)
 *  categories      {Array}    – optional list of category strings for top scroll bar
 *  showIcons       {boolean}  – show add/remove icon buttons per row (optional)
 *  onAdd           {fn}       – called with item when add icon clicked
 *  onRemove        {fn}       – called with item when remove icon clicked
 *  emptyMessage    {string}   – shown when no options match
 */
const ModalSelect = ({
  isOpen,
  onClose,
  title = "Select an option",
  options = [],
  selectedValue,
  onSelect,
  placeholder = "Search...",
  pageSize = 8,
  categories = [],
  showIcons = false,
  onAdd,
  onRemove,
  emptyMessage = "No options found",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const searchRef = useRef(null);
  const catBarRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setPage(1);
      setActiveCategory("All");
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Keyboard dismiss
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Filtered + paginated
  const filteredOptions = options.filter((opt) => {
    const matchSearch =
      opt.label?.toLowerCase().includes(search.toLowerCase()) ||
      opt.sublabel?.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || opt.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredOptions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSelect = (opt) => {
    onSelect(opt.value, opt);
    onClose();
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setPage(1);
  };

  // Scroll category bar with arrow keys
  const scrollCatBar = (dir) => {
    if (catBarRef.current) {
      catBarRef.current.scrollBy({ left: dir * 120, behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  const allCategories = ["All", ...categories];

  return (
    <div
      className="modal-select-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="modal-select-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="modal-select-header">
          <div className="modal-select-header-left">
            <div className="modal-select-header-icon">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="modal-select-title">{title}</h2>
          </div>
          <button
            className="modal-select-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="modal-select-search-wrap">
          <MagnifyingGlassIcon className="modal-select-search-icon" />
          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="modal-select-search-input"
          />
          {search && (
            <button
              className="modal-select-search-clear"
              onClick={() => handleSearch("")}
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Category scroll bar ── */}
        {categories.length > 0 && (
          <div className="modal-select-cat-row">
            <button
              className="modal-select-cat-arrow"
              onClick={() => scrollCatBar(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <div className="modal-select-cat-bar" ref={catBarRef}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`modal-select-cat-chip ${
                    activeCategory === cat ? "active" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              className="modal-select-cat-arrow"
              onClick={() => scrollCatBar(1)}
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Option List ── */}
        <div className="modal-select-list">
          {pageItems.length === 0 ? (
            <div className="modal-select-empty">
              <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{emptyMessage}</p>
              {search && (
                <p className="text-gray-400 text-sm mt-1">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            pageItems.map((opt) => {
              const isSelected = opt.value == selectedValue;
              return (
                <div
                  key={opt.value}
                  className={`modal-select-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(opt)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleSelect(opt)
                  }
                >
                  {/* Left: optional image / avatar */}
                  {opt.image && (
                    <img
                      src={opt.image}
                      alt={opt.label}
                      className="modal-select-item-img"
                    />
                  )}

                  {/* Label area */}
                  <div className="modal-select-item-text">
                    <span className="modal-select-item-label">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="modal-select-item-sublabel">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  {opt.badge && (
                    <span
                      className={`modal-select-badge ${opt.badgeColor || "badge-default"}`}
                    >
                      {opt.badge}
                    </span>
                  )}

                  {/* Add / Remove icons */}
                  {showIcons && (
                    <div
                      className="modal-select-item-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onAdd && (
                        <button
                          className="modal-select-icon-btn add"
                          onClick={() => onAdd(opt)}
                          title="Add"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                          </svg>
                        </button>
                      )}
                      {onRemove && (
                        <button
                          className="modal-select-icon-btn remove"
                          onClick={() => onRemove(opt)}
                          title="Remove"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Selected check */}
                  {isSelected && (
                    <CheckIcon className="modal-select-check" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="modal-select-pagination">
            <span className="modal-select-page-info">
              {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filteredOptions.length)} of{" "}
              {filteredOptions.length}
            </span>
            <div className="modal-select-page-btns">
              <button
                className="modal-select-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let n;
                if (totalPages <= 5) n = i + 1;
                else if (safePage <= 3) n = i + 1;
                else if (safePage >= totalPages - 2) n = totalPages - 4 + i;
                else n = safePage - 2 + i;
                return (
                  <button
                    key={n}
                    className={`modal-select-page-num ${safePage === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                className="modal-select-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalSelect;
