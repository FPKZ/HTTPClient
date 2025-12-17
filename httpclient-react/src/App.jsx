import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import TitleBar from './components/TitleBar';
import DropZone from './components/DropZone';
import LogConsole from './components/LogConsole';

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Listen for logs
    if (window.electronAPI) {
      window.electronAPI.onLog((message) => {
        setLogs((prev) => [...prev, message]);
      });

      window.electronAPI.onFinished((result) => {
        if (result.success) {
           // Optional: Show a success alert or toast
           console.log("Converstion finished successfully");
        }
      });
    }
  }, []);

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
    
    // Ask for output location
    const outputPath = await window.electronAPI.selectSaveLocation();
    
    // Start conversion
    window.electronAPI.startConversion({
      inputPath,
      outputPath,
      isFile
    });
  };

  return (
    <div className="d-flex flex-column vh-100">
      <TitleBar />
      <Container fluid className="d-flex flex-column flex-grow-1 p-3" style={{ overflow: 'hidden' }}>
        <h1 className="text-center mb-4">HTTPClient</h1>
        
        <DropZone 
          onFileDrop={handleFileDrop} 
          onFolderSelect={handleFolderSelect} 
        />
        
        <LogConsole logs={logs} />
      </Container>
    </div>
  );
}

export default App;
