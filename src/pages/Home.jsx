import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button, Tab, Row, Col, Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import LogConsole from "../components/LogConsole";

import AutoResizeTextarea from "../components/AutoResizeTextarea";
import ResultRequestLog from "../components/ResultRequestLog";

function RequestComponents({
  subKey,
  subValue,
  index,
  onInputChange,
  onSelectFile,
}) {
  if (subKey === "url" || subKey === "method" || !subValue) return null;

  // Se subValue for uma string (ex: body raw), renderiza um único campo editável
  if (typeof subValue === "string") {
    return (
      <div className="d-flex flex-column gap-2">
        <div className="d-flex gap-2 bg-neutral-950 p-2 rounded align-items-start">
          <AutoResizeTextarea
            className="w-100 bg-transparent text-gray-300 focus:outline-none border-none p-0"
            style={{ fontSize: "0.7rem" }}
            value={subValue}
            onChange={(e) => onInputChange(index, subKey, null, e.target.value)}
          />
        </div>
      </div>
    );
  }

  function renderField(fieldKey, fieldValue) {
    switch (typeof fieldValue) {
      case "object":
        return (
          <pre
            className="permitirSelect text-gray-300 bg-zinc-900/50 p-2 w-100 rounded"
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              wordBreak: "break-all",
              maxWidth: "100%",
            }}
          >
            {JSON.stringify(fieldValue, null, 2)}
          </pre>
        );
      default:
        return (
          <>
            <AutoResizeTextarea
              className="w-100 bg-transparent text-gray-300 focus:outline-none border-none p-0"
              style={{ fontSize: "0.7rem" }}
              value={fieldValue}
              onChange={(e) =>
                onInputChange(index, subKey, fieldKey, e.target.value)
              }
            />
            <Edit size={12} className="text-zinc-700" />
          </>
        );
    }
  }

  // Se for um objeto (ex: headers ou body JSON/FormData)
  return (
    <div className="d-flex flex-column gap-2">
      {Object.entries(subValue).map(([fieldKey, fieldValue]) => (
        <div key={fieldKey}>
          <div className="d-flex gap-2 bg-neutral-950 p-2 rounded align-items-center">
            <small
              className="text-zinc-500"
              style={{ minWidth: "100px", fontSize: "0.7rem" }}
            >
              {fieldKey}:
            </small>
            <div className="flex-grow-1 d-flex align-items-start gap-2">
              {fieldKey === "Content-Type" ? (
                <small className="text-gray-400">{fieldValue}</small>
              ) : (
                <>{renderField(fieldKey, fieldValue)}</>
              )}
            </div>
          </div>
          {typeof fieldValue === "object" && fieldValue?.src && (
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-1 w-full"
              style={{ fontSize: "0.6rem" }}
              onClick={() => onSelectFile({ index, subKey, fieldKey })}
            >
              Select File
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  // 1. Validação de segurança e Redirecionamento
  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  // 2. Inicialização de Estados
  // Usamos o state do location como fonte inicial
  const initialTelas = useMemo(() => {
    return location.state?.telas ? Object.entries(location.state.telas) : [];
  }, [location.state]);

  const [rota, setRota] = useState(initialTelas);
  const [activeKey, setActiveKey] = useState(
    initialTelas.length > 0 ? initialTelas[0][0] : ""
  );
  const [activeRota, setActiveRota] = useState("headers");
  const [logsPorTela, setLogsPorTela] = useState({});

  // Estados para controle de scroll
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 3. Lógica de Scroll dos Tabs Superiores
  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollWidth - (scrollLeft + clientWidth) > 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [rota]);

  const scrollLeft = () => {
    navRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    navRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // 4. Manipulação de Dados (Edição)
  const handleInputChange = (screenIndex, sectionKey, fieldKey, newValue) => {
    setRota((prevRota) => {
      const newRota = [...prevRota];
      const [screenName, screenData] = newRota[screenIndex];

      let updatedSection;
      if (fieldKey === null) {
        // Substitui a seção inteira (ex: body string)
        updatedSection = newValue;
      } else {
        // Atualiza um campo específico (ex: um header)
        const currentSection =
          typeof screenData.request[sectionKey] === "object"
            ? screenData.request[sectionKey]
            : {};

        updatedSection = {
          ...currentSection,
          [fieldKey]: newValue,
        };
      }

      const newScreenData = {
        ...screenData,
        request: {
          ...screenData.request,
          [sectionKey]: updatedSection,
        },
      };

      newRota[screenIndex] = [screenName, newScreenData];
      return newRota;
    });
  };

  // const handleTest = () => {
  //   navigate("/upload");
  // };

  const handleExecuteRequest = async (screenKey, requestData) => {
    if (!window.electronAPI) return;
    try {
      const response = await window.electronAPI.request({
        url: requestData.url,
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      setLogsPorTela((prev) => ({
        ...prev,
        [screenKey]: [response],
      }));
    } catch (error) {
      setLogsPorTela((prev) => ({
        ...prev,
        [screenKey]: [
          {
            status: 500,
            statusText: "Error",
            data: error.message,
            isError: true,
            headers: {},
          },
        ],
      }));
    }
  };

  const handleSelectFile = async ({ index, subKey, fieldKey }) => {
    if (!window.electronAPI) return;
    const filePath = await window.electronAPI.selectFile();
    if (!filePath) return;
    // console.log(filePath);
    setRota((prevRota) => {
      const newRota = [...prevRota];
      //   console.log(newRota[index])
      const [screenName, screenData] = newRota[index];
      //   console.log(screenName, screenData)
      newRota[index] = [
        screenName,
        {
          ...screenData,
          request: {
            ...screenData.request,
            [subKey]: {
              ...screenData.request[subKey],
              [fieldKey]: {
                ...screenData.request[subKey][fieldKey],
                src: filePath,
              },
            },
          },
        },
      ];
      //   console.log(screenData.request[subKey][fieldKey])
      return newRota;
    });
  };

  if (!location.state) return null;

  return (
    <div className="d-flex flex-column h-screen bg-zinc text-gray-200">
      <Tab.Container
        activeKey={activeKey}
        onSelect={(k) => {
          setActiveKey(k);
          setActiveRota("headers");
        }}
        id="main-tabs"
      >
        {/* Header com Navegação Scrollable */}
        <Row className="flex-grow-0 g-0">
          <Col>
            <div className="d-flex align-items-end position-relative">
              {canScrollLeft && (
                <Button
                  variant="link"
                  onClick={scrollLeft}
                  className="text-white bg-[#1e1e1ede]! rounded-0 px-1 z-10 position-absolute left-0"
                >
                  <ChevronLeft size={20} />
                </Button>
              )}

              <div className="flex-grow-1 overflow-hidden">
                <Nav
                  ref={navRef}
                  onScroll={checkScroll}
                  className="border-none pl-1 flex-nowrap overflow-x-auto whitespace-nowrap"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {rota.map(([key]) => {
                    const isActive = activeKey === key;

                    return (
                      <Nav.Item key={key}>
                        <Nav.Link
                          eventKey={key}
                          className={`px-3 py-1 mr-1 font-bold tracking-wide uppercase rounded-t-lg transition-colors border-0 cursor-pointer no-underline! ${
                            isActive
                              ? "bg-zinc-800! text-yellow-500!"
                              : "bg-transparent! text-gray-500! hover:text-gray-300!"
                          }`}
                        >
                          <small style={{ fontSize: "0.7rem" }}>{key}</small>
                        </Nav.Link>
                      </Nav.Item>
                    );
                  })}
                </Nav>
              </div>

              {canScrollRight && (
                <Button
                  variant="link"
                  onClick={scrollRight}
                  className="text-white bg-[#1e1e1ede]! rounded-0 px-1  z-10 position-absolute right-0"
                >
                  <ChevronRight size={20} />
                </Button>
              )}
            </div>
          </Col>
        </Row>

        {/* Conteúdo Principal */}
        <Row className="flex-grow-1 g-0 overflow-hidden">
          <Col className="h-100">
            <div className="h-100 bg-zinc-800 rounded-tr-xl shadow-lg flex flex-col">
              <Tab.Content className="flex-grow-1 overflow-auto">
                {rota.map(([screenKey, telaData], index) => (
                  <Tab.Pane
                    className="h-100"
                    key={screenKey}
                    eventKey={screenKey}
                  >
                    <div className="h-100 d-flex flex-column">
                      <div className="border-bottom !border-zinc-700 p-3">
                        {/* URL e Method info */}
                        <div className="d-flex flex-column gap-2 mb-1">
                          <div className="d-flex items-center gap-2 bg-neutral-950 p-2 rounded">
                            <small className="text-gray-500">URL:</small>
                            <small>{telaData.request.url}</small>
                          </div>
                          <div className="d-flex items-center gap-2 bg-neutral-950 p-2 rounded">
                            <small className="text-gray-500">Method:</small>
                            <small className="text-green-400">
                              {telaData.request.method}
                            </small>
                          </div>
                        </div>

                        {/* Sub-navegação (Headers, Body, etc) */}
                        <Tab.Container
                          activeKey={activeRota}
                          onSelect={(k) => setActiveRota(k)}
                        >
                          <div className="flex items-end justify-between">
                            <Nav className="border-none">
                              {Object.entries(telaData.request).map(
                                ([subKey, subValue]) => {
                                  if (
                                    subKey === "url" ||
                                    subKey === "method" ||
                                    !subValue
                                  )
                                    return null;
                                  const isActive = activeRota === subKey;
                                  return (
                                    <Nav.Item key={subKey}>
                                      <Nav.Link
                                        eventKey={subKey}
                                        style={{
                                          backgroundColor: isActive
                                            ? "#141414"
                                            : "transparent",
                                        }}
                                        className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer no-underline! ${
                                          isActive
                                            ? "text-yellow-500!"
                                            : "text-gray-500! hover:text-gray-300!"
                                        }`}
                                      >
                                        <small style={{ fontSize: "0.65rem" }}>
                                          {subKey}
                                        </small>
                                      </Nav.Link>
                                    </Nav.Item>
                                  );
                                }
                              )}
                            </Nav>
                            <button
                              className="text-amber-100 bg-[#c28a10] hover:bg-[#a6760d] h-7 w-19 mb-1 rounded font-bold transition-colors"
                              onClick={() =>
                                handleExecuteRequest(
                                  screenKey,
                                  telaData.request
                                )
                              }
                            >
                              <small className="!text-xs">Executar</small>
                            </button>
                          </div>

                          {/* Conteúdo da Sub-navegação com Inputs Editáveis */}
                          <Tab.Content className="mt-0">
                            {Object.entries(telaData.request).map(
                              ([subKey, subValue]) => {
                                return (
                                  <Tab.Pane
                                    key={subKey}
                                    eventKey={subKey}
                                    className="p-3 bg-[#141414] rounded-b"
                                  >
                                    <RequestComponents
                                      subKey={subKey}
                                      subValue={subValue}
                                      index={index}
                                      onInputChange={handleInputChange}
                                      onSelectFile={handleSelectFile}
                                    />
                                  </Tab.Pane>
                                );
                              }
                            )}
                          </Tab.Content>
                        </Tab.Container>
                      </div>

                      {/* Console / Logs Area */}
                      <Col className="mt-auto flex flex-col items-end p-3 gap-2 overflow-auto">
                        <ResultRequestLog logs={logsPorTela[screenKey] || []} />
                        {/* <Button
                          variant="primary"
                          className="w-100 py-2 font-bold uppercase"
                          style={{ fontSize: "0.8rem" }}
                          onClick={() =>
                            handleExecuteRequest(screenKey, telaData.request)
                          }
                        >
                          Executar {screenKey}
                        </Button> */}
                      </Col>
                    </div>
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
