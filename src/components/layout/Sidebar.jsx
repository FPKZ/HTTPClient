import React, { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import useTabStore from "../../store/useTabStore";

/**
 * Sidebar
 * Menu lateral com lista de rotas da coleção e metadados.
 */
export default function Sidebar() {
  const collection = useTabStore((state) => state.collection);
  const addTab = useTabStore((state) => state.addTab);
  const addRoute = useTabStore((state) => state.addRoute);
  const deleteRoute = useTabStore((state) => state.deleteRoute);
  const updateCollectionMeta = useTabStore(
    (state) => state.updateCollectionMeta
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempName, setTempName] = useState(collection.name);
  const [tempDesc, setTempDesc] = useState(collection.description);

  const handleSaveName = () => {
    updateCollectionMeta(tempName, undefined);
    setIsEditingName(false);
  };

  const handleSaveDesc = () => {
    updateCollectionMeta(undefined, tempDesc);
    setIsEditingDesc(false);
  };

  const handleRouteClick = (screenKey, routeData) => {
    addTab(screenKey, routeData);
  };

  const handleDeleteRoute = (e, screenKey) => {
    e.stopPropagation();
    if (confirm(`Deseja realmente deletar a rota "${screenKey}"?`)) {
      deleteRoute(screenKey);
    }
  };

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

  return (
    <div className="w-80 bg-zinc-900 border-r border-zinc-700 flex flex-col h-full">
      {/* Header da Coleção */}
      <div className="p-4 border-b border-zinc-700">
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
              setTempName(collection.name);
              setIsEditingName(true);
            }}
          >
            {collection.name || "Collection"}
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
              setTempDesc(collection.description);
              setIsEditingDesc(true);
            }}
          >
            {collection.description || "Clique para adicionar descrição"}
          </p>
        )}
      </div>

      {/* Lista de Rotas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Rotas
            </span>
            <span className="text-xs text-gray-600">
              {collection.routes.length}
            </span>
          </div>

          {collection.routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhuma rota na coleção
            </div>
          ) : (
            collection.routes.map((route) => (
              <div
                key={route.id}
                className="group flex items-center gap-1 px-2 py-1 mb-1 rounded cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => handleRouteClick(route.id, route)}
              >
                {/* Método HTTP */}
                <span
                  className={`!text-[0.7rem] font-bold ${getMethodColor(
                    route.request?.method
                  )} min-w-[45px]`}
                >
                  {route.request?.method || "GET"}
                </span>

                {/* Nome da Rota */}
                <div className="flex-1 min-w-0">
                  <div className="!text-[0.8rem] text-white truncate">
                    {route.name}
                  </div>
                  {route.request?.url && (
                    <div className="!text-[0.7rem] text-gray-500 truncate">
                      {route.request.url}
                    </div>
                  )}
                </div>

                {/* Botão Deletar (visível no hover) */}
                <button
                  onClick={(e) => handleDeleteRoute(e, route.id)}
                  className="opacity-0 group-hover:!opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  title="Deletar rota"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão Adicionar Rota */}
      <div className="p-3 border-t border-zinc-700">
        <button
          onClick={addRoute}
          className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded !text-[0.8rem] font-semibold transition-colors"
        >
          <Plus size={14} />
          <span>Nova Rota</span>
        </button>
      </div>
    </div>
  );
}
