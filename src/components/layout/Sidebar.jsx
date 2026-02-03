import React, { useState } from "react";
import {
  Plus,
  Trash2,
  FolderPlus,
  FilePlus,
  ArrowLeft,
  MoreVertical,
  Edit2,
  Download,
  Settings,
  ChevronDown,
  Info,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TreeFolder } from "./TreeFolder";
import { useNavigate } from "react-router-dom";
import NovoItemModal from "../modals/NovoItemModal";
import { useHistory } from "../../hooks/useHistory";
import ContextMenu from "../ContextMenu";
import DropdownMenuComponent from "../DropdownMenu";
import EditCollectionModal from "../modals/EditCollectionModal";
import EnvInfoModal from "../modals/EnvInfoModal";
import EnvManagerModal from "../modals/EnvManagerModal";

//hooks
import useTabStore from "../../store/useTabStore";
import useMenuContext from "../../hooks/useMenuContext";
import useModalConfig from "../../hooks/useModalConfig";
import useModalStore from "../../store/useModalStore";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";


/**
 * SidebarHeader
 */
const SidebarHeader = () => {
  const collectionName = useTabStore((state) => state.collection.name);
  const collectionDesc = useTabStore((state) => state.collection.description);
  const updateCollectionMeta = useTabStore(
    (state) => state.updateCollectionMeta,
  );
  const { handleSaveCollection } = useHistory(false);
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(collectionName);
  const [tempDesc, setTempDesc] = useState(collectionDesc);

  const environments = useTabStore(
    (state) => state.collection.environments || [],
  );
  const activeEnvironmentId = useTabStore(
    (state) => state.collection.activeEnvironmentId,
  );
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);

  React.useEffect(() => {
    if (!isEditingName) setTempName(collectionName || "");
    if (!isEditingName) setTempDesc(collectionDesc || "");
  }, [collectionName, collectionDesc, isEditingName]);

  const handleSaveCollectionMeta = (name, desc) => {
    updateCollectionMeta(name, desc);
    setIsEditingName(false);
  };

  return (
    <div>
      <div className="p-2 justify-between items-center flex">
        <button
          className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700 text-zinc-300 text-[0.75rem]! font-semibold transition-colors"
          onClick={async () => {
            await handleSaveCollection();
            navigate("/upload");
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <DropdownMenuComponent
          buttonContent={<MoreVertical size={20} />}
          items={[
            {
              icon: <Edit2 size={14} />,
              label: "Editar Coleção",
              onClick: () => setIsEditingName(true),
            },
            {
              icon: <Download size={14} />,
              label: "Exportar Coleção",
              onClick: () => {
                const collectionData = useTabStore.getState().getCollectionForExport();
                window.electronAPI.saveFile({ content: collectionData });
              },
            },
            { separator: true },
            {
              icon: <Trash2 size={14} />,
              label: "Fechar Coleção",
              className: "text-red-500 hover:bg-red-500/10",
              shortcut: "Ctrl+Q",
              onClick: () => navigate("/upload"),
            },
          ]}
        />
      </div>

      <div className="p-3 pt-0 border-b border-zinc-700">
        <h2
          className="text-lg! font-bold text-white flex-1 mb-0 cursor-pointer hover:text-yellow-500 transition-colors"
          onClick={() => setIsEditingName(true)}
        >
          {collectionName || "Collection"}
        </h2>
        <p className="text-[0.7rem]! text-gray-500 mt-1 mb-0 truncate opacity-80">
          {collectionDesc || "Nenhuma descrição"}
        </p>
      </div>

      <div className="px-2 py-2 border-b border-zinc-700 flex items-center justify-between group/env">
        <div className="flex items-center gap-2 overflow-hidden">
          <Settings 
            size={14} 
            className="text-zinc-500 group-hover/env:text-yellow-500 transition-colors cursor-pointer" 
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-[0.6rem] text-zinc-500 font-bold uppercase tracking-wider">Ambiente</span>
            <span className="text-[0.75rem] text-zinc-300 font-medium truncate">
              {activeEnv?.name || "Nenhum"}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsEnvManagerOpen(true)}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-[0.65rem]! font-bold text-yellow-500 transition-colors opacity-0 group-hover/env:opacity-100! uppercase"
        >
          Gerenciar
        </button>
      </div>

      <EditCollectionModal
        openExternal={isEditingName}
        setExternalOpen={setIsEditingName}
        func={handleSaveCollectionMeta}
        externalName={tempName}
        externalDesc={tempDesc}
      />
      <EnvManagerModal 
        open={isEnvManagerOpen} 
        onOpenChange={setIsEnvManagerOpen} 
      />
    </div>
  );
};

/**
 * SidebarTree
 * Gerencia a lista de arquivos.
 */
const SidebarTree = React.memo(() => {
  // Select only items to avoid re-render on name/desc change
  const collectionItems = useTabStore((state) => state.collection.items);
  const addRoute = useTabStore((state) => state.addRoute);
  const addFolder = useTabStore((state) => state.addFolder);
  const renameItem = useTabStore((state) => state.renameItem);
  const deleteItem = useTabStore((state) => state.deleteItem);
  const reorderItems = useTabStore((state) => state.reorderItems);
  const isDraggingDisabled = useTabStore((state) => state.isDraggingDisabled);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeSensors = isDraggingDisabled ? [] : sensors;

  // Reconstruct simple object for internal use if needed, but iterating items directly is better
  const collection = { items: collectionItems };

  const handleAddRoute = (name) => {
    addRoute(null, name);
  };

  const handleAddFolder = (name) => {
    addFolder(null, name);
  };

  // Centraliza o listener do menu de contexto aqui na Sidebar (pai da árvore)
  // Isso evita que componentes recursivos (TreeFolder) criem múltiplos listeners

  const { modalConfig, setModalConfig, handleModalAdd, getModalProps } =
    useModalConfig({
      addFolder,
      addRoute,
      renameItem,
      deleteItem,
      reorderItems,
    });

  // const { handleDragEnd, handleContextMenu } = useMenuContext({
  const { handleDragEnd } = useMenuContext({
    modalConfig,
    setModalConfig,
    deleteItem,
    reorderItems,
  });

  const rootContextMenuItems = React.useMemo(
    () => [
      {
        label: "Nova Pasta",
        icon: <FolderPlus size={14} />,
        onClick: () =>
          setModalConfig({ open: true, type: "folder", targetId: null }),
      },
      {
        label: "Nova Rota",
        icon: <FilePlus size={14} />,
        onClick: () =>
          setModalConfig({ open: true, type: "file", targetId: null }),
      },
    ],
    [setModalConfig],
  );

  return (
    <ContextMenu items={rootContextMenuItems}>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2 h-full">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Coleção
            </span>
            <div>
              <NovoItemModal onAdd={handleAddFolder}>
                <button
                  className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white"
                  title="Nova Pasta"
                >
                  <FolderPlus size={14} />
                </button>
              </NovoItemModal>
              <NovoItemModal onAdd={handleAddRoute}>
                <button
                  className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white"
                  title="Nova Rota"
                >
                  <FilePlus size={14} />
                </button>
              </NovoItemModal>
            </div>
          </div>

          {collection.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Coleção vazia
            </div>
          ) : (
            <DndContext
              sensors={activeSensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={collection.items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {collection.items.map((item) => (
                  <TreeFolder
                    key={item.id}
                    item={item}
                    setModalConfig={setModalConfig}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Modal controlado via menu de contexto */}
        <NovoItemModal
          {...getModalProps()}
          open={modalConfig.open}
          onOpenChange={(open) => setModalConfig({ ...modalConfig, open })}
          onAdd={handleModalAdd}
        />
      </div>
    </ContextMenu>
  );
});

/**
 * Sidebar Main Component
 */
export default function Sidebar() {
  return (
    <div className="bg-zinc-900 border-r border-zinc-700 flex flex-col h-full">
      <SidebarHeader />
      <SidebarTree />
    </div>
  );
}
