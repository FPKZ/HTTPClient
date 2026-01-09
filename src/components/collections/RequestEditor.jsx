import React from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea";
import Editor from "@monaco-editor/react";

/**
 * RequestEditor
 * Renderiza listas editáveis (Headers, Params, Body Inputs) ou editores específicos (JSON).
 */
export default function RequestEditor({
  subKey,
  subValue,
  onInputChange,
  // eslint-disable-next-line no-unused-vars
  onSelectFile,
  onRun,
}) {
  if (subKey === "url" || subKey === "method" || !subValue) return null;
  // Renderização específica para AUTH
  if (subKey === "auth") {
    const isEnabled = subValue.name && subValue.name !== "none";

    const handleToggleAuth = () => {
      onInputChange(0, "auth", "name", isEnabled ? "none" : "Authorization");
    };

    return (
      <div className="flex flex-col animate-in fade-in duration-300">
        <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 mb-2 px-2 items-center">
          <div />
          <span className="text-[0.6rem] uppercase text-zinc-600 font-bold">
            Campo (Name) / Prefixo (Type)
          </span>
          <span className="text-[0.6rem] uppercase text-zinc-600 font-bold">
            Token (Key) / Local (Value)
          </span>
          <div />
        </div>

        <div
          className={`grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-start bg-zinc-900/50 p-2 rounded hover:bg-zinc-800/50 group border !border-zinc-800/50 transition-all ${
            !isEnabled && "opacity-60"
          }`}
        >
          {/* Enabled Checkbox */}
          <button
            onClick={handleToggleAuth}
            className="mt-1.5 flex justify-center text-zinc-600 hover:text-yellow-500"
          >
            {isEnabled ? (
              <CheckSquare size={14} className="text-yellow-600" />
            ) : (
              <Square size={14} />
            )}
          </button>

          {/* Key Column: Field Name + Prefix */}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Ex: Authorization"
              value={subValue.name === "none" ? "" : subValue.name}
              onChange={(e) => onInputChange(0, "auth", "name", e.target.value)}
              disabled={!isEnabled}
              className="bg-transparent text-white text-[0.75rem] py-1 border-b border-zinc-800 focus:border-yellow-600 outline-none w-full font-medium"
            />
            <div className="flex items-center gap-1">
              <span className="text-[0.55rem] text-zinc-600 font-bold uppercase">
                Tipo:
              </span>
              <input
                type="text"
                placeholder="Ex: Bearer"
                value={subValue.config?.type || ""}
                onChange={(e) =>
                  onInputChange(0, "auth", "config", {
                    ...subValue.config,
                    type: e.target.value,
                  })
                }
                disabled={!isEnabled}
                className="bg-transparent text-zinc-400 text-[0.65rem] outline-none w-full"
              />
            </div>
          </div>

          {/* Value Column: Token + Location */}
          <div className="flex flex-col gap-2">
            <AutoResizeTextarea
              placeholder="Inserir token (Key)..."
              value={subValue.config?.key || ""}
              onChange={(e) =>
                onInputChange(0, "auth", "config", {
                  ...subValue.config,
                  key: e.target.value,
                })
              }
              disabled={!isEnabled}
              className="bg-transparent text-yellow-500 text-[0.75rem] py-1 border-b border-zinc-800 focus:border-yellow-600 outline-none w-full font-mono resize-none min-h-[24px]"
            />
            <div className="flex items-center gap-1">
              <span className="text-[0.55rem] text-zinc-600 font-bold uppercase">
                Injetar em:
              </span>
              <select
                value={subValue.config?.value || "header"}
                onChange={(e) =>
                  onInputChange(0, "auth", "config", {
                    ...subValue.config,
                    value: e.target.value,
                  })
                }
                disabled={!isEnabled}
                className="bg-transparent text-zinc-400 text-[0.65rem] outline-none cursor-pointer hover:text-zinc-200 transition-colors capitalize"
              >
                <option value="header" className="bg-zinc-900">
                  Header
                </option>
                <option value="body" className="bg-zinc-900">
                  Body
                </option>
              </select>
            </div>
          </div>

          {/* Clear Action */}
          <button
            onClick={() => onInputChange(0, "auth", "name", "none")}
            className="mt-1.5 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {!isEnabled && (
          <p className="px-10 py-4 text-[0.65rem] text-zinc-600 text-center italic">
            Ative a caixa de seleção acima para configurar a autenticação desta
            rota.
          </p>
        )}
      </div>
    );
  }

  // Se for BODY, precisamos checar o modo
  const isBody = subKey === "body";
  const mode = isBody ? subValue.mode : "list";
  const items = isBody ? subValue.content : subValue;

  // Handler para atualizar um item específico na lista
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (isBody) {
      onInputChange(0, "body", null, { ...subValue, content: newItems });
    } else {
      onInputChange(0, subKey, null, newItems);
    }
  };

  // Handler para adicionar novo item
  const handleAddItem = () => {
    const newItem = { key: "", value: "", enabled: true, type: "text" };
    const newItems = [...items, newItem];

    if (isBody) {
      onInputChange(0, "body", null, { ...subValue, content: newItems });
    } else {
      onInputChange(0, subKey, null, newItems);
    }
  };

  // Handler para remover item
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);

    if (isBody) {
      onInputChange(0, "body", null, { ...subValue, content: newItems });
    } else {
      onInputChange(0, subKey, null, newItems);
    }
  };

  // Helpers de conversão
  const listToJson = (list) => {
    const obj = {};
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item.key) {
          let val = item.value;
          // Tenta fazer o parse de volta para objeto se parecer JSON
          try {
            if (
              typeof val === "string" &&
              (val.trim().startsWith("{") || val.trim().startsWith("["))
            ) {
              val = JSON.parse(val);
            }
          } catch (e) {
            console.log(e);
            // Se falhar o parse, mantém como string
          }
          obj[item.key] = val;
        }
      });
    }
    return JSON.stringify(obj, null, 2);
  };

  const jsonToList = (jsonStr) => {
    try {
      const obj = JSON.parse(jsonStr);
      return Object.entries(obj).map(([key, value]) => ({
        key,
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
        enabled: true,
      }));
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  // Handler para trocar modo do body
  const handleModeChange = (newMode) => {
    let newContent = subValue.content;

    // Conversões de JSON para Lista (Inputs ou FormData)
    if (mode === "json" && (newMode === "inputs" || newMode === "formdata")) {
      newContent = jsonToList(subValue.content);
    }
    // Conversões de Lista para JSON
    else if ((mode === "inputs" || mode === "formdata") && newMode === "json") {
      newContent = listToJson(subValue.content);
    }
    // Mudança para None
    else if (newMode === "none") {
      newContent = "";
    }
    // Inicialização se vazio
    else if (newMode === "inputs" || newMode === "formdata") {
      if (!Array.isArray(newContent)) newContent = [];
    }

    onInputChange(0, "body", null, {
      mode: newMode,
      content: newContent,
    });
  };

  // Renderização do seletor de modo (apenas para Body)
  const renderModeSelector = () => (
    <div className="flex gap-4 mb-0 border-b border-zinc-800 pb-2">
      {["json", "formdata"].map((m) => (
        <label key={m} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="bodyMode"
            checked={mode === m}
            onChange={() => handleModeChange(m)}
            className="hidden"
          />
          <div
            className={`w-3 h-3 rounded-full border ${
              mode === m
                ? "bg-yellow-500 border-yellow-500"
                : "border-zinc-600 group-hover:border-zinc-400"
            }`}
          />
          <span
            className={`text-[0.65rem] uppercase font-bold ${
              mode === m
                ? "text-yellow-500"
                : "text-zinc-500 group-hover:text-zinc-300"
            }`}
          >
            {m}
          </span>
        </label>
      ))}
    </div>
  );

  // Renderização de lista (Headers, Params, Body Inputs)
  if (mode === "list" || mode === "inputs" || mode === "formdata") {
    return (
      <div className="flex flex-col gap-1">
        {isBody && renderModeSelector()}

        {Array.isArray(items) && items.length > 0 && (
          <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 mb-2 px-2 items-center">
            <div />
            <span className="text-[0.6rem] uppercase text-zinc-600 font-bold">
              Key
            </span>
            <span className="text-[0.6rem] uppercase text-zinc-600 font-bold">
              Value
            </span>
            <div />
          </div>
        )}

        {Array.isArray(items) &&
          items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center bg-zinc-900/50 p-1 rounded hover:bg-zinc-800/50 group"
            >
              {/* Enabled Checkbox */}
              <button
                onClick={() => handleItemChange(idx, "enabled", !item.enabled)}
                className="mt-1.5 flex justify-center text-zinc-600 hover:text-yellow-500"
              >
                {item.enabled ? (
                  <CheckSquare size={14} className="text-yellow-600" />
                ) : (
                  <Square size={14} />
                )}
              </button>

              {/* Key Input */}
              <input
                type="text"
                value={item.key}
                onChange={(e) => handleItemChange(idx, "key", e.target.value)}
                placeholder="Key"
                className={`bg-transparent text-white text-[0.75rem] py-1 px-2 border-b border-transparent focus:border-zinc-600 outline-none w-full ${
                  !item.enabled && "opacity-50 text-zinc-500"
                }`}
              />

              {/* Value Input (Text or File) */}
              <div className="flex flex-col gap-1">
                {mode === "formdata" ? (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-800/50 text-zinc-300 text-[0.7rem] px-2 py-1 rounded border !border-zinc-700 truncate">
                      {item.value || "Selecione um arquivo..."}
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.electronAPI) return;
                        const path = await window.electronAPI.selectFile();
                        if (path) {
                          handleItemChange(idx, "value", path);
                          // Também podemos salvar 'src' se o backend precisar, mas 'value' costuma ser o path
                        }
                      }}
                      className="bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded text-[0.6rem]"
                    >
                      Browser
                    </button>
                  </div>
                ) : (
                  <AutoResizeTextarea
                    value={item.value}
                    onChange={(e) =>
                      handleItemChange(idx, "value", e.target.value)
                    }
                    placeholder="Value"
                    className={`bg-transparent text-white text-[0.75rem] py-1 px-2 border-b border-transparent focus:border-zinc-600 outline-none w-full resize-none ${
                      !item.enabled && "opacity-50 text-zinc-500"
                    }`}
                  />
                )}
              </div>

              {/* Remove Action */}
              <button
                onClick={() => handleRemoveItem(idx)}
                className="flex justify-center opacity-0 group-hover:!opacity-100 text-zinc-600 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

        <div className="flex justify-end">
          <button
            onClick={handleAddItem}
            className="mt-2 flex items-center gap-1 !text-[0.65rem] text-zinc-500 hover:text-yellow-500 font-bold transition-colors w-fit px-2"
          >
            <Plus size={14} />
            <span>ADICIONAR CAMPO</span>
          </button>
        </div>
      </div>
    );
  }

  // Renderização de JSON
  if (mode === "json") {
    return (
      <div className="flex flex-col gap-2">
        {renderModeSelector()}

        <Editor
          height="20vh" // Altura fixa ou dinâmica
          defaultLanguage="json"
          value={items} // Controlled component
          theme="vs-dark"
          onChange={(value) =>
            onInputChange(0, "body", null, {
              ...subValue,
              content: value,
            })
          }
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
          }}
          onMount={(editor, monaco) => {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              if (onRun) onRun();
            });
          }}
        />

        {/* <div className="bg-zinc-950 p-3 rounded border border-zinc-800 focus-within:border-yellow-600/50 transition-colors">
          <AutoResizeTextarea
            value={items}
            onChange={(e) =>
              onInputChange(0, "body", null, {
                ...subValue,
                content: e.target.value,
              })
            }
            placeholder='{ "key": "value" }'
            className="w-full bg-transparent text-zinc-300 text-[0.8rem] font-mono outline-none min-h-[100px]"
          />
        </div> */}
        <p className="text-[0.6rem] text-zinc-600 mb-0">
          DICA: Use o modo JSON para requisições complexas.
        </p>
      </div>
    );
  }

  // Renderização de None
  if (mode === "none") {
    return (
      <div className="flex flex-col gap-2">
        {renderModeSelector()}
        <div className="py-10 text-center text-zinc-600 text-[0.75rem]">
          Esta requisição não possui corpo.
        </div>
      </div>
    );
  }

  return null;
}
