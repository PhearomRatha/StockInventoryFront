import { useState, useCallback } from "react";

/**
 * Hook to manage ModalSelect state
 * @returns {object} { isOpen, open, close, toggle }
 */
export function useModalSelect(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
