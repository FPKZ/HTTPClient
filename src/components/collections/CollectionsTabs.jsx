import React from "react";
import { Nav, Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * CollectionsTabs
 * Gerencia a lista de abas superiores com navegação por scroll.
 */
export default function CollectionsTabs({
  rota,
  activeKey,
  onSelect,
  scrollRef,
  onScroll,
  canScrollLeft,
  canScrollRight,
  scrollLeft,
  scrollRight,
}) {
  return (
    <div className="d-flex align-items-end position-relative">
      {canScrollLeft && (
        <Button
          variant="link"
          onClick={scrollLeft}
          className="h-100 text-white bg-[#1e1e1ede]! rounded-0 px-1 z-10 position-absolute left-0"
        >
          <ChevronLeft size={20} />
        </Button>
      )}

      <div className="flex-grow-1 overflow-hidden">
        <Nav
          ref={scrollRef}
          onScroll={onScroll}
          className="border-none pl-1 flex-nowrap overflow-x-auto whitespace-nowrap"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {rota.map(([key, data]) => {
            const isActive = activeKey === key;
            const method = data?.request?.method || "GET";
            
            // Definição de cores baseadas no método
            const methodColors = {
              GET: "text-green-500",
              POST: "text-blue-500",
              PUT: "text-yellow-500",
              PATCH: "text-orange-500",
              DELETE: "text-red-500",
            };
            const colorClass = methodColors[method] || "text-gray-400";

            return (
              <Nav.Item key={key}>
                <Nav.Link
                  eventKey={key}
                  className={`px-3 py-1 mr-1 font-bold tracking-wide uppercase rounded-t-lg transition-colors border-0 cursor-pointer no-underline! d-flex align-items-center gap-2 ${
                    isActive
                      ? "bg-zinc-800! text-yellow-500!"
                      : "bg-transparent! text-gray-500! hover:text-gray-300!"
                  }`}
                  onClick={() => onSelect(key)}
                >
                  <span className={`${colorClass} font-black`} style={{ fontSize: "0.6rem", minWidth: "35px" }}>
                    {method}
                  </span>
                  <small style={{ fontSize: "0.7rem", maxWidth: "200px" }} className="text-truncate">
                    {key.replace(/^\[.*?\]\s*/, "")}
                  </small>
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>

      {canScrollRight && (
        <Button
          variant="link"
          onClick={scrollRight}
          className="h-100 text-white bg-[#1e1e1ede]! rounded-0 px-1 z-10 position-absolute right-0"
        >
          <ChevronRight size={20} />
        </Button>
      )}
    </div>
  );
}
