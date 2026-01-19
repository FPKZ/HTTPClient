import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

/**
 * DropZone
 * Componente visual para área de Drag & Drop.
 * Agora puramente apresentacional, sem lógica de Dialog.
 */
const DropZone = ({ onFileDrop, onFolderSelect }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Electron specific: file.path exists
      const filePath = window.electronAPI ? window.electronAPI.getFilePath(file) : null;
      if (filePath) {
        onFileDrop(filePath, file.name);
      }
    }
  };

  return (
    <div
      id="drop-zone"
      className={`d-flex flex-column justify-content-center align-items-center text-center p-5 border rounded transition-all ${
        isHovering ? 'bg-[#131313] border-primary' : 'bg-[#1b1b1b] border-[#313131]!'
      }`}
      style={{ borderStyle: 'dashed'}}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="mb-2 text-gray-300">Arraste arquivos .json aqui</p>
      <p className="text-secondary mb-3 text-sm">ou</p>
      <Button variant="primary" onClick={onFolderSelect}>
        Selecionar arquivo .json
      </Button>
    </div>
  );
};

export default DropZone;
