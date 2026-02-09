import React from "react";
import Editor from "@monaco-editor/react";
import { monacoRegistry } from "../lib/monacoRegistry";

export default function CodeViewer({ value, language = "json", theme = "customized-requst" }) {
  const displayValue = React.useMemo(() => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  const handleEditorDidMount = (editor) => {
    monacoRegistry.register(editor);
    editor.onDidFocusEditorWidget(() => {
      monacoRegistry.setActive(editor);
    });
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#0a0a0a]">
      <Editor
        key={`${language}-${displayValue.length}`}
        height="100%"
        language={language === "bash" ? "shell" : language}
        value={displayValue}
        theme={theme} // Use o nome definido acima
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 10,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          contextmenu: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
        }}
      />
    </div>
  );
}