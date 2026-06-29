import React, { useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import useTabStore from "@/core/store/useTabStore";
import { useTabScroll } from "@/core/hooks/useTabScroll";
import NovoItemModal from "@/components/modals/NovoItemModal";
import { SortableTab } from "./includes/tabbarComponents/SortableTab";

/**
 * TabBar
 * Barra de abas horizontal (estilo navegador) com Drag and Drop.
 */
export default function TabBar() {
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const closeTab = useTabStore((state) => state.closeTab);
  const addBlankTab = useTabStore((state) => state.addBlankTab);
  const isTabDirty = useTabStore((state) => state.isTabDirty);
  const reorderTabs = useTabStore((state) => state.reorderTabs);

  const {
    navRef,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollLeft,
    scrollRight,
  } = useTabScroll();

  const showScrollButtons = canScrollLeft || canScrollRight;

  // Configuração de sensores para Dnd
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Previne que cliques simples sejam interpretados como drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Verifica scroll quando tabs mudam
  useEffect(() => {
    checkScroll();
  }, [tabs, checkScroll]);

  // Auto-scroll para aba ativa quando muda
  useEffect(() => {
    if (navRef.current && activeTabId) {
      const activeTabElement = navRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`,
      ) as HTMLElement;
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTabId, navRef]);

  // Handle horizontal scroll with mouse wheel (non-passive)
  useEffect(() => {
    const el = navRef.current;
    if (el) {
      const handleWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      };
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }
  }, [navRef, tabs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id);
      const newIndex = tabs.findIndex((t) => t.id === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  const handleCloseTab = (e: React.MouseEvent | React.PointerEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "text-green-400",
      POST: "text-yellow-400",
      PUT: "text-blue-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method?.toUpperCase()] || "text-gray-400";
  };

  const handleAddTab = (name?: string) => {
    addBlankTab(name);
  };

  if (tabs.length === 0) {
    return
    // return (
    //   <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-center">
    //     <NovoItemModal onAdd={handleAddTab}>
    //       <button className="flex items-center gap-2 px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded transition-colors">
    //         <Plus size={16} />
    //         <span className="text-sm">Nova Aba</span>
    //       </button>
    //     </NovoItemModal>
    //   </div>
    // );
  }

  return (
    <div className="w-full bg-zinc-800 border-b border-zinc-700 flex items-center overflow-x-hidden">
      {/* Botão Scroll Esquerda */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="h-full px-2 hover:bg-zinc-700 transition-colors border-r border-zinc-700 shrink-0 z-10"
          title="Rolar para esquerda"
        >
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
      )}

      {/* Abas com Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={navRef as React.RefObject<HTMLDivElement>}
          onScroll={checkScroll}
          className="flex-1 h-full flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent min-w-0"
          style={{ scrollbarWidth: "none" }}
        >
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                isDirty={isTabDirty}
                onActivate={setActiveTab}
                onClose={handleCloseTab}
                getMethodColor={getMethodColor}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Botão Scroll Direita */}
      {showScrollButtons && canScrollRight && (
        <button
          onClick={scrollRight}
          className="h-full px-2 hover:bg-zinc-700 transition-colors border-l border-zinc-700 shrink-0 z-10"
          title="Rolar para direita"
        >
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      )}

      {/* Botão Nova Aba */}
      {/* <NovoItemModal onAdd={handleAddTab}>
        <button
          className="px-3 py-2 hover:bg-zinc-700 transition-colors shrink-0"
          title="Nova aba"
        >
          <Plus size={18} className="text-gray-400" />
        </button>
      </NovoItemModal> */}
    </div>
  );
}
