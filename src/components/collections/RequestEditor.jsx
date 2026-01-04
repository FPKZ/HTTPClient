import React from "react";
import { Button } from "react-bootstrap";
import { Edit } from "lucide-react";
import AutoResizeTextarea from "../AutoResizeTextarea";

/**
 * RequestEditor
 * Componente responsável por renderizar os campos editáveis de uma seção da requisição (Headers, Body, etc).
 * OCP: Facilmente extensível para novos tipos de dados.
 */
export default function RequestEditor({
  subKey,
  subValue,
  index,
  onInputChange,
  onSelectFile,
}) {
  if (subKey === "url" || subKey === "method" || !subValue) return null;

  // Renderização de String (ex: Raw Body)
  if (typeof subValue === "string") {
    return (
      <div className="d-flex flex-column gap-2">
        <div className="d-flex gap-2 bg-neutral-950 p-2 rounded align-items-start">
          <AutoResizeTextarea
            className="w-100 bg-transparent text-gray-300 focus:outline-none border-none p-0"
            style={{ fontSize: "0.7rem" }}
            value={subValue}
            onChange={(e) => onInputChange(index, subKey, null, e.target.value)}
          />
        </div>
      </div>
    );
  }

  // Helper para renderizar campos individuais
  const renderField = (fieldKey, fieldValue) => {
    if (typeof fieldValue === "object") {
      return (
        <pre
          className="permitirSelect text-gray-300 bg-zinc-900/50 p-2 w-100 rounded"
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-all",
            maxWidth: "100%",
          }}
        >
          {JSON.stringify(fieldValue, null, 2)}
        </pre>
      );
    }

    return (
      <>
        <AutoResizeTextarea
          className="w-100 bg-transparent text-gray-300 focus:outline-none border-none p-0"
          style={{ fontSize: "0.7rem" }}
          value={fieldValue}
          onChange={(e) => onInputChange(index, subKey, fieldKey, e.target.value)}
        />
        <Edit size={12} className="text-zinc-700" />
      </>
    );
  };

  // Renderização de Objeto (ex: Headers, FormData)
  return (
    <div className="d-flex flex-column gap-2">
      {Object.entries(subValue).map(([fieldKey, fieldValue]) => (
        <div key={fieldKey}>
          <div className="d-flex gap-2 bg-neutral-950 p-2 rounded align-items-center">
            <small
              className="text-zinc-500"
              style={{ minWidth: "100px", fontSize: "0.7rem" }}
            >
              {fieldKey}:
            </small>
            <div className="flex-grow-1 d-flex align-items-start gap-2">
              {fieldKey === "Content-Type" ? (
                <small className="text-gray-400">{fieldValue}</small>
              ) : (
                renderField(fieldKey, fieldValue)
              )}
            </div>
          </div>
          {typeof fieldValue === "object" && fieldValue?.src && (
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-1 w-full"
              style={{ fontSize: "0.6rem" }}
              onClick={() => onSelectFile({ index, subKey, fieldKey })}
            >
              Select File
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
