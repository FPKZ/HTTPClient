import React, { useState } from 'react';

/**
 * DropZone
 * Componente visual para área de Drag & Drop.
 * Agora puramente apresentacional, sem lógica de Dialog.
 */

interface DropZoneProps {
  onFileDrop: (path: string, name: string) => void;
  onFolderSelect: () => void;
}

const DropZone = ({ onFileDrop, onFolderSelect }: DropZoneProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Electron specific: file.path exists
      const filePath = (window as any).electronAPI ? (window as any).electronAPI.getFilePath(file) : null;
      if (filePath) {
        onFileDrop(filePath, file.name);
      }
    }
  };

  return (
    <div
      id="drop-zone"
      className={`flex flex-col justify-center items-center text-center p-5 border rounded transition-all ${
        isHovering ? 'bg-[#131313] border-blue-500' : 'bg-[#1b1b1b] border-[#313131]'
      }`}
      style={{ borderStyle: 'dashed'}}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="mb-2 text-gray-300">Arraste arquivos .json aqui</p>
      <p className="text-zinc-500 mb-3 text-sm">ou</p>
      <button
        onClick={onFolderSelect}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors cursor-pointer"
      >
        Selecionar arquivo .json
      </button>
    </div>
  );
};

export default DropZone;
