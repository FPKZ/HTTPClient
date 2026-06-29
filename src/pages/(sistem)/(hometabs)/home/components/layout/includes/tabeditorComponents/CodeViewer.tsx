import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { monacoRegistry } from "@/lib/monacoRegistry";
import { defaultEditorOptions } from "@/lib/monacoConfig";

interface CodeViewerProps {
  value: any;
  language?: string;
  theme?: string;
  lineNumbers?: "on" | "off" | "relative" | "interval" | ((lineNumber: number) => string);
  lineNumbersMinChars?: number;
  config?: any;
}

export default function CodeViewer({
  value,
  language = "json",
  theme = "customized-request",
  lineNumbers = "on",
  lineNumbersMinChars = 3,
  config = {},
}: CodeViewerProps) {
  const displayValue = React.useMemo(() => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  const handleEditorDidMount: OnMount = (editor) => {
    monacoRegistry.register(editor);
    editor.onDidFocusEditorWidget(() => {
      monacoRegistry.setActive(editor);
    });
  };

  return (
    <div className="w-full h-full overflow-hidden bg-transparent monaco-editor-transparente">
      <Editor
        height="100%"
        language={language === "bash" ? "shell" : language}
        value={displayValue}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          ...defaultEditorOptions,
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: lineNumbers as any,
          lineNumbersMinChars: lineNumbersMinChars,
          ...config,
        }}
      />
    </div>
  );
}
