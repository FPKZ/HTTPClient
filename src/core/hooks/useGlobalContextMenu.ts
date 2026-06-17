import { useState, useRef, useCallback } from "react";
// @ts-ignore
import { monacoRegistry } from "@/lib/monacoRegistry";
import { electronService } from "@/core/services/electronService";

/**
 * Hook useGlobalContextMenu
 * Gerencia a lógica de detecção de contexto e execução de ações para o GlobalContextMenu.
 */

interface TargetDetails {
  isEditable: boolean;
  isMonaco: boolean;
  selectionText: string;
  linkURL: string;
  srcURL: string;
  mediaType: "image" | "none";
  tagName: string;
}

interface SelectionInfo {
  start: number | null;
  end: number | null;
  length: number;
}

interface LastEventDetails {
  target: any;
  e: any;
  isMonaco: boolean;
  selectionInfo: SelectionInfo | null;
  monacoContainer: HTMLElement | null;
}

export function useGlobalContextMenu() {
  const [open, setOpen] = useState(false);
  const [targetDetails, setTargetDetails] = useState<TargetDetails>({
    isEditable: false,
    isMonaco: false,
    selectionText: "",
    linkURL: "",
    srcURL: "",
    mediaType: "none",
    tagName: "",
  });

  const lastEventRef = useRef<LastEventDetails | null>(null);
  const isDev = electronService.isDev;

  /**
   * Analisa o elemento alvo do clique e prepara os detalhes do contexto.
   */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const target = e.target as HTMLElement;
      const monacoEditor = target.closest(".monaco-editor") as HTMLElement | null;
      const isMonaco = !!monacoEditor;

      let selection = "";
      if (isMonaco && monacoEditor) {
        const editor = monacoRegistry.getForElement(monacoEditor);
        if (editor) {
          const monacoSelection = editor.getSelection();
          if (monacoSelection) {
            selection = editor.getModel().getValueInRange(monacoSelection);
          }
        }
      }

      if (!selection) {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          selection = target.value.substring(
            target.selectionStart || 0,
            target.selectionEnd || 0
          );
        } else {
          selection = window.getSelection()?.toString() || "";
        }
      }

      const isEditable =
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      const linkElement = target.closest("a");
      const linkURL = linkElement ? linkElement.href : "";
      const srcURL = (target as any).src || "";
      const mediaType = target instanceof HTMLImageElement ? "image" : "none";

      let selectionInfo: SelectionInfo | null = null;
      if (
        isEditable &&
        (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
      ) {
        selectionInfo = {
          start: target.selectionStart,
          end: target.selectionEnd,
          length: target.value.length,
        };
      }

      const hasItems =
        isEditable ||
        isMonaco ||
        !!selection ||
        !!linkURL ||
        mediaType === "image" ||
        isDev;

      setTargetDetails({
        isEditable,
        isMonaco,
        selectionText: selection,
        linkURL,
        srcURL,
        mediaType,
        tagName: target.tagName,
      });

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

      setOpen(true);
    },
    [isDev]
  );

  /**
   * Executa uma ação (copy, cut, paste, etc.) no contexto atual.
   */
  const handleAction = useCallback((action: string) => {
    setTimeout(() => {
      const details = lastEventRef.current;
      const target = details?.target;

      if (target) {
        if (details.isMonaco) {
          const container =
            details.monacoContainer || target.closest(".monaco-editor");
          const editorInstance = monacoRegistry.getForElement(container);

          if (editorInstance) {
            editorInstance.focus();
          } else {
            const inputArea = container?.querySelector(".inputarea") as HTMLElement | null;
            if (inputArea) inputArea.focus();
            else target.focus();
          }
        } else {
          target.focus();
          if (details?.selectionInfo && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
            try {
              target.setSelectionRange(
                details.selectionInfo.start || 0,
                details.selectionInfo.end || 0
              );
            } catch (err) {
              console.error(
                "[useGlobalContextMenu] Falha ao restaurar seleção:",
                err
              );
            }
          }
        }
      }

      try {
        if (details?.isMonaco) {
          const editor = monacoRegistry.getForElement(
            details.monacoContainer || target
          );
          if (editor) {
            editor.focus();

            if (action === "paste") {
              const inputArea =
                details.monacoContainer?.querySelector(".inputarea") as HTMLElement | null;
              if (inputArea) inputArea.focus();
              else editor.focus();

              electronService.paste();
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
                "[useGlobalContextMenu] Monaco API falhou, usando fallback Electron:",
                monacoErr
              );
            }
          }
        }

        const result = document.execCommand(action);
        if (!result) {
          if (action === "cut") electronService.cut();
          else if (action === "copy") electronService.copy();
          else if (action === "paste") electronService.paste();
        }
      } catch (err) {
        console.error(
          `[useGlobalContextMenu] Erro ao executar ${action}:`,
          err
        );
        if (action === "cut") electronService.cut();
        else if (action === "copy") electronService.copy();
        else if (action === "paste") electronService.paste();
      }
    }, 50);
  }, []);

  return {
    open,
    setOpen,
    targetDetails,
    handleContextMenu,
    handleAction,
    isDev,
  };
}

export default useGlobalContextMenu;
