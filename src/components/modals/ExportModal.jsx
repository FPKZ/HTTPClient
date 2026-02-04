import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Download,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import useTabStore from "../../store/useTabStore";
import useModalStore from "../../store/useModalStore";
import { collectRouteIds } from "../../utils/collectionUtils";

export default function ExportModal() {
  const isOpen = useModalStore((state) => state.isExportModalOpen);
  const exportFormat = useModalStore((state) => state.exportFormat);
  const setExportModalOpen = useModalStore((state) => state.setExportModalOpen);

  const collection = useTabStore((state) => state.collection);
  const activeEnvironmentId = collection.activeEnvironmentId;

  const [selectedRouteIds, setSelectedRouteIds] = useState(new Set());
  const [selectedEnvIds, setSelectedEnvIds] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Initialize selections when modal opens
  useEffect(() => {
    if (isOpen) {
      // Select all routes by default
      const allRouteIds = new Set();
      const collectAllRouteIds = (items) => {
        items.forEach((item) => {
          if (item.type === "route") {
            allRouteIds.add(item.id);
          } else if (item.type === "folder" && item.items) {
            collectAllRouteIds(item.items);
          }
        });
      };
      collectAllRouteIds(collection.items);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRouteIds(allRouteIds);

      // Select only active environment by default
      setSelectedEnvIds(new Set([activeEnvironmentId]));

      // Expand all folders by default
      const allFolderIds = new Set();
      const collectFolderIds = (items) => {
        items.forEach((item) => {
          if (item.type === "folder") {
            allFolderIds.add(item.id);
            if (item.items) collectFolderIds(item.items);
          }
        });
      };
      collectFolderIds(collection.items);
      setExpandedFolders(allFolderIds);
    }
  }, [isOpen, collection.items, activeEnvironmentId]);

  const toggleRouteSelection = (itemId, item) => {
    const newSelection = new Set(selectedRouteIds);

    if (item.type === "route") {
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
    } else if (item.type === "folder") {
      const routeIds = collectRouteIds(item);
      const allSelected = routeIds.every((id) => newSelection.has(id));

      if (allSelected) {
        routeIds.forEach((id) => newSelection.delete(id));
      } else {
        routeIds.forEach((id) => newSelection.add(id));
      }
    }

    setSelectedRouteIds(newSelection);
  };

  const toggleEnvSelection = (envId) => {
    const newSelection = new Set(selectedEnvIds);
    if (newSelection.has(envId)) {
      newSelection.delete(envId);
    } else {
      newSelection.add(envId);
    }
    setSelectedEnvIds(newSelection);
  };

  const toggleAllRoutes = () => {
    if (selectedRouteIds.size > 0) {
      setSelectedRouteIds(new Set());
    } else {
      const allRouteIds = new Set();
      const collectAllRouteIds = (items) => {
        items.forEach((item) => {
          if (item.type === "route") {
            allRouteIds.add(item.id);
          } else if (item.type === "folder" && item.items) {
            collectAllRouteIds(item.items);
          }
        });
      };
      collectAllRouteIds(collection.items);
      setSelectedRouteIds(allRouteIds);
    }
  };

  const toggleAllEnvs = () => {
    if (selectedEnvIds.size > 0) {
      setSelectedEnvIds(new Set());
    } else {
      setSelectedEnvIds(new Set(collection.environments.map((e) => e.id)));
    }
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getItemCheckState = (item) => {
    if (item.type === "route") {
      return selectedRouteIds.has(item.id) ? "checked" : "unchecked";
    } else if (item.type === "folder") {
      const routeIds = collectRouteIds(item);
      const selectedCount = routeIds.filter((id) =>
        selectedRouteIds.has(id),
      ).length;
      if (selectedCount === 0) return "unchecked";
      if (selectedCount === routeIds.length) return "checked";
      return "partial";
    }
    return "unchecked";
  };

  const filterItems = (items) => {
    return items
      .map((item) => {
        if (item.type === "route") {
          return selectedRouteIds.has(item.id) ? item : null;
        } else if (item.type === "folder") {
          const filteredChildren = filterItems(item.items || []);
          if (filteredChildren.length > 0) {
            return { ...item, items: filteredChildren };
          }
          return null;
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleExport = () => {
    const filteredItems = filterItems(collection.items);
    const filteredEnvironments = collection.environments.filter((env) =>
      selectedEnvIds.has(env.id),
    );

    const exportData = {
      ...collection,
      items: filteredItems,
      environments: filteredEnvironments,
      activeEnvironmentId: selectedEnvIds.has(activeEnvironmentId)
        ? activeEnvironmentId
        : filteredEnvironments[0]?.id || null,
    };

    if (exportFormat === "json") {
      window.electronAPI.saveFile({ content: exportData });
    } else if (exportFormat === "http") {
      window.electronAPI.exportHttp({ content: exportData });
    }

    setExportModalOpen(false);
  };

  const renderTreeItem = (item, depth = 0) => {
    const checkState = getItemCheckState(item);
    const isExpanded = expandedFolders.has(item.id);

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 rounded-md cursor-pointer group"
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {item.type === "folder" && (
            <button
              onClick={() => toggleFolder(item.id)}
              className="p-0.5 hover:bg-zinc-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-zinc-400" />
              ) : (
                <ChevronRight size={14} className="text-zinc-400" />
              )}
            </button>
          )}

          <button
            onClick={() => toggleRouteSelection(item.id, item)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {checkState === "checked" && (
              <CheckSquare size={16} className="text-yellow-500" />
            )}
            {checkState === "unchecked" && (
              <Square size={16} className="text-zinc-600" />
            )}
            {checkState === "partial" && (
              <MinusSquare size={16} className="text-yellow-500/70" />
            )}

            {item.type === "folder" ? (
              <FolderOpen size={16} className="text-blue-400" />
            ) : (
              <FileText size={16} className="text-zinc-400" />
            )}

            <span className="text-sm! text-zinc-200">{item.name}</span>
          </button>
        </div>

        {item.type === "folder" && isExpanded && item.items && (
          <div className="flex flex-col ps-3">
            {item.items.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => setExportModalOpen(open)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[60%]! max-w-[97%]! max-h-[85vh] bg-zinc-950 rounded-xl border border-zinc-800! shadow-2xl overflow-hidden flex flex-col z-50 outline-none animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800! bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Download className="text-yellow-500" size={20} />
              <Dialog.Title className="text-xl! font-bold tracking-tight text-white m-0">
                Exportar Coleção
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="flex items-center justify-center rounded-md! h-9 w-9 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Routes Section */}
            <div className="flex-1 border-r border-zinc-800! flex flex-col">
              <div className="px-4 py-3 border-b border-zinc-800! bg-zinc-900/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm! font-bold text-white m-0">Rotas</h3>
                  <button
                    onClick={toggleAllRoutes}
                    className="text-xs! text-yellow-500 hover:text-yellow-400 font-medium"
                  >
                    {selectedRouteIds.size > 0
                      ? "Desmarcar Tudo"
                      : "Selecionar Tudo"}
                  </button>
                </div>
                <p className="text-xs! text-zinc-500 m-0">
                  {selectedRouteIds.size} rota(s) selecionada(s)
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {collection.items.map((item) => renderTreeItem(item))}
              </div>
            </div>

            {/* Environments Section */}
            <div className="w-80 flex flex-col">
              <div className="px-4 py-3 border-b border-zinc-800! bg-zinc-900/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm! font-bold text-white m-0">
                    Ambientes
                  </h3>
                  <button
                    onClick={toggleAllEnvs}
                    className="text-xs! text-yellow-500 hover:text-yellow-400 font-medium"
                  >
                    {selectedEnvIds.size > 0
                      ? "Desmarcar Tudo"
                      : "Selecionar Tudo"}
                  </button>
                </div>
                <p className="text-xs! text-zinc-500 m-0">
                  {selectedEnvIds.size} ambiente(s) selecionado(s)
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {collection.environments.map((env) => (
                  <div
                    key={env.id}
                    onClick={() => toggleEnvSelection(env.id)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/50 rounded-md cursor-pointer group"
                  >
                    {selectedEnvIds.has(env.id) ? (
                      <CheckSquare size={16} className="text-yellow-500" />
                    ) : (
                      <Square size={16} className="text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-200 flex-1">
                      {env.name}
                    </span>
                    {env.id === activeEnvironmentId && (
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-zinc-800! bg-zinc-900/50 flex justify-between items-center">
            <div className="text-xs text-zinc-500">
              Formato:{" "}
              <span className="text-zinc-300 font-bold uppercase">
                {exportFormat}
              </span>
            </div>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button className="h-10 px-4 rounded-lg! bg-zinc-800 text-zinc-300 text-sm! font-bold hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleExport}
                disabled={selectedRouteIds.size === 0}
                className="h-10 px-4 rounded-lg! bg-yellow-600 text-zinc-950 text-sm! font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-600/10! disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Exportar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
