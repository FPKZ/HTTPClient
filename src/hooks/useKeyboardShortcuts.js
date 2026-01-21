import { useEffect } from "react";

/**
 * useKeyboardShortcuts
 * Hook para registrar atalhos de teclado globais baseados no template do menu.
 *
 * @param {Array} menuItems - Itens do menu que possuem a propriedade 'shortcut' e 'onClick'.
 */
export function useKeyboardShortcuts(menuItems) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      menuItems.forEach((item) => {
        if (!item.shortcut || !item.onClick || item.disabled) return;

        // Formato esperado do shortcut: "Ctrl+N", "Ctrl+S", etc.
        const parts = item.shortcut.split("+");
        const key = parts[parts.length - 1].toUpperCase();
        const hasCtrl = parts.includes("Ctrl");
        const hasAlt = parts.includes("Alt");
        const hasShift = parts.includes("Shift");

        const matchesCtrl = hasCtrl
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
        const matchesAlt = hasAlt ? event.altKey : !event.altKey;
        const matchesShift = hasShift ? event.shiftKey : !event.shiftKey;
        const matchesKey = event.key.toUpperCase() === key;

        if (matchesCtrl && matchesAlt && matchesShift && matchesKey) {
          // Previne o comportamento padrão do navegador/electron para esses atalhos
          event.preventDefault();
          item.onClick();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuItems]);
}
