import React, { useState } from "react";
import { Plus, Trash2, FolderPlus, FilePlus } from "lucide-react";
import { TreeFolder } from "./TreeFolder";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NovoItemModal from "../modals/NovoItemModal";
import {useHistory} from "../../hooks/useHistory";

//hooks
import useTabStore from "../../store/useTabStore";

/**
 * Sidebar
 * Menu lateral com lista de rotas da coleção e metadados.
 */
export default function Sidebar() {
  const collection = useTabStore((state) => state.collection);
  const addRoute = useTabStore((state) => state.addRoute);
  const addFolder = useTabStore((state) => state.addFolder);
  const updateCollectionMeta = useTabStore(
    (state) => state.updateCollectionMeta
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempName, setTempName] = useState(collection.name);
  const [tempDesc, setTempDesc] = useState(collection.description);

  const { handleSaveCollection } = useHistory();

  const navigate = useNavigate();

  const handleSaveName = () => {
    updateCollectionMeta(tempName, undefined);
    setIsEditingName(false);
  };

  const handleSaveDesc = () => {
    updateCollectionMeta(undefined, tempDesc);
    setIsEditingDesc(false);
  };

  const handleAddRoute = (name) => {
    addRoute(null, name);
  };

  const handleAddFolder = (name) => {
    addFolder(null, name);
  };


  return (
    <div className="w-80 bg-zinc-900 border-r border-zinc-700 flex flex-col h-full">


      <div className="p-2">
        <button 
          className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700 text-zinc-300 text-[0.75rem]! font-semibold transition-colors"
          onClick={async () => {
            await handleSaveCollection(collection.name, collection.items, collection.id);
            navigate(-1);
          }}>
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

      {/* Árvore de Pastas e Rotas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
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
            collection.items.map((item) => (
              <TreeFolder key={item.id} item={item} />
            ))
          )}
        </div>
      </div>

      {/* Botões de Ação Rápidos */}
      {/* <div className="p-3 border-t border-zinc-700 grid grid-cols-2 gap-2">
        <button
          onClick={() => addFolder()}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[0.75rem]! font-semibold transition-colors border border-zinc-700"
        >
          <FolderPlus size={14} />
          <span>Pasta</span>
        </button>
        <button
          onClick={() => addRoute()}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-[0.75rem]! font-semibold transition-colors"
        >
          <Plus size={14} />
          <span>Rota</span>
        </button>
      </div> */}
    </div>
  );
}
