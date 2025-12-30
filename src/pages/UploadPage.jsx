import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import TitleBar from "../components/TitleBar";
import DropZone from "../components/DropZone";
import LogConsole from "../components/LogConsole";
import { useNavigate } from "react-router-dom";


function UploadPage() {
  // eslint-disable-next-line no-unused-vars
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for logs
    if (window.electronAPI) {
      window.electronAPI.onLog((message) => {
        setLogs((prev) => [...prev, message]);
      });

      window.electronAPI.onFinished((result) => {
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
    }
  }, [navigate]);

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

        {/* <LogConsole logs={logs} /> */}
        {/* <Button onClick={handleTest}>Test</Button> */}
      </Container>
      <div className="position-absolute bottom-0 end-0 px-2">
        <span className="text-xs text-[#cecece]">v1.0.10</span>
      </div>
    </div>
  );
}

export default UploadPage;
