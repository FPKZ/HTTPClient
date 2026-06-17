import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface ModalButton {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface EstruturaModalProps {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttons?: ModalButton[];
}

/**
 * Componente estrutural para modais.
 */
export default function EstruturaModal({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  buttons,
}: EstruturaModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-overlayShow z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="
            fixed left-1/2 top-1/2 
            w-[80vw] max-w-[700px] p-6 max-h-[95vh] overflow-y-auto
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-xl 
            focus:outline-none z-50 data-[state=open]:animate-contentShow
          "
        >
          <Dialog.Title className="text-lg font-bold mb-4">
            {title}
          </Dialog.Title>
          
          <Dialog.Description className="sr-only">
            {description || title}
          </Dialog.Description>
          
          {description && <div className="text-sm text-zinc-400 mb-4">{description}</div>}
          
          {children}
          
          <div className="flex justify-end gap-2 mt-4">
            {buttons?.map((button, index) => (
              <Dialog.Close asChild key={index}>
                <button
                  disabled={button.disabled}
                  className={cn(
                    "bg-zinc-800 text-zinc-200 font-semibold px-4 py-2 rounded transition-colors",
                    button.className,
                  )}
                  onClick={button.onClick}
                >
                  {button.label}
                </button>
              </Dialog.Close>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
