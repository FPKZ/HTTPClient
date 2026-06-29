import React from "react";
import { Save, Play } from "lucide-react";
import useTabStore from "@/core/store/useTabStore";
import useCollectionStore from "@/core/store/useCollectionStore";
import RequestEditor from "../collections/RequestEditor";
import { useRequestExecutor } from "@/core/hooks/useRequestExecutor";
import { getMethodColor } from "@/lib/utils";
import useInterfaceStore from "@/core/store/useInterfaceStore";
import Response from "./includes/tabeditorComponents/Response";
import CodeSnippets from "./includes/tabeditorComponents/CodeSnippets";
import { usePanelPersistence } from "@/core/hooks/usePanelPersistence";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { Tab } from "@/core/store/index";

import icons from "@/assets/icons";

/**
 * TabEditor
 * Editor da aba ativa com painel de requisição e console de logs.
 * Substituído BSTab.Container/Nav do react-bootstrap por abas nativas com estado React.
 */
export default function TabEditor() {

  const collectionId = useCollectionStore((state) => state.collection.id);

  if(!collectionId) {
    
    const { roundIcon } = icons()

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 text-gray-500">
        <div className="flex flex-col items-center justify-center mb-5">
          {roundIcon()}
          <p className="text-lg mt-3 font-bold text-white">Volt API Client</p>
        </div>
        <div className="text-center">
          <p className="text-sm mb-2">Selecione uma coleção para começar</p>
        </div>
      </div>
    )
}

  const activeTab = useTabStore((state) => state.getActiveTab());
  const updateTabRequest = useTabStore((state) => state.updateTabRequest);
  const saveTabToCollection = useCollectionStore((state) => state.saveTabToCollection);
  const updateTabUiState = useTabStore((state) => state.updateTabUiState);
  const responseIsOpen = useInterfaceStore((state) => state.responseIsOpen);
  const codeSnippetsIsOpen = useInterfaceStore(
    (state) => state.codeSnippetsIsOpen,
  );

  const { handleExecuteRequest, cancelRequest } = useRequestExecutor();

  // Estados de UI agora vêm da aba ativa (persistentes)
  const activeSection = activeTab?.uiState?.activeSection || "headers";
  const activeResponseView = activeTab?.uiState?.activeResponseView || "json";
  const panelVerticalSize = activeTab?.uiState?.panelVerticalSize || "50";
  const panelHorizontalSize = activeTab?.uiState?.panelHorizontalSize || "30";

  const {
    verticalPanelRef,
    horizontalPanelRef,
    onVerticalLayoutChanged,
    onHorizontalLayoutChanged,
  } = usePanelPersistence(
    activeTab?.id || "",
    { 
      vertical: `${panelVerticalSize}%`, 
      horizontal: `${panelHorizontalSize}%` 
    },
    updateTabUiState,
  );

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">Nenhuma aba aberta</p>
          <p className="text-sm">
            Selecione uma rota na sidebar ou crie uma nova aba
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (sectionKey: string, fieldKey: string | null, newValue: any) => {
    updateTabRequest(activeTab.id, sectionKey, fieldKey, newValue);
  };

  const handleSelectFile = async ({ subKey, fieldKey }: { subKey: string, fieldKey: string }) => {
    if (!(window as any).electronAPI) return;
    const filePath = await (window as any).electronAPI.selectFile();
    if (!filePath) return;

    // Atualizar campo com caminho do arquivo
    const currentSection = activeTab.data.request[subKey] || {};
    const currentField = currentSection[fieldKey] || {};

    updateTabRequest(activeTab.id, subKey, fieldKey, {
      ...currentField,
      src: filePath,
    });
  };

  const handleExecute = () => {
    handleExecuteRequest(activeTab.id, activeTab.data.request, activeTab.title);
  };

  const handleSave = () => {
    saveTabToCollection(activeTab.id);
  };

  const telaData = activeTab.data;
  const logs = activeTab.logs || [];
  const isExecuting = activeTab.isExecuting;

  return (
    <div
      key={activeTab.id}
      className="flex-1 flex flex-col bg-zinc-900 overflow-hidden h-full relative"
    >
      <PanelGroup
        id={`vertical-group-${activeTab.id}`}
        orientation="vertical"
        className="h-full flex-col"
        onLayoutChanged={onVerticalLayoutChanged}
      >
        <Panel
          id={`request-panel-${activeTab.id}`}
          className="flex flex-col h-full overflow-hidden"
        >
          {/* Parte Superior: URL + Navegação das Abas */}
          <div className="sticky top-0 z-20 flex-none border-b border-zinc-700 bg-[#18181b] shadow-md">
            <div className="p-2 py-2 flex items-center gap-3">
              {/* Método HTTP */}
              <select
                value={telaData.request.method || "GET"}
                onChange={(e) =>
                  handleInputChange("method", null, e.target.value)
                }
                className={`bg-zinc-800 text-[0.9rem] px-2 py-2.5 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500 font-semibold ${getMethodColor(
                  telaData.request.method,
                )}`}
              >
                <option className={getMethodColor("GET")} value="GET">GET</option>
                <option className={getMethodColor("POST")} value="POST">POST</option>
                <option className={getMethodColor("PUT")} value="PUT">PUT</option>
                <option className={getMethodColor("DELETE")} value="DELETE">DELETE</option>
                <option className={getMethodColor("PATCH")} value="PATCH">PATCH</option>
              </select>

              {/* URL */}
              <input
                type="text"
                value={telaData.request.url || ""}
                onChange={(e) =>
                  handleInputChange("url", null, e.target.value)
                }
                placeholder="https://api.exemplo.com/endpoint"
                className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500"
              />

              {/* Botão Executar / Cancelar */}
              <div className="flex items-center gap-1">
                {isExecuting ? (
                  <button
                    title="Cancelar requisição"
                    onClick={() => cancelRequest(isExecuting as string)}
                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors animate-pulse"
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </button>
                ) : (
                  <button
                    title="Executar requisição"
                    onClick={handleExecute}
                    className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition-colors"
                  >
                    <Play size={16} />
                  </button>
                )}

                {/* Botão Salvar */}
                <button
                  onClick={handleSave}
                  disabled={!activeTab.isDirty || !!isExecuting}
                  className={`
                    p-2.5 rounded font-bold transition-colors flex items-center gap-2
                    ${
                      activeTab.isDirty
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-zinc-700 text-gray-500"
                    }
                  `}
                  title={
                    activeTab.isDirty
                      ? "Salvar mudanças na coleção"
                      : "Nenhuma mudança para salvar"
                  }
                >
                  <Save size={16} />
                </button>
              </div>
            </div>

            {/* Sub-Navegação nativa (Headers, Body, etc) */}
            <div className="flex flex-row border-none px-0">
              {Object.entries(telaData.request).map(([subKey, subValue]) => {
                if (subKey === "url" || subKey === "method" || !subValue)
                  return null;
                const isActive = activeSection === subKey;

                return (
                  <button
                    key={subKey}
                    onClick={() => updateTabUiState(activeTab.id, { activeSection: subKey })}
                    style={{
                      backgroundColor: isActive ? "#141414" : "transparent",
                    }}
                    className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer border-0 ${
                      isActive
                        ? "text-yellow-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <small style={{ fontSize: "0.65rem" }}>{subKey}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parte Central: Conteúdo do Editor (Headers, Body, Auth...) */}
          <div className="flex-1 bg-[#141414] min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
              {Object.entries(telaData.request).map(([subKey, subValue]) => (
                <div
                  key={subKey}
                  className={`p-3 pb-1 flex-1 flex flex-col min-h-0 ${
                    activeSection === subKey ? "block" : "hidden"
                  }`}
                >
                  <RequestEditor
                    subKey={subKey}
                    subValue={subValue}
                    requestId={activeTab.id}
                    index={0}
                    onInputChange={(_idx, sectionKey, fieldKey, value) => {
                      handleInputChange(sectionKey, fieldKey, value);
                    }}
                    onSelectFile={handleSelectFile}
                    onRun={handleExecute}
                  />
                </div>
              ))}
            </div>
          </div>
        </Panel>
        {(responseIsOpen || codeSnippetsIsOpen) && (
          <>
            <PanelResizeHandle className="relative group/resize h-1 bg-zinc-800 hover:bg-yellow-600/50 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/resize:opacity-100 transition-opacity">
                <div className="w-8 h-1 bg-zinc-600 rounded-full"></div>
              </div>
            </PanelResizeHandle>

            <Panel
              id="response-panel-container-global"
              ref={verticalPanelRef}
              defaultSize={`${panelVerticalSize}%` as any}
              maxSize={"90%" as any}
              minSize={"10%" as any}
            >
              <PanelGroup
                id="horizontal-group-global"
                orientation="horizontal"
                onLayoutChanged={onHorizontalLayoutChanged}
              >
                {/* Parte Inferior: Console de Logs (Resultado) */}
                {responseIsOpen && (
                  <Panel id="response-content-panel-global">
                    <Response
                      logs={logs}
                      activeResponseView={activeResponseView}
                      updateTabUiState={updateTabUiState}
                      activeTab={activeTab as Tab}
                    />
                  </Panel>
                )}

                {responseIsOpen && codeSnippetsIsOpen && (
                  <PanelResizeHandle className="relative group/resize w-1 bg-zinc-800 hover:bg-yellow-600/50 transition-colors">
                  </PanelResizeHandle>
                )}

                {codeSnippetsIsOpen && (
                  <Panel
                    id="snippets-panel-global"
                    ref={horizontalPanelRef}
                    defaultSize={`${panelHorizontalSize}%` as any}
                    maxSize={"70%" as any}
                    minSize={"15%" as any}
                  >
                    <CodeSnippets request={telaData.request} theme="vs-dark" />
                  </Panel>
                )}
              </PanelGroup>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
