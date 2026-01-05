import React, { useState } from "react";
import { Tab, Nav, Button } from "react-bootstrap";
import { Save } from "lucide-react";
import useTabStore from "../../store/useTabStore";
import RequestEditor from "../collections/RequestEditor";
import ResultRequestLog from "../ResultRequestLog";
import { useRequestExecutor } from "../../hooks/useRequestExecutor";

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
      {/* Header da Requisição */}
      <div className="border-b border-zinc-700 p-4">
        {/* URL e Método */}
        <div className="flex items-center gap-3 mb-3">
          {/* Método HTTP */}
          <select
            value={telaData.request.method || "GET"}
            onChange={(e) => handleInputChange("method", null, e.target.value)}
            className="bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500 font-semibold"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          {/* URL */}
          <input
            type="text"
            value={telaData.request.url || ""}
            onChange={(e) => handleInputChange("url", null, e.target.value)}
            placeholder="https://api.exemplo.com/endpoint"
            className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-600 focus:outline-none focus:border-yellow-500"
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
        <Tab.Container
          activeKey={activeSection}
          onSelect={(k) => setActiveSection(k)}
        >
          <Nav className="border-none">
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

          <Tab.Content className="mt-0">
            {Object.entries(telaData.request).map(([subKey, subValue]) => (
              <Tab.Pane
                key={subKey}
                eventKey={subKey}
                className="p-3 bg-[#141414] rounded-b"
              >
                <RequestEditor
                  subKey={subKey}
                  subValue={subValue}
                  index={0} // Não usado mais, mas mantido para compatibilidade
                  onInputChange={(idx, sectionKey, fieldKey, value) => {
                    handleInputChange(sectionKey, fieldKey, value);
                  }}
                  onSelectFile={handleSelectFile}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </div>

      {/* Console de Logs */}
      <div className="flex-1 overflow-auto p-4">
        <ResultRequestLog logs={logs} />
      </div>
    </div>
  );
}
