import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import DropZone from "../DropZone";

interface ImportCollectionModalProps {
  children: React.ReactNode;
  onImport: (path: string, isFile: boolean) => void;
  onFolderSelect: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * ImportCollectionModal
 * Modal utilizando Radix UI que encapsula a lógica de importação de arquivo.
 */
export default function ImportCollectionModal({
  children,
  onImport,
  onFolderSelect,
  open,
  onOpenChange,
}: ImportCollectionModalProps) {
  const handleFileDrop = (path: string) => {
    onImport(path, true);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 animate-in fade-in duration-200 z-50!" />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 
            w-[80vw] max-w-[700px] p-6 max-h-[95vh] overflow-y-auto
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-xl 
            focus:outline-none z-50 data-[state=open]:animate-contentShow
          "
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-gray-100 m-0">
              Importar Coleção
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-100 transition-colors p-1 rounded-full hover:bg-zinc-800 border-none bg-transparent cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-gray-400 text-sm mb-5">
            Selecione ou arraste um arquivo JSON para importar sua coleção.
          </Dialog.Description>

          <DropZone
            onFileDrop={handleFileDrop}
            onFolderSelect={onFolderSelect}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
