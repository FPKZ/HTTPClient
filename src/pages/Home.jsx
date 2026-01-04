import React, { useState, useEffect, useMemo } from "react";
import { Tab, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

// Components
import CollectionsTabs from "../components/collections/CollectionsTabs";
import RequestPanel from "../components/collections/RequestPanel";

// Hooks
import { useCollections } from "../hooks/useCollections";
import { useRequestExecutor } from "../hooks/useRequestExecutor";
import { useTabScroll } from "../hooks/useTabScroll";

/**
 * Home Page (Refatorada)
 * DIP: Depende de abstrações (hooks) e não de implementações concretas de lógica.
 * SRP: Responsável apenas por orquestrar os componentes de alto nível.
 */
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Validação de Segurança
  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  // 2. Inicialização de Dados
  const initialTelas = useMemo(() => {
    return location.state?.telas ? Object.entries(location.state.telas) : [];
  }, [location.state]);

  // 3. Hooks Customizados (Encapsulamento de Lógica)
  const {
    rota,
    handleInputChange,
    handleSelectFile,
    handleExportCollection,
  } = useCollections(
    initialTelas,
    location.state?.id,
    location.state?.collectionName,
    location.state?.http
  );

  const { logsPorTela, handleExecuteRequest } = useRequestExecutor();

  const {
    navRef,
    canScrollLeft,
    canScrollRight,
    checkScroll,
    scrollLeft,
    scrollRight,
  } = useTabScroll();

  // 4. Estados de UI
  const [activeKey, setActiveKey] = useState(
    initialTelas.length > 0 ? initialTelas[0][0] : ""
  );

  // 5. IPC Menu Action (Ouvinte Universal)
  useEffect(() => {
    if (window.electronAPI?.onMenuAction) {
      const unsubscribe = window.electronAPI.onMenuAction((action) => {
        if (action === "save-file") {
          handleExportCollection();
        }
      });
      return () => unsubscribe();
    }
  }, [handleExportCollection]);

  if (!location.state) return null;

  return (
    <div className="d-flex flex-column h-screen bg-zinc text-gray-200">
      <Tab.Container
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k)}
        id="main-tabs"
      >
        {/* Header com Navegação */}
        <Row className="flex-grow-0 g-0">
          <Col>
            <CollectionsTabs
              rota={rota}
              activeKey={activeKey}
              onSelect={setActiveKey}
              scrollRef={navRef}
              onScroll={checkScroll}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              scrollLeft={scrollLeft}
              scrollRight={scrollRight}
            />
          </Col>
        </Row>

        {/* Conteúdo Principal */}
        <Row className="flex-grow-1 g-0 overflow-hidden">
          <Col className="h-100">
            <div className="h-100 bg-zinc-800 rounded-tr-xl shadow-lg flex flex-col">
              <Tab.Content className="flex-grow-1 overflow-auto">
                {rota.map(([screenKey, telaData], index) => (
                  <Tab.Pane className="h-100" key={screenKey} eventKey={screenKey}>
                    <RequestPanel
                      screenKey={screenKey}
                      telaData={telaData}
                      index={index}
                      logs={logsPorTela[screenKey]}
                      onInputChange={handleInputChange}
                      onSelectFile={handleSelectFile}
                      onExecute={handleExecuteRequest}
                      onExport={handleExportCollection}
                    />
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </div>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}
