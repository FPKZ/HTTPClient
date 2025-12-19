import React, { useState } from "react"; // useEffect removido, não é necessário aqui
import { Button, Tab, Row, Col, Nav, Form } from "react-bootstrap"; // Container e Tabs removidos (não usados com Tab.Container)
import { useNavigate, useLocation } from "react-router-dom";
import LogConsole from "../components/LogConsole";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Validação de segurança: se não tiver estado, redireciona e retorna NULL para não renderizar nada
  if (!location.state) {
    // É importante fazer isso dentro de um useEffect na vida real para evitar warning,
    // mas para este exemplo, certifique-se que o return null pare a execução.
    // O ideal seria: useEffect(() => navigate('/'), []) e retornar null aqui.
    navigate("/");
    return null;
  }

  const data = location.state;
  // O user não estava sendo usado no exemplo, mas mantive
  // const user = data.user;
  const rota = Object.entries(data.telas);

  // console.log(data)

  // 2. Inicialize o estado DIRETAMENTE.
  // Não use useEffect para isso, ou a variável começa undefined e quebra a lógica do "isActive".
  const [activeKey, setActiveKey] = useState(rota[0][0]);
  const [activeRota, setActiveRota] = useState("headers");

  const handleTest = () => {
    navigate("/upload");
  };

  return (
    <div className="d-flex flex-column h-screen bg-zinc text-gray-200">
      {/* 3. Use 'activeKey' em vez de 'defaultActiveKey' para ter controle total visual */}
      <Tab.Container
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k)}
        id="folder-tab-example"
      >
        <Row className="g-0">
          <Col>
            <Nav className="border-none pl-1">
              {
                // eslint-disable-next-line no-unused-vars
                rota.map(([key, tela]) => {
                  // A lógica manual garante que sabemos exatamente quem está ativo
                  const isActive = activeKey === key;

                  return (
                    <Nav.Item key={key}>
                      <Nav.Link
                        eventKey={key}
                        // OBSERVE O USO DO '!' (Exclamation Mark)
                        // Isso força o Tailwind a sobrescrever o Bootstrap
                        // Adicionando style como garantia para validação visual imediata
                        // style={{
                        //     backgroundColor: isActive ? '#27272a' : 'transparent', // zinc-800
                        //     color: isActive ? '#eab308' : '#6b7280' // yellow-500 : gray-500
                        // }}
                        className={`
                                                px-2 py-0 mr-1 font-bold tracking-wide uppercase
                                                rounded-t-lg transition-colors border-0
                                                cursor-pointer no-underline!
                                                ${
                                                  isActive
                                                    ? "bg-zinc-800! text-yellow-500!" // Sintaxe v4: utility!
                                                    : "bg-transparent! text-gray-500! hover:text-gray-300!"
                                                }
                                            `}
                      >
                        <small style={{ fontSize: "0.7rem" }}>{key}</small>
                      </Nav.Link>
                    </Nav.Item>
                  );
                })
              }
            </Nav>
          </Col>
        </Row>

        <Row className="flex-grow-1 g-0">
          <Col className="h-100">
            <div className="h-100 bg-zinc-800 rounded-tr-xl shadow-lg">
              <Tab.Content className="h-100">
                {rota.map((tela, index) => (
                  <Tab.Pane className="h-100" key={index} eventKey={tela[0]}>
                    <div className="h-100 d-flex flex-column">
                      <div className="border-bottom !border-zinc-700 p-2">
                        <Tab.Container
                          className=""
                          activeKey={activeRota}
                          onSelect={(k) => setActiveRota(k)}
                        >
                          <Row className="">
                            <Col className="">
                              <div className="d-flex flex-column gap-2 py-2">
                                <div className="d-flex gap-2 bg-neutral-950 p-2 rounded">
                                  <small>URL: </small>
                                  <small>{tela[1].request.url}</small>
                                </div>
                                <div className="d-flex gap-2 bg-neutral-950 p-2 rounded">
                                  <small>Method: </small>
                                  <small>{tela[1].request.method}</small>
                                </div>
                              </div>
                              <div className="flex items-end justify-between">
                                <Nav className="border-none">
                                    {
                                    // console.log(tela[1].request)
                                    Object.entries(tela[1].request).map(
                                        ([key, value]) => {
                                        //   console.log(tela[1].request);
                                        if (key !== "url" && key !== "method") {
                                            // activeRota === null && setActiveRota(key)
                                            if(!value) return;
                                            const isActive = activeRota === key;
                                            return (
                                            <Nav.Item key={key}>
                                                <Nav.Link
                                                eventKey={key}
                                                // OBSERVE O USO DO '!' (Exclamation Mark)
                                                // Isso força o Tailwind a sobrescrever o Bootstrap
                                                // Adicionando style como garantia para validação visual imediata
                                                style={{
                                                    backgroundColor: isActive
                                                    ? "#141414"
                                                    : "transparent", // zinc-800
                                                    // color: isActive ? '#eab308' : '#6b7280' // yellow-500 : gray-500
                                                    border: isActive
                                                    ? "1px solid rgba(49, 49, 49, 1)"
                                                    : "",
                                                    borderBottom: isActive
                                                    ? "none"
                                                    : "",
                                                }}
                                                className={`
                                                        px-2 py-0 font-bold tracking-wide uppercase
                                                        transition-colors 
                                                        cursor-pointer no-underline!
                                                        ${
                                                        isActive
                                                            ? "text-yellow-500!" // Sintaxe v4: utility!
                                                            : "text-gray-500! hover:text-gray-300!"
                                                        }
                                                    `}
                                                >
                                                <small
                                                    style={{ fontSize: "0.7rem" }}
                                                >
                                                    {key}
                                                </small>
                                                </Nav.Link>
                                            </Nav.Item>
                                            );
                                        }
                                        }
                                    )
                                    }
                                </Nav>
                                <button
                                    className="text-amber-100 bg-[#c28a10] py-1 px-2 my-2 border rounded"
                                    style={{
                                        fontSize: "0.7rem",
                                    }}
                                    onClick={handleTest}
                                >
                                    Executar
                                </button>
                              </div>
                            </Col>
                          </Row>

                          <Row className="min-h-50">
                            <Col>
                              <Tab.Content className="h-100">
                                {Object.entries(tela[1].request).map(
                                  ([key, value]) => {
                                    // console.log(key, value)
                                    if (key !== "url" && key !== "method") {
                                      return (
                                        <Tab.Pane
                                          key={key}
                                          eventKey={key}
                                          className="h-100 rounded-b p-2"
                                          style={{
                                            backgroundColor: "#141414",
                                            border:
                                              "1px solid rgba(49, 49, 49, 1)",
                                            borderTop: "none",
                                          }}
                                        >
                                          <div className="d-flex flex-col gap-2">
                                            {value &&
                                              Object.entries(value || {}).map(
                                                ([key, value]) => {
                                                  console.log(key, value);
                                                  return (
                                                    <div className="d-flex gap-2 bg-neutral-950 p-2 rounded">
                                                      <small style={{ fontSize: "0.7rem"}}>
                                                        {key}:
                                                      </small>
                                                      <small className="flex-1" style={{ fontSize: "0.7rem"}}>
                                                        {value && 
                                                        <input 
                                                            type="text"
                                                            className="w-100 focus:outline-none"
                                                            value={
                                                                typeof value === "object" ? JSON.stringify(value) 
                                                                : value ? value : "null"
                                                            } 
                                                        />
                                                        }
                                                      </small>
                                                    </div>
                                                  );
                                                }
                                              )}
                                          </div>
                                        </Tab.Pane>
                                      );
                                    }
                                  }
                                )}
                              </Tab.Content>
                            </Col>
                          </Row>
                        </Tab.Container>

                        {/* <div className="grid grid-cols-3 gap-4 h-full">
                                                    <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                                    <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                                    <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                                </div>     */}
                      </div>

                      <Col className="mt-auto flex flex-col items-end p-2 gap-2 overflow-auto">
                        <div
                          className="flex-shrink-1 w-100 h-100 bg-black"
                          style={{ overflowY: "auto", minHeight: "100px" }}
                        >
                          {Array.from({ length: 100 }).map((_, index) => (
                            <div
                              key={index}
                              className="log-entry border-b border-zinc-900 py-1 px-2 text-sm text-gray-400 text-break"
                            >
                              Log entry {index + 1}
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="primary"
                          className="w-100"
                          onClick={handleTest}
                        >
                          Ação na tela {tela.name}
                        </Button>
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
