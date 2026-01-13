import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import useDialogStore from "../store/useDialogStore";

export default function Dialog() {
  const { open, title, description, options, handleAction, closeDialog } =
    useDialogStore();

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(val) => !val && closeDialog()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/60 z-[100] animate-overlayShow" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-xl z-[101] border !border-zinc-800 focus:outline-none">
          <DialogPrimitive.Title className="text-lg font-bold text-white mb-2">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-zinc-400 text-sm mb-6">
            {description}
          </DialogPrimitive.Description>
          <div className="flex justify-end gap-3">
            {options.map((option, idx) => (
              <button
                key={`${option.label}-${idx}`}
                className={`
                  px-4 py-2 rounded text-xs font-bold
                  transition-colors
                  ${
                    option.variant === "danger"
                      ? "bg-red-600 hover:bg-red-700! text-white!"
                      : option.label === "cancelar" ||
                        option.variant === "secondary"
                      ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-800! text-zinc-300!"
                      : "bg-white hover:bg-zinc-900! border border-white! text-zinc-700 hover:text-zinc-300!"
                  }
                `}
                onClick={() => handleAction(option)}
              >
                <div className="capitalize">{option.label}</div>
              </button>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
