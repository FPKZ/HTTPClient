import React, { useState, useMemo } from "react";
import ContextMenu from "@/components/ContextMenu";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Folder,
  Trash2,
  Edit,
  Copy,
  ClipboardPaste,
  FolderOpen,
} from "lucide-react";
import useTabStore from "@/core/store/useTabStore";
import useCollectionStore from "@/core/store/useCollectionStore";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import useDialogStore from "@/core/store/useDialogStore";
import { CollectionItem } from "@/core/store/index";
import useModalConfig from "@/core/hooks/useModalConfig";

interface TreeActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  icon: React.ReactNode;
  variant?: "default" | "danger";
}

const TreeActionButton = ({
  onClick,
  title,
  icon,
  variant = "default",
}: TreeActionButtonProps) => {
  const baseClass = "p-1 rounded transition-colors duration-150 flex items-center justify-center shrink-0 cursor-pointer";
  const variantClass =
    variant === "danger"
      ? "hover:bg-red-500/20 text-gray-500 hover:text-red-400"
      : "hover:bg-zinc-700 text-gray-400 hover:text-white";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`${baseClass} ${variantClass}`}
      title={title}
    >
      {icon}
    </button>
  );
};

interface TreeFolderProps {
  item: CollectionItem;
  level?: number;
}

export const TreeFolder = React.memo(({ item, level = 0 }: TreeFolderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setModalConfig } = useModalConfig();

  // Ações do store
  const addTab = useTabStore((state) => state.addTab);
  const deleteItem = useCollectionStore((state) => state.deleteItem);
  const showDialog = useDialogStore((state) => state.showDialog);
  const copyRoute = useCollectionStore((state) => state.copyRoute);
  const pasteRoute = useCollectionStore((state) => state.pasteRoute);
  const duplicateRoute = useCollectionStore((state) => state.duplicateRoute);
  const clipboard = useCollectionStore((state) => state.clipboard);

  // Selector reativo para verificar se o item está modificado
  const isDirty = useTabStore(
    (state) =>
      item.type !== "folder" &&
      state.tabs.some((tab: any) => tab.screenKey === item.id && tab.isDirty),
  );

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
    isOver: isSortableOver,
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
  // Combine refs condicionais baseadas no isOpen para a linha do item
  const setItemRowRef = (node: HTMLElement | null) => {
    setSortableRef(node);
    if (isFolder && !isOpen) {
      setDroppableRef(node);
    }
  };

  const isDraggingOver = isOver || isSortableOver;

  // Auto-expandir pasta no drag over (quando pairar por 600ms sobre a pasta fechada)
  React.useEffect(() => {
    if (!isFolder || isOpen || !isDraggingOver) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [isDraggingOver, isFolder, isOpen]);

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      addTab(item.id, item);
    }
  };

  const handleDelete = React.useCallback(
    async (e: React.MouseEvent) => {
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

  const getMethodColor = (method: string, protocol?: string) => {
    if (protocol === "websocket") return "text-purple-400";
    if (protocol === "sse") return "text-emerald-400";
    const colors: Record<string, string> = {
      GET: "text-green-400",
      POST: "text-yellow-400",
      PUT: "text-blue-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method?.toUpperCase()] || "text-gray-400";
  };

  const contextMenuItems = useMemo(() => {
    const items: any[] = [];
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
          subMenu: [
            {
              label: "HTTP Request",
              icon: <FilePlus size={14} />,
              onClick: () => {
                setModalConfig({
                  open: true,
                  type: "route:http",
                  targetId: item.id,
                });
                setIsOpen(true);
              },
            },
            {
              label: "SSE Connection",
              icon: <FilePlus size={14} className="text-emerald-500" />,
              onClick: () => {
                setModalConfig({
                  open: true,
                  type: "route:sse",
                  targetId: item.id,
                });
                setIsOpen(true);
              },
            },
            {
              label: "WebSocket Connection",
              icon: <FilePlus size={14} className="text-violet-500" />,
              onClick: () => {
                setModalConfig({
                  open: true,
                  type: "route:websocket",
                  targetId: item.id,
                });
                setIsOpen(true);
              },
            },
          ],
        },
      );
    }

    items.push(
      {
        label: "Copiar",
        icon: <Copy size={14} />,
        onClick: () => {
          copyRoute(item.id);
        },
      },
      {
        label: "Colar",
        icon: <ClipboardPaste size={14} />,
        onClick: () => {
          pasteRoute(item.id);
        },
        disabled: !clipboard,
      },
      {
        label: "Duplicar",
        icon: <Copy size={14} />,
        onClick: () => {
          duplicateRoute(item.id);
        },
      },
      {
        label: "Renomear",
        icon: <Edit size={14} />,
        onClick: () =>
          setModalConfig({
            open: true,
            type: "rename",
            targetId: item.id,
            currentName: item.name,
          }),
      },
      { separator: true },
      {
        label: "Excluir",
        icon: <Trash2 size={14} />,
        className: "text-red-500 hover:bg-red-500/10",
        onClick: (e: React.MouseEvent) => handleDelete(e),
      },
    );
    return items;
  }, [
    isFolder,
    setModalConfig,
    item.id,
    item.name,
    handleDelete,
    copyRoute,
    pasteRoute,
    duplicateRoute,
    clipboard,
  ]);

  return (
    <div className="select-none">
      {/* Item Row */}
      <ContextMenu items={contextMenuItems}>
        <div
          id={item.id}
          ref={setItemRowRef}
          {...attributes}
          {...listeners}
          className={`flex items-center gap-1 py-1.5 my-0.5 min-h-[1.85rem] rounded cursor-pointer transition-colors group
            ${isDragging ? "opacity-30 bg-zinc-800" : "hover:bg-zinc-800"}
            ${isOver && isFolder ? "bg-yellow-500/10 ring-1 ring-yellow-500/30" : ""}`}
          style={{ ...style, paddingLeft: `${level * 12 + 8}px` } as React.CSSProperties}
          onClick={handleItemClick}
        >
          {/* Expander / Icon */}
          {isFolder ? (
            <div
              className={`flex items-center gap-1 min-w-5 rounded px-1 transition-colors`}
            >
              {isOpen ? (
                <>
                <ChevronDown size={14} className="text-gray-500" />
                <FolderOpen
                  size={16}
                  className={`${isOpen ? "text-yellow-500" : "text-yellow-600/80"}`}
                />
                </>
              ) : (
                <>
                <ChevronRight size={14} className="text-gray-500" />
                <Folder
                  size={16}
                  className={`${isOpen ? "text-yellow-500" : "text-yellow-600/80"}`}
                />
                </>
              )}
              
            </div>
          ) : (
            <div className="w-px" /> // Alinhamento para rotas que não tem collapse
          )}

          {/* Conteúdo */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {!isFolder && (
              <span
                className={`text-[0.65rem]! font-bold ${getMethodColor(item.method, item.protocol)} min-w-8.75`}
              >
                {item.protocol === "websocket" ? "WS" : (item.protocol === "sse" ? "SSE" : item.method)}
              </span>
            )}
            <span
              className={`truncate text-[0.8rem]! whitespace-nowrap transition-all duration-200 ${
                isFolder ? "text-gray-300 font-medium" : "text-gray-400"
              }`}
            >
              {item.name}
            </span>
            {/* Indicador de Modificação */}
            {!isFolder && isDirty && (
              <div
                className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-auto mr-1 shrink-0"
                title="Não salvo"
              />
            )}
          </div>

          {/* Ações (Hover) */}
          <div className={`pe-1 p-0 m-0 ml-auto shrink-0 transition-all duration-150
            ${isDropdownOpen 
              ? "flex items-center gap-0.5 opacity-100 pointer-events-auto" 
              : "hidden group-hover:flex items-center gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"}`}>
            {isFolder && (
              <>
                <TreeActionButton
                  onClick={() => {
                    setModalConfig({
                      open: true,
                      type: "folder",
                      targetId: item.id,
                    });
                    setIsOpen(true);
                  }}
                  title="Nova Pasta"
                  icon={<FolderPlus size={14} />}
                />
                <Dropdown.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <Dropdown.Trigger asChild>
                    <button
                      className="p-1 rounded hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors duration-150 flex items-center justify-center shrink-0 cursor-pointer"
                      title="Nova Rota"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FilePlus size={14} />
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Portal>
                    <Dropdown.Content
                      sideOffset={5}
                      align="end"
                      className="min-w-[170px] bg-zinc-900 border border-zinc-800 p-1 rounded shadow-2xl z-50! animate-in fade-in zoom-in-95 duration-100"
                    >
                      <Dropdown.Item
                        onSelect={() => {
                          setModalConfig({ open: true, type: "route:http", targetId: item.id });
                          setIsOpen(true);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 hover:text-white rounded"
                      >
                        <FilePlus size={13} />
                        HTTP Request
                      </Dropdown.Item>
                      <Dropdown.Item
                        onSelect={() => {
                          setModalConfig({ open: true, type: "route:sse", targetId: item.id });
                          setIsOpen(true);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 hover:text-white rounded"
                      >
                        <FilePlus size={13} className="text-emerald-500" />
                        SSE Connection
                      </Dropdown.Item>
                      <Dropdown.Item
                        onSelect={() => {
                          setModalConfig({ open: true, type: "route:websocket", targetId: item.id });
                          setIsOpen(true);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 hover:text-white rounded"
                      >
                        <FilePlus size={13} className="text-violet-500" />
                        WebSocket Connection
                      </Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown.Portal>
                </Dropdown.Root>
              </>
            )}
            <TreeActionButton
              onClick={() => {
                setModalConfig({
                  open: true,
                  type: "rename",
                  targetId: item.id,
                  currentName: item.name,
                });
              }}
              title="Editar"
              icon={<Edit size={14} />}
            />
            <TreeActionButton
              onClick={handleDelete}
              title="Deletar"
              icon={<Trash2 size={14} />}
              variant="danger"
            />
          </div>
        </div>
      </ContextMenu>

      {/* Sub-itens */}
      {isFolder && isOpen && item.items && (
        <div ref={isFolder ? setDroppableRef : undefined} className="mt-0.5">
          {item.items.length === 0 ? (
            <ContextMenu items={contextMenuItems}>
              <div
                className="text-[0.7rem] text-gray-600 italic py-1"
                style={{ paddingLeft: `${(level + 1) * 12 + 24}px` } as React.CSSProperties}
              >
                Pasta vazia
              </div>
            </ContextMenu>
          ) : (
            <SortableContext
              items={item.items.map((i: any) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {item.items.map((child: any) => (
                <TreeFolder
                  key={child.id}
                  item={child}
                  level={level + 1}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
});
