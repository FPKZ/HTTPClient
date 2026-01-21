import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

/**
 *
 * @param {string} title - Título do modal.
 * @param {string} description - Descrição do modal.
 * @param {React.ReactNode} trigger - Trigger do modal.
 * @param {React.ReactNode} children - Conteúdo do modal.
 * @param {boolean} open - Estado do modal.
 * @param {function} onOpenChange - Função a ser chamada quando o estado do modal mudar.
 * @param {Array<{label: string, onClick: function, className?: string, disabled?: boolean}>} buttons - Botões customizados.
 */
export default function EstruturaModal({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  buttons,
}) {
  // const setDraggingDisabled = useTabStore((state) => state.setDraggingDisabled);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-overlayShow z-50" />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 
            w-[80vw] max-w-[700px] p-6 max-h-[95vh] overflow-y-auto
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-xl 
            focus:outline-none z-50  data-[state=open]:animate-contentShow
          "
        >
          <Dialog.Title className="text-lg font-bold mb-4">
            {title}
          </Dialog.Title>
          {/* <Dialog.Description className="text-sm mb-4">
                        Adicione uma nova collection para organizar suas requisições.
                    </Dialog.Description> */}
          {/* <input type="text" placeholder="Nome da collection" className="w-full p-2 border rounded mb-4 !border-zinc-800" /> */}
          <Dialog.Description>{description}</Dialog.Description>
          {children}
          <div className="flex justify-end gap-2">
            {buttons?.map((button, index) => (
              <Dialog.Close asChild key={index}>
                <button
                  className={cn(
                    "bg-zinc-800 text-zinc-200 font-semibold px-4 py-2 rounded mr-2",
                    button.className,
                  )}
                  onClick={button.onClick}
                >
                  {button.label}
                </button>
              </Dialog.Close>
            ))}
            {/* <Dialog.Close asChild>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onAdd}>Salvar</button>
            </Dialog.Close> */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
