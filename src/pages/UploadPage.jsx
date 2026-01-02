import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import TitleBar from "../components/TitleBar";
import DropZone from "../components/DropZone";
import LogConsole from "../components/LogConsole";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";


function UploadPage() {
  // eslint-disable-next-line no-unused-vars
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca o histórico inicial
    if (window.electronAPI && window.electronAPI.getHistory) {
      window.electronAPI.getHistory().then((data) => {
        setHistory(data || []);
      });
    }

    // Listen for logs
    if (window.electronAPI) {
      const unLog = window.electronAPI.onLog((message) => {
        setLogs((prev) => [...prev, message]);
      });

      const unFinished = window.electronAPI.onFinished((result) => {
        if (result.success && result.results && result.results.length > 0) {
          // Pega o primeiro resultado (assumindo um arquivo por vez por enquanto)
          const data = result.results[0];

          // Navega para a Home passando os dados convertidos
          navigate("/", {
            state: {
              user: { userId: 123, nome: "User" }, // Placeholder
              telas: data.axios,
              http: data.http,
              collectionName: data.name,
            },
          });
        }
      });

      return () => {
        unLog && unLog();
        unFinished && unFinished();
      };
    }
  }, [navigate]);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onRequestSaveSession) {
      const unsubscribe = window.electronAPI.onRequestSaveSession(() => {
        // Nada para salvar na UploadPage, apenas confirma o fechamento
        window.electronAPI.saveAndQuit({});
      });
      return () => unsubscribe && unsubscribe();
    }
  }, []);

  const handleLoadHistory = async (item) => {
    if (!window.electronAPI) return;
    const content = await window.electronAPI.loadCollection(item.file);
    if (content) {
      navigate("/", {
        state: {
          id: item.id, // Passa o ID para que a Home saiba o que atualizar ao fechar
          user: { userId: 123, nome: "User" },
          telas: content.axios,
          http: content.http,
          collectionName: item.collectionName,
        },
      });
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation(); // Evita abrir a coleção ao clicar no lixo
    if (window.confirm("Tem certeza que deseja remover este item do histórico?")) {
      await window.electronAPI.deleteHistoryItem(id);
      // Recarrega o histórico localmente
      const updatedHistory = await window.electronAPI.getHistory();
      setHistory(updatedHistory || []);
    }
  };

  const handleFileDrop = (path) => {
    startConversion(path, true);
  };

  const handleFolderSelect = async () => {
    if (!window.electronAPI) return;
    const path = await window.electronAPI.selectFile();
    if (path) {
      startConversion(path, true);
    }
  };

  const startConversion = async (inputPath, isFile) => {
    if (!window.electronAPI) return;

    // Clear logs
    setLogs([]);

    // Não pede mais local de salvamento, processa em memória
    // const outputPath = await window.electronAPI.selectSaveLocation();

    // Start conversion
    window.electronAPI.startConversion({
      inputPath,
      // outputPath, // Removido
      isFile,
    });
  };

  // const handleTest = () => {
  //   // navigate('/', { replace: true }); // replace: limpa o historico de navegacao
  //   // navigate("/", {
  //   //   state: { user: { userId: 123, nome: "Felipe" }, telas: request },
  //   // });
  //   window.electronAPI.request({
  //     url: "https://core-sistema-dev.peruibe.sp.gov.br/api/v1/auth/token",
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: {
  //       "tokenAcessoId": "d730e1cc29cf", 
  //       "tokenAcessoSenha": "GAwCtR{^7BriJ4h'6q"
  //     },
  //   });
  // };
  return (
    <div className="d-flex flex-column h-100 position-relative">
      <Container
        fluid
        className="d-flex flex-column justify-center flex-grow-1 p-3 gap-3"
        style={{ overflow: "hidden", maxWidth: "900px" }}
      >
        <h1 className="text-center mb-4">HTTPClient</h1>

        <DropZone
          onFileDrop={handleFileDrop}
          onFolderSelect={handleFolderSelect}
        />

        {history.length > 0 && (
          <div className="mt-4">
            <h6 className="text-gray-400 mb-3 uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Arquivos Recentes</h6>
            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '250px' }}>
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleLoadHistory(item)}
                  className="d-flex items-center justify-between rounded-1 p-2 bg-zinc-900/50 hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <div className="d-flex flex-column">
                    <span className="text-zinc-200 font-medium" style={{ fontSize: '0.8rem' }}>{item.collectionName}</span>
                    <small className="text-zinc-500" style={{ fontSize: '0.65rem' }}>
                      {new Date(item.updatedAt).toLocaleString('pt-BR')} • {item.sourceType}
                    </small>
                  </div>
                  <div className="d-flex items-center gap-3">
                    <div className="text-zinc-600 hover:text-yellow-500 transition-colors">
                      <small style={{ fontSize: '0.6rem' }}>ABRIR</small>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      className="p-1.5 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-colors border-none bg-transparent"
                      title="Excluir do histórico"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <LogConsole logs={logs} /> */}
        {/* <Button onClick={handleTest}>Test</Button> */}
      </Container>
      <div className="position-absolute bottom-0 end-0 px-2">
        <span className="text-xs text-[#cecece]">v1.0.11</span>
      </div>
    </div>
  );
}

export default UploadPage;
