import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

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
      // In Electron/React, file object exposes path property but we might need webUtils in newer electron versions
      // For now, let's just pass the path. 
      // Note: In standard browser React, 'path' is not available, but in Electron it is.
      // However, we used webUtils.getPathForFile in preload, so let's try to use that if we can pass the file object.
      // Actually app can receive path strings directly if dropped from OS.
      const filePath = window.electronAPI.getFilePath(file);
      onFileDrop(filePath, file.name);
    }
  };

  return (
    <div
      id="drop-zone"
      className={`d-flex flex-column justify-content-center align-items-center text-center p-5 my-3 border rounded transition-all ${isHovering ? 'bg-dark border-primary' : 'border-secondary'}`}
      style={{ borderStyle: 'dashed', minHeight: '150px' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="mb-2">Arraste arquivos .json ou pastas aqui</p>
      <p className="text-secondary mb-3">ou</p>
      <Button variant="primary" onClick={onFolderSelect}>
        Selecionar Pasta para Varrer
      </Button>
    </div>
  );
};

export default DropZone;
