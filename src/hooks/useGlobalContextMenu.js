import { useState, useRef, useCallback } from "react";
import { monacoRegistry } from "../lib/monacoRegistry";
import { electronService } from "../services/electronService";

/**
 * Hook useGlobalContextMenu
 * Gerencia a lógica de detecção de contexto e execução de ações para o GlobalContextMenu.
 */
export function useGlobalContextMenu() {
  const [open, setOpen] = useState(false);
  const [targetDetails, setTargetDetails] = useState({
    isEditable: false,
    isMonaco: false,
    selectionText: "",
    linkURL: "",
    srcURL: "",
    mediaType: "none",
    tagName: "",
  });

  const lastEventRef = useRef(null);
  const isDev = electronService.isDev;

  /**
   * Analisa o elemento alvo do clique e prepara os detalhes do contexto.
   */
  const handleContextMenu = useCallback(
    (e) => {
      const target = e.target;
      const monacoEditor = target.closest(".monaco-editor");
      const isMonaco = !!monacoEditor;

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

      const linkElement = target.closest("a");
      const linkURL = linkElement ? linkElement.href : "";
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
    },
    [isDev],
  );

  /**
   * Executa uma ação (copy, cut, paste, etc.) no contexto atual.
   */
  const handleAction = useCallback((action) => {
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
            const inputArea = container?.querySelector(".inputarea");
            if (inputArea) inputArea.focus();
            else target.focus();
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
                "[useGlobalContextMenu] Falha ao restaurar seleção:",
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
                monacoErr,
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
          err,
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
