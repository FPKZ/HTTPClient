import React, { useState } from "react";
import { Tab, Nav, Button } from "react-bootstrap";
import { Save } from "lucide-react";
import useTabStore from "../../store/useTabStore";
import RequestEditor from "../collections/RequestEditor";
import ResultRequestLog from "../ResultRequestLog";
import { useRequestExecutor } from "../../hooks/useRequestExecutor";
import { getMethodColor } from "../../lib/utils";

/**
 * TabEditor
 * Editor da aba ativa com painel de requisição e console de logs.
 */
export default function TabEditor() {
  const activeTab = useTabStore((state) => state.getActiveTab());
  const updateTabRequest = useTabStore((state) => state.updateTabRequest);
  const saveTabToCollection = useTabStore((state) => state.saveTabToCollection);

  const { logsPorTela, handleExecuteRequest } = useRequestExecutor();
  const [activeSection, setActiveSection] = useState("headers");

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
      activeTab.data.request
    );
  };

  const handleSave = () => {
    saveTabToCollection(activeTab.id);
  };

  const telaData = activeTab.data;
  const logs = logsPorTela[activeTab.screenKey || activeTab.id] || [];

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 overflow-hidden">
      <Tab.Container
        activeKey={activeSection}
        onSelect={(k) => setActiveSection(k)}
      >
        {/* Parte Superior: URL + Navegação das Abas */}
        <div className="flex-none border-b border-zinc-700 bg-zinc-900/50">
          {/* URL e Método */}
          <div className="p-4 flex items-center gap-3">
            {/* Método HTTP */}
            <select
              value={telaData.request.method || "GET"}
              onChange={(e) =>
                handleInputChange("method", null, e.target.value)
              }
              className={`bg-zinc-800 text-[0.6rem] px-3 py-2 rounded border !border-zinc-600 focus:outline-none focus:border-yellow-500 font-semibold ${getMethodColor(
                telaData.request.method
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
              onChange={(e) => handleInputChange("url", null, e.target.value)}
              placeholder="https://api.exemplo.com/endpoint"
              className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded border !border-zinc-600 focus:outline-none focus:border-yellow-500"
            />

            {/* Botão Executar */}
            <button
              onClick={handleExecute}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition-colors"
            >
              Executar
            </button>

            {/* Botão Salvar */}
            <button
              onClick={handleSave}
              disabled={!activeTab.isDirty}
              className={`
                px-6 py-2 rounded font-bold transition-colors flex items-center gap-2
                ${
                  activeTab.isDirty
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-zinc-700 text-gray-500 cursor-not-allowed"
                }
              `}
              title={
                activeTab.isDirty
                  ? "Salvar mudanças na coleção"
                  : "Nenhuma mudança para salvar"
              }
            >
              <Save size={16} />
              Salvar
            </button>
          </div>

          {/* Sub-Navegação (Headers, Body, etc) */}
          <Nav className="border-none px-4">
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
        <div className="flex-none max-h-[60%] overflow-auto bg-[#141414]">
          <Tab.Content className="mt-0">
            {Object.entries(telaData.request).map(([subKey, subValue]) => (
              <Tab.Pane key={subKey} eventKey={subKey} className="p-4">
                <RequestEditor
                  subKey={subKey}
                  subValue={subValue}
                  index={0}
                  onInputChange={(idx, sectionKey, fieldKey, value) => {
                    handleInputChange(sectionKey, fieldKey, value);
                  }}
                  onSelectFile={handleSelectFile}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </div>
      </Tab.Container>

      {/* Parte Inferior: Console de Logs (Resultado) */}
      <div className="flex-1 min-h-[200px] border-t border-zinc-700 bg-zinc-950 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <span className="text-[0.6rem] uppercase text-zinc-500 font-bold tracking-widest">
            Console de Resposta
          </span>
          <span className="text-[0.6rem] text-zinc-600">
            {logs.length} logs
          </span>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <ResultRequestLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
