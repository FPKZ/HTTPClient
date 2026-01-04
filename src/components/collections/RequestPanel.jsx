import React, { useState } from "react";
import { Tab, Nav, Button, Col } from "react-bootstrap";
import RequestEditor from "./RequestEditor";
import ResultRequestLog from "../ResultRequestLog";

/**
 * RequestPanel
 * Componente principal para exibir e editar uma única requisição.
 */
export default function RequestPanel({
  screenKey,
  telaData,
  index,
  logs,
  onInputChange,
  onSelectFile,
  onExecute,
  onExport,
}) {
  const [activeRota, setActiveRota] = useState("headers");

  return (
    <div className="h-100 d-flex flex-column">
      <div className="border-bottom !border-zinc-700 p-3">
        {/* Informações Básicas */}
        <div className="d-flex flex-column gap-2 mb-1">
          <div className="d-flex items-center gap-2 bg-neutral-950 p-2 rounded">
            <small className="text-gray-500">URL:</small>
            <small>{telaData.request.url}</small>
          </div>
          <div className="d-flex items-center gap-2 bg-neutral-950 p-2 rounded">
            <small className="text-gray-500">Method:</small>
            <small className="text-green-400">{telaData.request.method}</small>
          </div>
        </div>

        {/* Sub-Navegação (Headers, Body, etc) */}
        <Tab.Container activeKey={activeRota} onSelect={(k) => setActiveRota(k)}>
          <div className="flex items-end justify-between">
            <Nav className="border-none">
              {Object.entries(telaData.request).map(([subKey, subValue]) => {
                if (subKey === "url" || subKey === "method" || !subValue) return null;
                const isActive = activeRota === subKey;
                return (
                  <Nav.Item key={subKey}>
                    <Nav.Link
                      eventKey={subKey}
                      style={{ backgroundColor: isActive ? "#141414" : "transparent" }}
                      className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer no-underline! ${
                        isActive ? "text-yellow-500!" : "text-gray-500! hover:text-gray-300!"
                      }`}
                    >
                      <small style={{ fontSize: "0.65rem" }}>{subKey}</small>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
            <button
              className="text-amber-100 bg-[#c28a10] hover:bg-[#a6760d] h-7 w-19 mb-1 rounded font-bold transition-colors"
              onClick={() => onExecute(screenKey, telaData.request)}
            >
              <small className="!text-xs">Executar</small>
            </button>
          </div>

          <Tab.Content className="mt-0">
            {Object.entries(telaData.request).map(([subKey, subValue]) => (
              <Tab.Pane key={subKey} eventKey={subKey} className="p-3 bg-[#141414] rounded-b">
                <RequestEditor
                  subKey={subKey}
                  subValue={subValue}
                  index={index}
                  onInputChange={onInputChange}
                  onSelectFile={onSelectFile}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </div>

      {/* Console de Logs */}
      <Col className="mt-auto flex flex-col items-end p-3 gap-2 overflow-auto">
        <ResultRequestLog logs={logs || []} />
        {/* <Button
          variant="primary"
          className="w-100 py-2 font-bold uppercase"
          style={{ fontSize: "0.8rem" }}
          onClick={onExport}
        >
          Exportar Collection
        </Button> */}
      </Col>
    </div>
  );
}
