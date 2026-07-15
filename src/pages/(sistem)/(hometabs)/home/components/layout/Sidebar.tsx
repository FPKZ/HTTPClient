import React, { useState } from "react";
import {
  FolderPlus,
  FilePlus,
  Settings,
  Folder,
} from "lucide-react";
import { TreeFolder } from "./includes/sidebarComponents/TreeFolder";
import { useNavigate } from "react-router-dom";
import { useHistory } from "@/core/hooks/useHistory";
import ContextMenu from "@/components/ContextMenu";
import EditCollectionModal from "@/components/modals/EditCollectionModal";
// import EnvInfoModal from "@/components/modals/EnvInfoModal";
import EnvManagerModal from "@/components/modals/EnvManagerModal";

//hooks
import useCollectionStore from "@/core/store/useCollectionStore";
import useMenuContext from "@/core/hooks/useMenuContext";
import useDialogStore from "@/core/store/useDialogStore";
import useModalConfig from "@/core/hooks/useModalConfig";
import useCollectionImport from "@/core/hooks/useCollectionImport";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import * as utils from "@/utils/collectionUtils";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";
import { useQuickExit } from "@/core/hooks/useQuickExit";


/**
 * SidebarHeader
 */
const SidebarHeader = () => {
  const collectionName = useCollectionStore((state) => state.collection.name);
  const collectionDesc = useCollectionStore((state) => state.collection.description);
  const updateCollectionMeta = useCollectionStore(
    (state) => state.updateCollectionMeta,
  );
  const { handleSaveCollection } = useHistory(false);
  const showDialog = useDialogStore((state) => state.showDialog);

  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(collectionName);
  const [tempDesc, setTempDesc] = useState(collectionDesc);

  const environments = useCollectionStore(
    (state) => state.collection.environments || [],
  );
  const activeEnvironmentId = useCollectionStore(
    (state) => state.collection.activeEnvironmentId,
  );
  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);

  React.useEffect(() => {
    if (!isEditingName) setTempName(collectionName || "");
    if (!isEditingName) setTempDesc(collectionDesc || "");
  }, [collectionName, collectionDesc, isEditingName]);

  const handleSaveCollectionMeta = (name?: string, desc?: string) => {
    updateCollectionMeta(name, desc);
    setIsEditingName(false);
  };

  const handleSaveExt = async () => {
    const confirmed = await showDialog({
      title: "Salvar coleção",
      description: "Deseja salvar esta coleção no histórico?",
      options: [
        { label: "Não salvar", value: false, variant: "secondary" },
        { label: "Salvar", value: true, variant: "primary" },
      ],
    });
    
    await handleSaveCollection(confirmed === true);
    if(confirmed !== null){
      navigate("/");
    }
  }

  return (
    <div>
      <div className="px-2 py-2 flex items-center justify-between group/env">
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
        {activeEnv && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover/env:hidden transition-colors"></span>
          </div>
        )}
        
        <button
          onClick={() => setIsEnvManagerOpen(true)}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-[0.65rem]! font-bold text-yellow-500 transition-colors hidden group-hover/env:block opacity-0 group-hover/env:opacity-100! uppercase"
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const { modalConfig, setModalConfig } = useModalConfig();
  const collectionItems = useCollectionStore((state) => state.collection.items);
  const collectionName = useCollectionStore((state) => state.collection.name);
  // const addRoute = useCollectionStore((state) => state.addRoute);
  // const addFolder = useCollectionStore((state) => state.addFolder);
  // const renameItem = useCollectionStore((state) => state.renameItem);
  const deleteItem = useCollectionStore((state) => state.deleteItem);
  const reorderItems = useCollectionStore((state) => state.reorderItems);
  const isDraggingDisabled = useCollectionStore((state) => state.isDraggingDisabled);

  const {
    isImportModalOpen,
    setIsImportModalOpen,
    startConversion,
    handleFolderSelect,
  } = useCollectionImport();

  useQuickExit();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeSensors = isDraggingDisabled ? [] : sensors;

  const { handleDragEnd } = useMenuContext({
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
        subMenu: [
          {
            label: "HTTP Request",
            icon: <FilePlus size={14} />,
            onClick: () =>
              setModalConfig({ open: true, type: "route:http", targetId: null }),
          },
          {
            label: "SSE Connection",
            icon: <FilePlus size={14} className="text-emerald-500" />,
            onClick: () =>
              setModalConfig({ open: true, type: "route:sse", targetId: null }),
          },
          {
            label: "WebSocket Connection",
            icon: <FilePlus size={14} className="text-violet-500" />,
            onClick: () =>
              setModalConfig({ open: true, type: "route:websocket", targetId: null }),
          },
        ],
      },
    ],
    [setModalConfig],
  );

  return (
    <ContextMenu items={rootContextMenuItems}>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2 h-full bg-zinc-950/40">
          <div className="flex items-center justify-between px-0 py-1 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase truncate">
              {collectionName}
            </span>
            {/* <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <div className="p-1 hover:bg-zinc-800/40 group data-[state=open]:bg-zinc-800/40 rounded cursor-pointer transition-colors duration-200">
                  <EllipsisVertical size={16} className="text-gray-400" />
                </div>
              </Dropdown.Trigger>
              <Dropdown.Content
                sideOffset={10}
                side="bottom"
                align="start"
                className="min-w-55 bg-zinc-800 shadow-[0_0_0.5rem_rgba(0,0,0,0.1)] p-1 rounded-sm z-60!"
              >
                {rootContextMenuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    index={index}
                    item={item}
                  />
                ))}
              </Dropdown.Content>
            </Dropdown.Root> */}
          </div>

          {collectionItems.length === 0 ? (
            <div className="text-center py-8 text-text-secondary flex flex-col items-center">
              <span className="text-xs font-bold text-text-primary mb-1">Nenhuma coleção carregada</span>
              <span className="text-[0.6rem] text-text-muted">Faça upload de uma coleção ou crie uma nova!</span>

              <div className="flex flex-col px-3 gap-2.5 mt-5 w-full">
                <NovaCollectionModal>
                  <div className="btn-secondary w-full text-xs font-semibold py-1 gap-2 flex justify-center items-center">
                    <FolderPlus size={16} className="text-text-primary" />
                    <span className="text-xs">Nova Coleção</span>
                  </div>
                </NovaCollectionModal>
                <ImportCollectionModal
                  open={isImportModalOpen}
                  onOpenChange={setIsImportModalOpen}
                  onImport={(path) => {
                    setIsImportModalOpen(false);
                    startConversion(path, true);
                  }}
                  onFolderSelect={async () => {
                    setIsImportModalOpen(false);
                    await handleFolderSelect();
                  }}
                >
                  <div className="btn-secondary w-full text-xs font-semibold py-1 gap-2 flex justify-center items-center">
                    <Folder size={16} className="text-text-primary" />
                    <span className="text-xs">Importar Coleção</span>
                  </div>
                </ImportCollectionModal>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={activeSensors}
              collisionDetection={closestCorners}
              onDragStart={(event) => setActiveId(event.active.id as string)}
              onDragEnd={(event) => {
                handleDragEnd(event);
                setActiveId(null);
              }}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={collectionItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {collectionItems.map((item) => (
                  <TreeFolder
                    key={item.id}
                    item={item}
                  />
                ))}
              </SortableContext>
              <DragOverlay dropAnimation={null} style={{ pointerEvents: "none" }}>
                {activeId ? (
                  <div className="opacity-85 bg-zinc-900 border border-zinc-700/50 rounded py-1 px-3 pointer-events-none select-none text-[0.8rem] text-zinc-200 shadow-xl flex items-center gap-1.5 ring-1 ring-zinc-700">
                    <span className="text-[0.65rem] font-bold text-gray-500 uppercase">Arrastando</span>
                    <span className="font-medium truncate max-w-40">{utils.findItemById(collectionItems, activeId)?.name || "Item"}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </ContextMenu>
  );
});

SidebarTree.displayName = "SidebarTree";

/**
 * Sidebar Main Component
 */
export default function Sidebar() {
  return (
    <div className="bg-zinc-900 flex flex-col h-full">
      <SidebarTree />
      <SidebarHeader />
    </div>
  );
}
