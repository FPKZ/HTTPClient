import React from "react";
import { Tab, Nav, Button } from "react-bootstrap";
import { Save, Play } from "lucide-react";
import useTabStore from "../../store/useTabStore";
import RequestEditor from "../collections/RequestEditor";
import ResultRequestLog from "../ResultRequestLog";
import { useRequestExecutor } from "../../hooks/useRequestExecutor";
import { getMethodColor } from "../../lib/utils";

import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

/**
 * TabEditor
 * Editor da aba ativa com painel de requisição e console de logs.
 */
export default function TabEditor() {
  const activeTab = useTabStore((state) => state.getActiveTab());
  const updateTabRequest = useTabStore((state) => state.updateTabRequest);
  const saveTabToCollection = useTabStore((state) => state.saveTabToCollection);
  const updateTabUiState = useTabStore((state) => state.updateTabUiState);

  const {
    logsPorTela,
    executandoPorTela,
    handleExecuteRequest,
    cancelRequest,
  } = useRequestExecutor();

  // Estados de UI agora vêm da aba ativa (persistentes)
  const activeSection = activeTab?.uiState?.activeSection || "headers";
  const activeResponseView = activeTab?.uiState?.activeResponseView || "json";

  /**
   * Helper para formatar o tamanho da resposta
   */
  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

  const handleInputChange = (sectionKey, fieldKey, newValue) => {
    updateTabRequest(activeTab.id, sectionKey, fieldKey, newValue);
  };

  const handleSelectFile = async ({ subKey, fieldKey }) => {
    if (!window.electronAPI) return;
    const filePath = await window.electronAPI.selectFile();
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
    handleExecuteRequest(
      activeTab.screenKey || activeTab.id,
      activeTab.data.request,
    );
  };

  const handleSave = () => {
    saveTabToCollection(activeTab.id);
  };

  const telaData = activeTab.data;
  const logs = logsPorTela[activeTab.screenKey || activeTab.id] || [];

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 overflow-hidden h-full relative">
      <PanelGroup orientation="vertical" className="h-full">
        <Panel className="flex-1 flex flex-col h-full overflow-hidden">
          <Tab.Container
            activeKey={activeSection}
            onSelect={(k) =>
              updateTabUiState(activeTab.id, { activeSection: k })
            }
          >
            {/* Parte Superior: URL + Navegação das Abas */}
            <div className="sticky top-0 z-20 flex-none border-b border-zinc-700 bg-[#18181b] shadow-md">
              {/* Nome */}
              {/* <div className="p-1 flex items-center justify-center">
                <p className="m-0 text-[0.7rem]">{activeTab.title}</p>
              </div> */}
              {/* URL e Método */}
              <div className="p-2 py-2 flex items-center gap-3">
                {/* Método HTTP */}
                <select
                  value={telaData.request.method || "GET"}
                  onChange={(e) =>
                    handleInputChange("method", null, e.target.value)
                  }
                  className={`bg-zinc-800 text-[0.9rem]! px-2 py-2.5 rounded border border-zinc-600! focus:outline-none focus:border-yellow-500 font-semibold ${getMethodColor(
                    telaData.request.method,
                  )}`}
                >
                  <option className={getMethodColor("GET")} value="GET">
                    GET
                  </option>
                  <option className={getMethodColor("POST")} value="POST">
                    POST
                  </option>
                  <option className={getMethodColor("PUT")} value="PUT">
                    PUT
                  </option>
                  <option className={getMethodColor("DELETE")} value="DELETE">
                    DELETE
                  </option>
                  <option className={getMethodColor("PATCH")} value="PATCH">
                    PATCH
                  </option>
                </select>

                {/* URL */}
                <input
                  type="text"
                  value={telaData.request.url || ""}
                  onChange={(e) =>
                    handleInputChange("url", null, e.target.value)
                  }
                  placeholder="https://api.exemplo.com/endpoint"
                  className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-600! focus:outline-none focus:border-yellow-500"
                />

                {/* Botão Executar / Cancelar */}
                <div className="flex items-center gap-1">
                  {executandoPorTela[activeTab.screenKey || activeTab.id] ? (
                    <button
                      title="Cancelar requisição"
                      onClick={() =>
                        cancelRequest(
                          executandoPorTela[
                            activeTab.screenKey || activeTab.id
                          ],
                        )
                      }
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
                    disabled={
                      !activeTab.isDirty ||
                      !!executandoPorTela[activeTab.screenKey || activeTab.id]
                    }
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

              {/* Sub-Navegação (Headers, Body, etc) */}
              <Nav className="border-none px-0">
                {Object.entries(telaData.request).map(([subKey, subValue]) => {
                  if (subKey === "url" || subKey === "method" || !subValue)
                    return null;
                  const isActive = activeSection === subKey;

                  return (
                    <Nav.Item key={subKey}>
                      <Nav.Link
                        eventKey={subKey}
                        style={{
                          backgroundColor: isActive ? "#141414" : "transparent",
                        }}
                        className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer no-underline! ${
                          isActive
                            ? "text-yellow-500!"
                            : "text-gray-500! hover:text-gray-300!"
                        }`}
                      >
                        <small style={{ fontSize: "0.65rem" }}>{subKey}</small>
                      </Nav.Link>
                    </Nav.Item>
                  );
                })}
              </Nav>
            </div>

            {/* Parte Central: Conteúdo do Editor (Headers, Body, Auth...) */}
            <div className="flex-1 bg-[#141414] min-h-0 flex flex-col overflow-hidden">
              <Tab.Content className="mt-0 flex-1 flex flex-col min-h-0">
                {Object.entries(telaData.request).map(([subKey, subValue]) => (
                  <Tab.Pane
                    key={subKey}
                    eventKey={subKey}
                    className="p-3 pb-1 flex-1 flex flex-col min-h-0"
                  >
                    <RequestEditor
                      subKey={subKey}
                      subValue={subValue}
                      requestId={activeTab.id}
                      index={0}
                      onInputChange={(idx, sectionKey, fieldKey, value) => {
                        handleInputChange(sectionKey, fieldKey, value);
                      }}
                      onSelectFile={handleSelectFile}
                      onRun={handleExecute}
                    />
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </div>
          </Tab.Container>
        </Panel>

        <PanelResizeHandle className="position-relative group/resize">
          <div className="w-full position-absolute top-0 h-[0.1rem]! display-none group-hover/resize:display-block group-hover/resize:bg-yellow-600/50 group-hover/resize:h-1"></div>
          <div className="w-full position-absolute bottom-0 h-[0.2rem]! display-none group-hover/resize:display-block group-hover/resize:bg-yellow-600/50 group-hover/resize:h-1"></div>
        </PanelResizeHandle>

        <Panel defaultSize="60%" maxSize="70%" minSize="5%">
          {/* Parte Inferior: Console de Logs (Resultado) */}
          <div className="flex-1 h-full border-t border-zinc-700! bg-zinc-950 flex flex-col overflow-hidden">
            {/* Cabeçalho Fixo com Metadados e Abas */}
            <div className="px-2 py-1.5 border-b border-zinc-800! flex justify-between items-center bg-zinc-900/30 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[0.65rem]! font-black tracking-widest text-zinc-500 uppercase shrink-0">
                  Response
                </span>
                {logs.length > 0 && (
                  <>
                    <span className="text-zinc-700 font-bold shrink-0">•</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          logs[logs.length - 1].isError
                            ? "bg-red-500"
                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        }`}
                      />
                      <span
                        className={`${
                          logs[logs.length - 1].isError
                            ? "text-red-500"
                            : "text-green-400"
                        } text-[0.7rem]! font-bold`}
                      >
                        {logs[logs.length - 1].status}{" "}
                        {logs[logs.length - 1].statusText}
                      </span>
                    </div>
                    {logs[logs.length - 1].responseTime !== undefined && (
                      <span className="text-zinc-600 text-[0.65rem]! font-medium ml-1 shrink-0">
                        {logs[logs.length - 1].responseTime} ms
                      </span>
                    )}
                    {logs[logs.length - 1].responseSize !== undefined && (
                      <span className="text-zinc-600 text-[0.65rem]! font-medium shrink-0">
                        {formatSize(logs[logs.length - 1].responseSize)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Seletor de Abas Global */}
              <div className="flex bg-zinc-900/80 rounded-lg! p-0.5 border border-zinc-800! ml-4 shrink-0">
                {["json", "preview", "headers"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      updateTabUiState(activeTab.id, {
                        activeResponseView: tab,
                      })
                    }
                    className={`px-2.5 py-1 rounded-md! text-[0.6rem]! font-bold uppercase transition-all! ${
                      activeResponseView === tab
                        ? "bg-zinc-800 text-yellow-500 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo do Log */}
            <div className="flex-1 p-0 overflow-hidden bg-[#010101]">
              <ResultRequestLog logs={logs} activeView={activeResponseView} />
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
