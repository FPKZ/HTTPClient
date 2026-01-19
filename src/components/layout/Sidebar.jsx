import React, { useState } from "react";
import { Plus, Trash2, FolderPlus, FilePlus, ArrowLeft } from "lucide-react";
import { TreeFolder } from "./TreeFolder";
import { useNavigate } from "react-router-dom";
import NovoItemModal from "../modals/NovoItemModal";
import { useHistory } from "../../hooks/useHistory";

//hooks
import useTabStore from "../../store/useTabStore";
import useMenuContext from "../../hooks/useMenuContext";
import useModalConfig from "../../hooks/useModalConfig";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  // arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

/**
 * SidebarHeader
 * Gerencia apenas a parte superior (navegação, nome e descrição).
 * Isola o estado de edição para evitar re-render da árvore de arquivos ao digitar.
 */
const SidebarHeader = () => {
  const collectionName = useTabStore((state) => state.collection.name);
  const collectionDesc = useTabStore((state) => state.collection.descricao);
  const updateCollectionMeta = useTabStore(
    (state) => state.updateCollectionMeta,
  );
  const { handleSaveCollection } = useHistory(false);
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempName, setTempName] = useState(collectionName);
  const [tempDesc, setTempDesc] = useState(collectionDesc);

  // Sincroniza estado local quando a coleção muda (ex: carregamento do histórico)
  // Mas apenas se não estiver editando, para evitar sobrescrever digitação
  // Sincroniza estado local quando a coleção muda (ex: carregamento do histórico)
  // Mas apenas se não estiver editando, para evitar sobrescrever digitação
  React.useEffect(() => {
    if (!isEditingName) setTempName(collectionName || "");
    if (!isEditingDesc) setTempDesc(collectionDesc || "");
  }, [collectionName, collectionDesc, isEditingName, isEditingDesc]);

  const handleSaveName = () => {
    updateCollectionMeta(tempName, undefined);
    setIsEditingName(false);
  };

  const handleSaveDesc = () => {
    updateCollectionMeta(undefined, tempDesc);
    setIsEditingDesc(false);
  };

  return (
    <div>
      <div className="p-2">
        <button
          className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700 text-zinc-300 text-[0.75rem]! font-semibold transition-colors"
          onClick={async () => {
            // Salva antes de voltar
            await handleSaveCollection();
            navigate(-1);
          }}
        >
          <div>
            <ArrowLeft size={20} />
          </div>
          Voltar
        </button>
      </div>

      {/* Header da Coleção */}
      <div className="p-3 pt-0 border-b border-zinc-700">
        {/* Nome da Coleção */}
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="w-full bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500"
            autoFocus
          />
        ) : (
          <h2
            className="!text-lg font-bold text-white cursor-pointer hover:text-yellow-500 transition-colors"
            onClick={() => {
              setTempName(collectionName);
              setIsEditingName(true);
            }}
          >
            {collectionName || "Collection"}
          </h2>
        )}

        {/* Descrição da Coleção */}
        {isEditingDesc ? (
          <textarea
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={handleSaveDesc}
            className="w-full mt-2 bg-zinc-800 text-gray-400 text-sm px-2 py-1 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500 resize-none"
            rows={2}
            autoFocus
          />
        ) : (
          <p
            className="text-sm text-gray-400 mt-1 cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => {
              setTempDesc(collectionDesc);
              setIsEditingDesc(true);
            }}
          >
            {collectionDesc || "Clique para adicionar descrição"}
          </p>
        )}
      </div>
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

  const { handleDragEnd, handleContextMenu } = useMenuContext({
    modalConfig,
    setModalConfig,
    deleteItem,
    reorderItems,
  });

  return (
    <div
      className="flex-1 overflow-y-auto min-h-0"
      onContextMenu={handleContextMenu}
    >
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
