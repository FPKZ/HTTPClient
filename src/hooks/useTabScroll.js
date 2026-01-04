import { useState, useRef, useEffect, useCallback } from "react";

/**
 * useTabScroll
 * Gerencia a lógica de scroll horizontal para listas de abas.
 * SRP: Cuida apenas da interação de UI de scroll.
 */
export function useTabScroll() {
  const navRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollWidth - (scrollLeft + clientWidth) > 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scrollLeft = () => {
    navRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    navRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return {
    navRef,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollLeft,
    scrollRight,
  };
}
