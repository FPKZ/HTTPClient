import { useCallback } from "react";
import { listToJson, jsonToList } from "@/utils/dataTransformers";
import { electronService } from "@/core/services/electronService";

/**
 * Hook useRequestEditor
 * Centraliza a lógica de manipulação de dados de uma requisição (Headers, Params, Body, Auth).
 */

interface UseRequestEditorProps {
  subKey: string;
  subValue: any;
  onInputChange: (index: number, sectionKey: string, fieldKey: string | null, newValue: any) => void;
}

export function useRequestEditor({ subKey, subValue, onInputChange }: UseRequestEditorProps) {
  const safeSubValue = subValue || {};
  const isBody = subKey === "body";
  const items = isBody ? safeSubValue.content : subValue;

  /**
   * Atualiza um item específico em uma lista (Key/Value/Enabled)
   */
  const handleItemChange = useCallback(
    (index: number, field: string, value: any) => {
      const newItems = Array.isArray(items) ? [...items] : [];
      newItems[index] = { ...newItems[index], [field]: value };

      if (isBody) {
        onInputChange(0, "body", null, { ...safeSubValue, content: newItems });
      } else {
        onInputChange(0, subKey, null, newItems);
      }
    },
    [items, isBody, onInputChange, subKey, safeSubValue]
  );

  /**
   * Adiciona um novo item vazio à lista
   */
  const handleAddItem = useCallback(() => {
    const newItem = { key: "", value: "", enabled: true, type: "text" };
    const newItems = Array.isArray(items) ? [...items, newItem] : [newItem];

    if (isBody) {
      onInputChange(0, "body", null, { ...safeSubValue, content: newItems });
    } else {
      onInputChange(0, subKey, null, newItems);
    }
  }, [items, isBody, onInputChange, subKey, safeSubValue]);

  /**
   * Remove um item da lista por índice
   */
  const handleRemoveItem = useCallback(
    (index: number) => {
      if (!Array.isArray(items)) return;
      const newItems = items.filter((_, i) => i !== index);

      if (isBody) {
        onInputChange(0, "body", null, { ...safeSubValue, content: newItems });
      } else {
        onInputChange(0, subKey, null, newItems);
      }
    },
    [items, isBody, onInputChange, subKey, safeSubValue]
  );

  /**
   * Gerencia a troca de modo do Body (JSON <-> Form-data <-> URLEncoded)
   * Realiza conversões automáticas entre lista e JSON quando possível.
   */
  const handleModeChange = useCallback(
    (newMode: string) => {
      const currentMode = safeSubValue.mode;
      const currentContent = safeSubValue.content;

      const newBody = {
        ...safeSubValue,
        [currentMode]: currentContent, // Preserva estado do modo anterior
        mode: newMode,
      };

      let nextContent = newBody[newMode];

      // Se o novo modo não tem conteúdo salvo, tenta converter
      if (nextContent === undefined || nextContent === null) {
        if (
          currentMode === "json" &&
          ["inputs", "formdata", "urlencoded"].includes(newMode)
        ) {
          nextContent = jsonToList(currentContent);
        } else if (
          ["inputs", "formdata", "urlencoded"].includes(currentMode) &&
          newMode === "json"
        ) {
          nextContent = listToJson(currentContent);
        } else if (newMode === "none") {
          nextContent = "";
        } else if (["binary", "stream"].includes(newMode)) {
          nextContent = typeof currentContent === "string" ? currentContent : "";
        } else if (["inputs", "formdata", "urlencoded"].includes(newMode)) {
          nextContent = [];
        } else {
          nextContent = "";
        }
      }

      newBody.content = nextContent;
      onInputChange(0, "body", null, newBody);
    },
    [safeSubValue, onInputChange]
  );

  /**
   * Lógica de Autenticação
   */
  const handleToggleAuth = useCallback(() => {
    const isEnabled = safeSubValue.name && safeSubValue.name !== "none";
    onInputChange(0, "auth", "name", isEnabled ? "none" : "Authorization");
  }, [safeSubValue.name, onInputChange]);

  const handleAuthModeChange = useCallback(
    (mode: string) => {
      onInputChange(0, "auth", "mode", mode);
    },
    [onInputChange]
  );

  /**
   * Seleção de arquivos (via Electron Service)
   */
  const handleSelectFile = useCallback(async (options: any = {}) => {
    const path = await electronService.selectFile(options.filters);
    if (path && options.onSelect) {
      options.onSelect(path);
    }
    return path;
  }, []);

  const handleSelectSaveLocation = useCallback(async () => {
    return await electronService.selectSaveLocation();
  }, []);

  return {
    items,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleModeChange,
    handleToggleAuth,
    handleAuthModeChange,
    handleSelectFile,
    handleSelectSaveLocation,
  };
}

export default useRequestEditor;
