import React, { useState } from 'react'; // useEffect removido, não é necessário aqui
import { Button, Tab, Row, Col, Nav } from 'react-bootstrap'; // Container e Tabs removidos (não usados com Tab.Container)
import { useNavigate, useLocation } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Validação de segurança: se não tiver estado, redireciona e retorna NULL para não renderizar nada
    if (!location.state) {
        // É importante fazer isso dentro de um useEffect na vida real para evitar warning, 
        // mas para este exemplo, certifique-se que o return null pare a execução.
        // O ideal seria: useEffect(() => navigate('/'), []) e retornar null aqui.
        navigate('/'); 
        return null; 
    }

    const data = location.state;
    // O user não estava sendo usado no exemplo, mas mantive
    // const user = data.user; 
    const telas = Object.values(data.telas);

    // 2. Inicialize o estado DIRETAMENTE. 
    // Não use useEffect para isso, ou a variável começa undefined e quebra a lógica do "isActive".
    const [activeKey, setActiveKey] = useState(telas[0]?.name); 

    const handleTest = () => {
        navigate('/upload');
    }

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
                            {telas.map((tela) => {
                                // A lógica manual garante que sabemos exatamente quem está ativo
                                const isActive = activeKey === tela.name;
                                
                                return (
                                    <Nav.Item key={tela.name}>
                                        <Nav.Link 
                                            eventKey={tela.name}
                                            // OBSERVE O USO DO '!' (Exclamation Mark)
                                            // Isso força o Tailwind a sobrescrever o Bootstrap
                                            // Adicionando style como garantia para validação visual imediata
                                            // style={{
                                            //     backgroundColor: isActive ? '#27272a' : 'transparent', // zinc-800
                                            //     color: isActive ? '#eab308' : '#6b7280' // yellow-500 : gray-500
                                            // }}
                                            className={`
                                                px-4 py-2 mr-2 font-bold text-sm tracking-wide uppercase
                                                rounded-t-lg transition-colors border-0
                                                cursor-pointer no-underline!
                                                ${isActive 
                                                    ? 'bg-zinc-800! text-yellow-500!' // Sintaxe v4: utility!
                                                    : 'bg-transparent! text-gray-500! hover:text-gray-300!' 
                                                }
                                            `}
                                        >
                                            {tela.name}
                                        </Nav.Link>
                                    </Nav.Item>
                                )
                            })}
                        </Nav>
                    </Col>
                </Row>

                <Row className='flex-grow-1 g-0'>
                    <Col className="h-100">
                        <div className="h-100 bg-zinc-800 rounded-b-xl rounded-tr-xl p-4 shadow-lg">
                            <Tab.Content className="h-100">
                                {telas.map((tela) => (
                                    <Tab.Pane
                                        className="h-100"
                                        key={tela.name}
                                        eventKey={tela.name}
                                    >
                                        <div className="h-100 d-flex flex-column">
                                            {/* Cabeçalho do conteúdo para confirmar visualmente */}
                                            <h2 className="text-white mb-4 border-b border-gray-600 pb-2">
                                                {tela.name}
                                            </h2>

                                            <div className="grid grid-cols-3 gap-4 h-full">
                                                <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                                <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                                <div className="bg-zinc-700/50 rounded-lg h-64 w-full"></div>
                                            </div>

                                            <div className="mt-auto pt-4">
                                                <Button variant="primary" className="w-100" onClick={handleTest}>
                                                    Ação na tela {tela.name}
                                                </Button>
                                            </div>
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