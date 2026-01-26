import React, { useState, useMemo } from "react";
import ContextMenu from "../ContextMenu";
import {
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Folder,
  Trash2,
  MoreVertical,
  Plus,
  Edit,
} from "lucide-react";
import useTabStore from "../../store/useTabStore";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import useDialogStore from "../../store/useDialogStore";

export const TreeFolder = React.memo(({ item, level = 0, setModalConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ações do store
  const addTab = useTabStore((state) => state.addTab);
  const deleteItem = useTabStore((state) => state.deleteItem);
  const showDialog = useDialogStore((state) => state.showDialog);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: item.type,
      id: item.id,
    },
  });

  const isFolder = item.type === "folder";

  // Droppable behavior for folders
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${item.id}`,
    disabled: !isFolder,
    data: {
      type: "folder",
      id: item.id,
    },
  });

  // Combine refs
  const setNodeRef = (node) => {
    setSortableRef(node);
    if (isFolder) setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      addTab(item.id, item);
    }
  };

  const handleDelete = React.useCallback(
    async (e) => {
      e.stopPropagation();
      const typeLabel = isFolder ? "a pasta (e tudo dentro dela)" : "a rota";
      const confirmed = await showDialog({
        title: "Deletar item",
        description: `Deseja realmente deletar ${typeLabel} "${item.name}"?`,
        options: [
          { label: "Cancelar", value: false, variant: "secondary" },
          { label: "Confirmar", value: true, variant: "danger" },
        ],
      });
      if (confirmed) {
        deleteItem(item.id);
      }
    },
    [isFolder, item.name, item.id, showDialog, deleteItem],
  );

  const getMethodColor = (method) => {
    const colors = {
      GET: "text-green-400",
      POST: "text-yellow-400",
      PUT: "text-blue-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method?.toUpperCase()] || "text-gray-400";
  };

  const contextMenuItems = useMemo(() => {
    const items = [];
    if (isFolder) {
      items.push(
        {
          label: "Nova Pasta",
          icon: <FolderPlus size={14} />,
          onClick: () => {
            setModalConfig({
              open: true,
              type: "folder",
              targetId: item.id,
            });
            setIsOpen(true);
          },
        },
        {
          label: "Nova Rota",
          icon: <FilePlus size={14} />,
          onClick: () => {
            setModalConfig({
              open: true,
              type: "file",
              targetId: item.id,
            });
            setIsOpen(true);
          },
        },
        { separator: true },
      );
    }

    items.push(
      {
        label: "Renomear",
        icon: <Edit size={14} />,
        onClick: () =>
          setModalConfig({ open: true, type: "rename", targetId: item.id }),
      },
      {
        label: "Excluir",
        icon: <Trash2 size={14} />,
        className: "text-red-500 hover:bg-red-500/10",
        onClick: (e) => handleDelete(e),
      },
    );
    return items;
  }, [isFolder, item.id, setModalConfig, setIsOpen, handleDelete]);

  return (
    <div className="select-none">
      {/* Item Row */}
      <ContextMenu items={contextMenuItems}>
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className={`flex items-center gap-1 py-1 rounded cursor-pointer transition-colors group
            ${isDragging ? "opacity-30 bg-zinc-800" : "hover:bg-zinc-800"}
            ${isOver && isFolder ? "bg-yellow-500/10 ring-1 ring-yellow-500/30" : ""}`}
          style={{ ...style, paddingLeft: `${level * 12 + 8}px` }}
          onClick={handleItemClick}
        >
          {/* Expander / Icon */}
          {isFolder ? (
            <div
              className={`flex items-center gap-1 min-w-[20px] rounded px-1 transition-colors`}
            >
              {isOpen ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
              <Folder
                size={16}
                className={`${isOpen ? "text-yellow-500" : "text-yellow-600/80"}`}
              />
            </div>
          ) : (
            <div className="w-px" /> // Alinhamento para rotas que não tem collapse
          )}

          {/* Conteúdo */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {!isFolder && (
              <span
                className={`text-[0.65rem]! font-bold ${getMethodColor(
                  item.request?.method,
                )} min-w-[35px]`}
              >
                {item.request?.method || "GET"}
              </span>
            )}
            <span
              className={`truncate text-[0.8rem]! ${
                isFolder ? "text-gray-300 font-medium" : "text-gray-400"
              }`}
            >
              {item.name}
            </span>
          </div>

          {/* Ações (Hover) */}
          <div className="pe-1 opacity-0 hidden group-hover:block! group-hover:opacity-100! flex items-center gap-1 transition-opacity">
            {isFolder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalConfig({
                      open: true,
                      type: "folder",
                      targetId: item.id,
                    });
                    setIsOpen(true);
                  }}
                  className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white"
                  title="Nova Pasta"
                >
                  <FolderPlus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalConfig({
                      open: true,
                      type: "file",
                      targetId: item.id,
                    });
                    setIsOpen(true);
                  }}
                  className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white"
                  title="Nova Rota"
                >
                  <FilePlus size={14} />
                </button>
              </>
            )}
            <button
              className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white"
              title="Editar"
              onClick={(e) => {
                e.stopPropagation();
                setModalConfig({
                  open: true,
                  type: "rename",
                  targetId: item.id,
                });
              }}
            >
              <Edit size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400"
              title="Deletar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </ContextMenu>

      {/* Sub-itens */}
      {isFolder && isOpen && item.items && (
        <div className="mt-0.5">
          {item.items.length === 0 ? (
            <ContextMenu items={contextMenuItems}>
              <div
                className="text-[0.7rem] text-gray-600 italic py-1"
                style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
              >
                Pasta vazia
              </div>
            </ContextMenu>
          ) : (
            <SortableContext
              items={item.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {item.items.map((child) => (
                <TreeFolder
                  key={child.id}
                  item={child}
                  level={level + 1}
                  setModalConfig={setModalConfig}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
});
