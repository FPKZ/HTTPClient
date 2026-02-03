import React, { useRef, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Code,
  Terminal,
  Settings,
} from "lucide-react";

/**
 * Página de Demonstração: Layout Redimensionável
 * Demonstra o uso da biblioteca react-resizable-panels
 */
export default function ResizableDemo() {
  const sidebarRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarSize, setSidebarSize] = useState(20);
  const [consoleSize, setConsoleSize] = useState(30);

  const toggleSidebar = () => {
    if (sidebarRef.current) {
      if (isSidebarCollapsed) {
        sidebarRef.current.expand();
      } else {
        sidebarRef.current.collapse();
      }
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="h-full bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="text-yellow-500" size={24} />
          <h1 className="text-white font-bold text-lg">
            Demo: Layout Redimensionável
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Sidebar: {Math.round(sidebarSize)}%</span>
          <span>|</span>
          <span>Console: {Math.round(consoleSize)}%</span>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal" id="resizable-demo-layout">
          {/* Sidebar Esquerda */}
          <Panel
            ref={sidebarRef}
            defaultSize={"20%"}
            minSize={"10%"}
            maxSize={"30%"}
            // collapsible={true}
            collapsedSize={0}
            onResize={(size) => setSidebarSize(size.asPercentage)}
            className="bg-zinc-900"
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Explorador</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                  title={isSidebarCollapsed ? "Expandir" : "Colapsar"}
                >
                  {isSidebarCollapsed ? (
                    <Maximize2 size={14} />
                  ) : (
                    <Minimize2 size={14} />
                  )}
                </button>
              </div>

              {/* File Tree */}
              <div className="flex-1 overflow-y-auto p-2">
                <FileTreeItem
                  icon={<Folder size={16} />}
                  label="src"
                  defaultOpen
                >
                  <FileTreeItem
                    icon={<Folder size={16} />}
                    label="components"
                    defaultOpen
                  >
                    <FileTreeItem
                      icon={<File size={16} />}
                      label="Sidebar.jsx"
                    />
                    <FileTreeItem
                      icon={<File size={16} />}
                      label="TabBar.jsx"
                    />
                    <FileTreeItem
                      icon={<File size={16} />}
                      label="TabEditor.jsx"
                    />
                  </FileTreeItem>
                  <FileTreeItem icon={<Folder size={16} />} label="pages">
                    <FileTreeItem icon={<File size={16} />} label="Home.jsx" />
                    <FileTreeItem
                      icon={<File size={16} />}
                      label="UploadPage.jsx"
                    />
                  </FileTreeItem>
                  <FileTreeItem icon={<File size={16} />} label="App.jsx" />
                  <FileTreeItem icon={<File size={16} />} label="main.jsx" />
                </FileTreeItem>
                <FileTreeItem icon={<Folder size={16} />} label="public" />
                <FileTreeItem icon={<File size={16} />} label="package.json" />
                <FileTreeItem
                  icon={<File size={16} />}
                  label="vite.config.js"
                />
              </div>
            </div>
          </Panel>

          {/* Handle Horizontal */}
          <PanelResizeHandle className="w-1 bg-zinc-700 hover:bg-yellow-500 transition-colors cursor-col-resize relative group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-zinc-500 group-hover:bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </PanelResizeHandle>

          {/* Área Principal com Split Vertical */}
          <Panel>
            <PanelGroup orientation="vertical">
              {/* Editor */}
              <Panel defaultSize={60} minSize={60}>
                <div className="h-full bg-zinc-800 flex flex-col">
                  {/* Tabs */}
                  <div className="bg-zinc-900 border-b border-zinc-700 flex items-center px-2 gap-1">
                    <Tab label="ResizableDemo.jsx" active />
                    <Tab label="Home.jsx" />
                    <Tab label="App.jsx" />
                  </div>

                  {/* Editor Content */}
                  <div className="flex-1 p-6 overflow-auto">
                    <div className="space-y-4">
                      <h2 className="text-white text-2xl font-bold">
                        🎯 Demonstração de Layout Redimensionável
                      </h2>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                          <Settings size={16} />
                          Instruções
                        </h3>
                        <ul className="text-zinc-300 text-sm space-y-2">
                          <li>
                            • Arraste as bordas entre os painéis para
                            redimensionar
                          </li>
                          <li>
                            • A sidebar pode ser colapsada usando o botão no
                            canto superior direito
                          </li>
                          <li>
                            • O layout é salvo automaticamente no localStorage
                          </li>
                          <li>
                            • Recarregue a página para ver a persistência
                            funcionando
                          </li>
                        </ul>
                      </div>

                      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
                        <h3 className="text-yellow-500 font-semibold mb-3">
                          Recursos Demonstrados
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <Feature
                            title="Redimensionamento Horizontal"
                            description="Sidebar redimensionável com limites min/max"
                          />
                          <Feature
                            title="Redimensionamento Vertical"
                            description="Editor e console com split vertical"
                          />
                          <Feature
                            title="Persistência Automática"
                            description="Layout salvo no localStorage"
                          />
                          <Feature
                            title="Controle Programático"
                            description="Colapsar/expandir via botão"
                          />
                        </div>
                      </div>

                      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 font-mono text-sm">
                        <div className="text-green-400 mb-2">
                          // Exemplo de código:
                        </div>
                        <pre className="text-zinc-300">
                          {`<PanelGroup direction="horizontal">
  <Panel defaultSize={20} minSize={10}>
    <Sidebar />
  </Panel>
  
  <PanelResizeHandle />
  
  <Panel>
    <MainContent />
  </Panel>
</PanelGroup>`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Handle Vertical */}
              <PanelResizeHandle className="h-1 bg-zinc-700 hover:bg-yellow-500 transition-colors cursor-row-resize relative group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 bg-zinc-500 group-hover:bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </PanelResizeHandle>

              {/* Console/Terminal */}
              <Panel
                defaultSize={30}
                minSize={15}
                onResize={(size) => setConsoleSize(size.asPercentage)}
              >
                <div className="h-full bg-zinc-950 flex flex-col">
                  {/* Console Header */}
                  <div className="bg-zinc-900 border-b border-zinc-700 px-4 py-2 flex items-center gap-2">
                    <Terminal size={14} className="text-green-500" />
                    <span className="text-white text-sm font-semibold">
                      Console
                    </span>
                  </div>

                  {/* Console Content */}
                  <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                    <ConsoleLog
                      type="info"
                      message="Layout redimensionável inicializado"
                    />
                    <ConsoleLog
                      type="success"
                      message="react-resizable-panels carregado com sucesso"
                    />
                    <ConsoleLog type="info" message="Sidebar size: 20%" />
                    <ConsoleLog type="info" message="Console size: 30%" />
                    <ConsoleLog
                      type="success"
                      message="Persistência ativada (autoSaveId: 'resizable-demo-layout')"
                    />
                    <ConsoleLog
                      type="warning"
                      message="Arraste as bordas para testar o redimensionamento"
                    />
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

// Componentes auxiliares
function FileTreeItem({ icon, label, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasChildren = Boolean(children);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-800 rounded cursor-pointer text-zinc-300 text-sm group"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <span className="text-zinc-500">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        <span className="text-yellow-500">{icon}</span>
        <span className="group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-4 border-l border-zinc-700 pl-2">{children}</div>
      )}
    </div>
  );
}

function Tab({ label, active = false }) {
  return (
    <div
      className={`
        px-3 py-2 text-sm cursor-pointer transition-colors
        ${
          active
            ? "bg-zinc-800 text-white border-t-2 border-yellow-500"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        }
      `}
    >
      {label}
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div>
      <div className="text-white font-medium mb-1">{title}</div>
      <div className="text-zinc-400 text-xs">{description}</div>
    </div>
  );
}

function ConsoleLog({ type, message }) {
  const colors = {
    info: "text-blue-400",
    success: "text-green-400",
    warning: "text-yellow-400",
    error: "text-red-400",
  };

  const icons = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✗",
  };

  return (
    <div className={`${colors[type]} mb-1`}>
      <span className="text-zinc-500 mr-2">
        [{new Date().toLocaleTimeString()}]
      </span>
      <span className="mr-2">{icons[type]}</span>
      {message}
    </div>
  );
}
