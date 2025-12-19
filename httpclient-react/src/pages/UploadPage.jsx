import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import TitleBar from "../components/TitleBar";
import DropZone from "../components/DropZone";
import LogConsole from "../components/LogConsole";
import { useNavigate } from "react-router-dom";

const request = {
  login: {
    name: "Login",
    request: {
      url: "asdasdasd",
      method: "GET",
      headers: {
        Authorization: "Bearer {{token}}",
        "Content-Type": "application/json",
      },
      body: null,
    },
  },
  profile: {
    name: "Profile",
    request: {
      url: "asdasfdgghg",
      method: "POST",
      headers: {
        Authorization: "Bearer {{token}}",
        "Content-Type": "application/json",
      },
      body: {
        name: "",
        contato: "",
        email: "",
        senha: "",
      },
    },
  },
  contact: {
    name: "Contact",
    request: {
      url: "asdasdasd",
      method: "PUT",
      headers: {
        Authorization: "Bearer {{token}}",
        "Content-Type": "application/json",
      },
      body: null,
    },
  },
};

function UploadPage() {
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

  const handleFileDrop = (path, name) => {
    startConversion(path, true);
  };

  const handleFolderSelect = async () => {
    if (!window.electronAPI) return;
    const path = await window.electronAPI.selectFolder();
    if (path) {
      startConversion(path, false);
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

  const handleTest = () => {
    // navigate('/', { replace: true }); // replace: limpa o historico de navegacao
    navigate("/", {
      state: { user: { userId: 123, nome: "Felipe" }, telas: request },
    });
  };
  return (
    <div className="d-flex flex-column h-100">
      <Container
        fluid
        className="d-flex flex-column flex-grow-1 p-3 gap-3"
        style={{ overflow: "hidden", maxWidth: "900px" }}
      >
        <h1 className="text-center mb-4">HTTPClient</h1>

        <DropZone
          onFileDrop={handleFileDrop}
          onFolderSelect={handleFolderSelect}
        />

        <LogConsole logs={logs} />
        <Button onClick={handleTest}>Test</Button>
      </Container>
    </div>
  );
}

export default UploadPage;
