import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
// import useTabStore from "../../store/useTabStore";

export default function EstruturaModal({ title, description, trigger, children, onAdd, open, onOpenChange }) {
  // const setDraggingDisabled = useTabStore((state) => state.setDraggingDisabled);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-overlayShow z-50" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 max-h-[85vh] w-[80vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-xl focus:outline-none z-50 border !border-zinc-800 data-[state=open]:animate-contentShow"
        >
          <Dialog.Title className="text-lg font-bold mb-4">
            {title}
          </Dialog.Title>
          {/* <Dialog.Description className="text-sm mb-4">
                        Adicione uma nova collection para organizar suas requisições.
                    </Dialog.Description> */}
          {/* <input type="text" placeholder="Nome da collection" className="w-full p-2 border rounded mb-4 !border-zinc-800" /> */}
          <Dialog.Description>
            {description}
          </Dialog.Description>
         {children}
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded mr-2">
                Cancelar
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onAdd}>Salvar</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
