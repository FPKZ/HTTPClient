import React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Download,
  Code,
  Zap,
  Terminal,
} from "lucide-react";
import { monacoRegistry } from "../lib/monacoRegistry";
import { cn } from "../lib/utils";
import { useGlobalContextMenu } from "../hooks/useGlobalContextMenu";
import { electronService } from "../services/electronService";

/**
 * GlobalContextMenu
 * Wrapper global que fornece menu de contexto dinâmico baseado no elemento clicado.
 * Lógica extraída para useGlobalContextMenu para maior clareza e reutilização.
 */

interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (e?: any) => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  className?: string;
}

export default function GlobalContextMenu({ children }: { children: React.ReactNode }) {
  const {
    open,
    setOpen,
    targetDetails,
    handleContextMenu,
    handleAction,
    isDev,
  } = useGlobalContextMenu();

  const menuItems = React.useMemo(() => {
    const items: MenuItem[] = [];

    // 1. Ações de Edição (Recortar/Copiar/Colar) - Funciona para Editável ou Monaco
    if (targetDetails.isEditable || targetDetails.isMonaco) {
      items.push(
        {
          label: "Recortar",
          icon: <Scissors size={14} />,
          onClick: () => handleAction("cut"),
          shortcut: "Ctrl+X",
          disabled: targetDetails.isEditable && !targetDetails.selectionText,
        },
        {
          label: "Copiar",
          icon: <Copy size={14} />,
          onClick: () => handleAction("copy"),
          shortcut: "Ctrl+C",
          disabled: !targetDetails.selectionText && !targetDetails.isMonaco,
        },
        {
          label: "Colar",
          icon: <ClipboardPaste size={14} />,
          onClick: () => handleAction("paste"),
          shortcut: "Ctrl+V",
        }
      );

      // Adiciona ações extras se for Monaco
      if (targetDetails.isMonaco) {
        items.push(
          { separator: true },
          {
            label: "Formatar Documento",
            icon: <Zap size={14} />,
            onClick: () => {
              const editor = monacoRegistry.getActive();
              if (editor) {
                (editor as any).getAction("editor.action.formatDocument").run();
              }
            },
            shortcut: "Alt+Shift+F",
          },
          {
            label: "Paleta de Comandos",
            icon: <Terminal size={14} />,
            onClick: () => {
              const editor: any = monacoRegistry.getActive();
              if (editor) {
                editor.trigger("any", "editor.action.quickCommand");
              }
            },
            shortcut: "F1",
          }
        );
      }
    } else if (targetDetails.selectionText) {
      // 2. Ações de Seleção de Texto
      items.push({
        label: "Copiar",
        icon: <Copy size={14} />,
        onClick: () =>
          navigator.clipboard.writeText(targetDetails.selectionText || ""),
        shortcut: "Ctrl+C",
      });
    }

    // 4. Ações de Imagem
    if (targetDetails.mediaType === "image" && targetDetails.srcURL) {
      items.push(
        {
          label: "Salvar Imagem Como...",
          icon: <Download size={14} />,
          onClick: () => {
            const a = document.createElement("a");
            a.href = targetDetails.srcURL || "";
            a.download = targetDetails.srcURL?.split("/").pop() || "image";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
        },
        {
          label: "Copiar Endereço da Imagem",
          icon: <Copy size={14} />,
          onClick: () => navigator.clipboard.writeText(targetDetails.srcURL || ""),
        }
      );
    }

    // 5. Ações Gerais / Dev
    if (isDev) {
      if (items.length > 0) items.push({ separator: true });
      items.push({
        label: "Inspecionar Elemento",
        icon: <Code size={14} />,
        onClick: () => {
          electronService.toggleDevTools();
        },
      });
    }

    return items;
  }, [targetDetails, handleAction, isDev]);

  return (
    <ContextMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <ContextMenuPrimitive.Trigger
        onContextMenu={handleContextMenu as any}
        className="h-full w-full"
      >
        {children}
      </ContextMenuPrimitive.Trigger>

      {menuItems.length > 0 && (
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.Content
            className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50!"
            alignOffset={5}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {menuItems.map((item, index) => {
              if (item.separator) {
                return (
                  <ContextMenuPrimitive.Separator
                    key={`sep-${index}`}
                    className="h-px bg-zinc-700! m-1"
                  />
                );
              }

              return (
                <ContextMenuPrimitive.Item
                  key={index}
                  disabled={item.disabled}
                  onSelect={(e) => {
                    if (!item.disabled && item.onClick) item.onClick(e);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs! font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    item.className
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4">
                      {item.shortcut}
                    </span>
                  )}
                </ContextMenuPrimitive.Item>
              );
            })}
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      )}
    </ContextMenuPrimitive.Root>
  );
}
