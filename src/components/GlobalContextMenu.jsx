import React, { useState } from "react";
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

/**
 * GlobalContextMenu
 * Wrapper global que fornece menu de contexto dinâmico baseado no elemento clicado.
 */
export default function GlobalContextMenu({ children }) {
  const [open, setOpen] = useState(false);
  const [targetDetails, setTargetDetails] = useState({
    isEditable: false,
    selectionText: "",
    linkURL: "",
    srcURL: "",
    mediaType: "none",
    tagName: "",
  });

  const isDev = window.electronAPI?.isDev;

  // Atualiza detalhes do alvo ao abrir o menu
  const handleOpenChange = (open) => {
    setOpen(open);
  };

  // Referência temporária para o último evento de context menu
  const lastEventRef = React.useRef(null);

  const handleContextMenu = (e) => {
    const target = e.target;
    const monacoEditor = target.closest(".monaco-editor");
    const isMonaco = !!monacoEditor;

    // Pega a seleção de forma mais robusta
    let selection = "";
    if (isMonaco) {
      const editor = monacoRegistry.getForElement(monacoEditor);
      if (editor) {
        const monacoSelection = editor.getSelection();
        if (monacoSelection) {
          selection = editor.getModel().getValueInRange(monacoSelection);
        }
      }
    }

    if (!selection) {
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        selection = target.value.substring(
          target.selectionStart,
          target.selectionEnd,
        );
      } else {
        selection = window.getSelection()?.toString() || "";
      }
    }

    const isEditable =
      target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA";

    // Procura link pai
    const linkElement = target.closest("a");
    const linkURL = linkElement ? linkElement.href : "";

    // Mídia
    const srcURL = target.src || "";
    const mediaType = target.tagName === "IMG" ? "image" : "none";

    let selectionInfo = null;
    if (
      isEditable &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    ) {
      selectionInfo = {
        start: target.selectionStart,
        end: target.selectionEnd,
        length: target.value.length,
      };
    }

    // Verifica se teremos itens (replicando lógica do render abaixo)
    const hasItems =
      isEditable ||
      isMonaco ||
      !!selection ||
      !!linkURL ||
      mediaType === "image" ||
      isDev;

    if (!hasItems) {
      setOpen(false);
      return;
    }

    lastEventRef.current = {
      target,
      e,
      isMonaco,
      selectionInfo,
      monacoContainer: monacoEditor,
    };

    setTargetDetails({
      isEditable,
      isMonaco,
      selectionText: selection,
      linkURL,
      srcURL,
      mediaType,
      tagName: target.tagName,
    });
    setOpen(true);
  };

  // Handler para ações de clipboard
  const handleAction = React.useCallback(
    (action) => {
      // Pequeno delay para o menu fechar completamente e o foco estabilizar
      setTimeout(() => {
        const details = lastEventRef.current;
        const target = details?.target;

        if (target) {
          if (details.isMonaco) {
            // Tenta obter o editor para o container original ou o target
            const container =
              details.monacoContainer || target.closest(".monaco-editor");
            const editorInstance = monacoRegistry.getForElement(container);

            if (editorInstance) {
              editorInstance.focus();
            } else {
              // Fallback robusto via DOM
              const inputArea = container?.querySelector(".inputarea");
              if (inputArea) {
                inputArea.focus();
              } else {
                target.focus();
              }
            }
          } else {
            target.focus();

            if (details?.selectionInfo) {
              try {
                target.setSelectionRange(
                  details.selectionInfo.start,
                  details.selectionInfo.end,
                );
              } catch (err) {
                console.error(
                  "[GlobalContextMenu] Failed to set selection range",
                  err,
                );
              }
            }
          }
        }

        try {
          if (details.isMonaco) {
            const editor = monacoRegistry.getForElement(
              details.monacoContainer || target,
            );
            if (editor) {
              editor.focus();

              if (action === "paste") {
                const inputArea =
                  details.monacoContainer?.querySelector(".inputarea");
                if (inputArea) inputArea.focus();
                else editor.focus();

                window.electronAPI.paste();
                return;
              }

              try {
                const cmd =
                  action === "cut"
                    ? "editor.action.clipboardCutAction"
                    : "editor.action.clipboardCopyAction";
                editor.trigger("contextmenu", cmd);
                return;
              } catch (monacoErr) {
                console.warn(
                  "[GlobalContextMenu] Monaco API failed, falling back to Electron",
                  monacoErr,
                );
              }
            }
          }

          const result = document.execCommand(action);

          if (!result) {
            if (action === "cut") window.electronAPI.cut();
            else if (action === "copy") window.electronAPI.copy();
            else if (action === "paste") window.electronAPI.paste();
          }
        } catch (err) {
          console.error(`[GlobalContextMenu] Error during ${action}:`, err);
          if (action === "cut") window.electronAPI.cut();
          else if (action === "copy") window.electronAPI.copy();
          else if (action === "paste") window.electronAPI.paste();
        }
      }, 50);
    },
    [], // Ref é estável
  );

  const menuItems = React.useMemo(() => {
    const items = [];

    // 1. Ações de Edição (Recortar/Copiar/Colar) - Funciona para Editável ou Monaco
    if (targetDetails.isEditable || targetDetails.isMonaco) {
      items.push(
        // eslint-disable-next-line react-hooks/refs
        {
          label: "Recortar",
          icon: <Scissors size={14} />,
          onClick: () => handleAction("cut"),
          shortcut: "Ctrl+X",
          disabled: targetDetails.isEditable && !targetDetails.selectionText,
        },
        // eslint-disable-next-line react-hooks/refs
        {
          label: "Copiar",
          icon: <Copy size={14} />,
          onClick: () => handleAction("copy"),
          shortcut: "Ctrl+C",
          disabled: !targetDetails.selectionText && !targetDetails.isMonaco,
        },
        // eslint-disable-next-line react-hooks/refs
        {
          label: "Colar",
          icon: <ClipboardPaste size={14} />,
          onClick: () => handleAction("paste"),
          shortcut: "Ctrl+V",
        },
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
                editor.getAction("editor.action.formatDocument").run();
              }
            },
            shortcut: "Alt+Shift+F",
          },
          {
            label: "Paleta de Comandos",
            icon: <Terminal size={14} />,
            onClick: () => {
              const editor = monacoRegistry.getActive();
              if (editor) {
                editor.trigger("any", "editor.action.quickCommand");
              }
            },
            shortcut: "F1",
          },
        );
      }
    } else if (targetDetails.selectionText) {
      // 2. Ações de Seleção de Texto
      items.push({
        label: "Copiar",
        icon: <Copy size={14} />,
        onClick: () =>
          navigator.clipboard.writeText(targetDetails.selectionText),
        shortcut: "Ctrl+C",
      });
    }

    // 4. Ações de Imagem
    if (targetDetails.mediaType === "image") {
      items.push(
        {
          label: "Salvar Imagem Como...",
          icon: <Download size={14} />,
          onClick: () => {
            const a = document.createElement("a");
            a.href = targetDetails.srcURL;
            a.download = targetDetails.srcURL.split("/").pop() || "image";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
        },
        {
          label: "Copiar Endereço da Imagem",
          icon: <Copy size={14} />,
          onClick: () => navigator.clipboard.writeText(targetDetails.srcURL),
        },
      );
    }

    // 5. Ações Gerais / Dev
    if (isDev) {
      if (items.length > 0) items.push({ separator: true });
      items.push({
        label: "Inspecionar Elemento",
        icon: <Code size={14} />,
        onClick: () => {
          // IPC para abrir devtools
          window.electronAPI.toggleDevTools();
        },
      });
    }

    return items;
  }, [targetDetails, handleAction, isDev]);

  return (
    <ContextMenuPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <ContextMenuPrimitive.Trigger
        onContextMenu={handleContextMenu}
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
              // Impede o Radix de tentar restaurar o foco automaticamente,
              // o que as vezes causa o "selecionar tudo" no input.
              // Nós faremos isso manualmente no handleAction.
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
                    item.className,
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
