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
  const collectionDesc = useTabStore((state) => state.collection.description);
  const updateCollectionMeta = useTabStore(
    (state) => state.updateCollectionMeta,
  );
  const { handleSaveCollection } = useHistory(false);
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(collectionName);
  const [tempDesc, setTempDesc] = useState(collectionDesc);

  // Ambientes
  const environments = useTabStore(
    (state) => state.collection.environments || [],
  );
  const addEnvironment = useTabStore((state) => state.addEnvironment);
  const updateEnvironments = useTabStore((state) => state.updateEnvironments);

  const setEnvInfoOpen = useModalStore((state) => state.setEnvInfoOpen);

  // Sincroniza estado local quando a coleção muda (ex: carregamento do histórico)
  React.useEffect(() => {
    if (!isEditingName) setTempName(collectionName || "");
    if (!isEditingName) setTempDesc(collectionDesc || "");
  }, [collectionName, collectionDesc, isEditingName]);

  const handleSaveCollectionMeta = (name, desc) => {
    updateCollectionMeta(name, desc);
    setIsEditingName(false);
  };

  const handleUpdateEnv = (index, field, value) => {
    const newEnvs = [...environments];
    newEnvs[index] = { ...newEnvs[index], [field]: value };
    updateEnvironments(newEnvs);
  };

  const handleDeleteEnv = (index) => {
    const newEnvs = environments.filter((_, i) => i !== index);
    updateEnvironments(newEnvs);
  };

  const [isEnvOpen, setIsEnvOpen] = useState(false);

  return (
    <div>
      <div className="p-2 justify-between items-center flex">
        <button
          className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700 text-zinc-300 text-[0.75rem]! font-semibold transition-colors"
          onClick={async () => {
            // Salva antes de voltar
            await handleSaveCollection();
            navigate("/upload");
          }}
        >
          <div>
            <ArrowLeft size={20} />
          </div>
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
                const collectionData = useTabStore
                  .getState()
                  .getCollectionForExport();
                window.electronAPI.saveFile({ content: collectionData });
              },
            },
            {
              separator: true,
            },
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

      {/* Header da Coleção */}
      <div className="p-3 pt-0 border-b border-zinc-700">
        <div className="flex items-center justify-between gap-2">
          {/* Nome da Coleção */}
          <h2
            className="text-lg! font-bold text-white flex-1 mb-0 cursor-pointer hover:text-yellow-500 transition-colors"
            onClick={() => setIsEditingName(true)}
          >
            {collectionName || "Collection"}
          </h2>
        </div>

        {/* Descrição Simplificada (Somente leitura se não estiver editando nome) */}
        <p className="text-[0.7rem]! text-gray-500 mt-1 mb-0 truncate opacity-80">
          {collectionDesc || "Nenhuma descrição"}
        </p>
      </div>

      {/* Variaveis ambientes */}
      <div className="px-2 py-2 border-b border-zinc-700">
        <details
          className="group"
          onToggle={(e) => setIsEnvOpen(e.currentTarget.open)}
        >
          <summary className="flex! items-center justify-between! cursor-pointer list-none text-zinc-400 hover:text-zinc-200 transition-colors">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider">
              <Info
                size={14}
                className="hover:text-blue-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEnvInfoOpen(true);
                }}
              />
              Variáveis de Ambiente
            </div>
            <div className="flex items-center gap-2">
              <Plus
                // disabled={!isEnvOpen}
                size={14}
                className={
                  !isEnvOpen
                    ? "opacity-50"
                    : "hover:text-yellow-500 transition-colors"
                }
                onClick={(e) => {
                  if (isEnvOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    addEnvironment();
                  }
                }}
              />
              <ChevronDown
                size={14}
                className="group-open:rotate-180 transition-transform"
              />
            </div>
          </summary>
          <div className="mt-2 px-0 space-y-1">
            {environments.length === 0 ? (
              <span className="text-[0.65rem] text-zinc-500 italic ps-1">
                Nenhum ambiente configurado
              </span>
            ) : (
              environments.map((env, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 group/env px-1"
                >
                  <input
                    type="text"
                    placeholder="Chave"
                    value={env.name}
                    onChange={(e) =>
                      handleUpdateEnv(index, "name", e.target.value)
                    }
                    className="w-1/2 bg-zinc-800  rounded px-1 py-0.5 text-[0.6rem] text-zinc-300 outline-none focus:border-yellow-600/50"
                  />
                  <input
                    type="password"
                    placeholder="Valor"
                    value={env.value}
                    onChange={(e) =>
                      handleUpdateEnv(index, "value", e.target.value)
                    }
                    className="
                      w-1/2 px-1 py-0.5
                      bg-zinc-800 
                      rounded 
                      text-[0.6rem] text-zinc-300 
                      outline-none focus:border-yellow-600/50
                    "
                  />
                  <button
                    onClick={() => handleDeleteEnv(index)}
                    className="
                      hidden group-hover/env:block!
                      text-zinc-500 hover:text-red-500
                      transition-all
                      ms-1
                    "
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </details>
      </div>

      <EditCollectionModal
        openExternal={isEditingName}
        setExternalOpen={setIsEditingName}
        func={handleSaveCollectionMeta}
        externalName={tempName}
        externalDesc={tempDesc}
      />
      <EnvInfoModal />
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
