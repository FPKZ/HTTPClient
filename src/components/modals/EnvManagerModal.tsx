import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Upload,
  Download,
  Code,
  Plus,
  Trash2,
  PlusCircle,
  Info,
  History,
  Check,
  Settings,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useCollectionStore from "@/core/store/useCollectionStore";

interface EnvManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnvManagerModal({ open, onOpenChange }: EnvManagerModalProps) {
  const environments =
    useCollectionStore((state) => state.collection.environments) || [];
  const activeEnvironmentId = useCollectionStore(
    (state) => state.collection.activeEnvironmentId,
  );
  const setActiveEnvironment = useCollectionStore(
    (state) => state.setActiveEnvironment,
  );
  const addEnvironment = useCollectionStore((state) => state.addEnvironment);
  const updateEnvironmentName = useCollectionStore(
    (state) => state.updateEnvironmentName,
  );
  const deleteEnvironment = useCollectionStore((state) => state.deleteEnvironment);

  const addVariable = useCollectionStore((state) => state.addVariable);
  const updateVariable = useCollectionStore((state) => state.updateVariable);
  const deleteVariable = useCollectionStore((state) => state.deleteVariable);

  const globals = useCollectionStore((state) => state.globals) || [];
  const addGlobalVariable = useCollectionStore((state) => state.addGlobalVariable);
  const updateGlobalVariable = useCollectionStore(
    (state) => state.updateGlobalVariable,
  );
  const deleteGlobalVariable = useCollectionStore(
    (state) => state.deleteGlobalVariable,
  );

  const importEnvironment = useCollectionStore((state) => state.importEnvironment);
  const importGlobals = useCollectionStore((state) => state.importGlobals);

  const [viewMode, setViewMode] = useState<"envs" | "globals">("envs");
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(
    activeEnvironmentId ||
      (environments.length > 0 ? environments[0].id : null),
  );
  const [envToDelete, setEnvToDelete] = useState<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const selectedEnv = environments.find((e) => e.id === selectedEnvId);

  const handleAddEnv = () => {
    const newId = addEnvironment();
    setSelectedEnvId(newId);
  };

  const confirmDeleteEnv = () => {
    if (envToDelete) {
      deleteEnvironment(envToDelete.id);
      setSelectedEnvId(
        environments.find((e) => e.id !== envToDelete.id)?.id || null,
      );
      setEnvToDelete(null);
    }
  };

  const handleExport = async () => {
    if (!(window as any).electronAPI) return;

    let content: any, defaultPath: string;
    if (viewMode === "envs") {
      if (!selectedEnv) return;
      content = {
        type: "environment",
        name: selectedEnv.name,
        variables: selectedEnv.variables.map((v) => ({
          ...v,
          currentValue: v.initialValue, // Sanitiza para exportação
        })),
      };
      defaultPath = `${selectedEnv.name.replace(/\s+/g, "_").toLowerCase()}_env.json`;
    } else {
      content = {
        type: "globals",
        variables: globals,
      };
      defaultPath = "global_variables.json";
    }

    (window as any).electronAPI.logAction(
      `Exportando ${viewMode === "envs" ? "ambiente" : "variáveis globais"}: ${viewMode === "envs" ? selectedEnv?.name : "global"}`,
    );

    await (window as any).electronAPI.saveFile({ content, defaultPath });
  };

  const handleImport = async () => {
    if (!(window as any).electronAPI) return;

    const path = await (window as any).electronAPI.selectFile();
    if (!path) return;

    try {
      const data = await (window as any).electronAPI.readJsonFile(path);

      if (viewMode === "envs") {
        if (data.type === "environment" || data.variables) {
          const newId = importEnvironment(data);
          if (newId) setSelectedEnvId(newId);
        }
      } else {
        if (data.type === "globals" || Array.isArray(data)) {
          const globalsList = Array.isArray(data) ? data : data.variables;
          importGlobals(globalsList);
        }
      }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[80%]! max-w-[95%]! min-h-[80%]! max-h-[95%]! bg-zinc-950 rounded-xl border border-zinc-800! shadow-2xl overflow-hidden flex flex-col z-50 outline-none animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800! bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <Settings className="text-yellow-500" size={20} />
                <Dialog.Title className="text-xl! font-bold tracking-tight truncate text-white m-0">
                  {viewMode === "envs"
                    ? "Gerenciar Ambientes"
                    : "Variáveis Globais"}
                </Dialog.Title>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-zinc-800! rounded-lg overflow-hidden h-9 mr-2 p-0">
                  <button
                    onClick={handleImport}
                    className="flex items-center h-full gap-2 px-3 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-400 hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    <Download size={16} />
                    <span>Importar</span>
                  </button>
                  <div className="w-px h-5 bg-zinc-800"></div>
                  <button
                    onClick={handleExport}
                    className="flex items-center h-full gap-2 px-3 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-400 hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    <Upload size={16} />
                    <span>Exportar</span>
                  </button>
                </div>
                <Dialog.Close asChild>
                  <button className="flex items-center justify-center rounded-md! h-9 w-9 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white border-none bg-transparent cursor-pointer">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {viewMode === "envs" ? (
                <>
                  {/* Sidebar do Modal */}
                  <div className="w-64 border-r border-zinc-800! flex flex-col col-3 bg-zinc-900/30">
                    <div className="p-2 flex flex-col gap-1 overflow-y-auto h-full">
                      <div className="flex items-center justify-between">
                        <p className="px-3 pt-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          Ambientes
                        </p>
                      </div>

                      {environments.map((env: any) => (
                        <div
                          key={env.id}
                          onClick={() => setSelectedEnvId(env.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${
                            selectedEnvId === env.id
                              ? "bg-zinc-800 border-zinc-700! text-white shadow-sm"
                              : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-transparent!"
                          }`}
                        >
                          <Code
                            size={18}
                            className={
                              selectedEnvId === env.id
                                ? "text-yellow-500"
                                : "text-zinc-500"
                            }
                          />
                          <p className="text-sm font-medium leading-normal flex-1 truncate m-0">
                            {env.name}
                          </p>
                          {activeEnvironmentId === env.id && (
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          )}
                        </div>
                      ))}

                      <div className="mt-2 pt-2 border-t border-zinc-800!">
                        <button
                          onClick={handleAddEnv}
                          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg! hover:bg-yellow-500/10 text-yellow-500 transition-colors text-left group border-none bg-transparent cursor-pointer"
                        >
                          <Plus size={18} />
                          <p className="text-sm font-bold m-0">Novo Ambiente</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col bg-zinc-950">
                    {selectedEnv ? (
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-full">
                            <input
                              type="text"
                              value={selectedEnv.name}
                              onChange={(e) =>
                                updateEnvironmentName(
                                  selectedEnv.id,
                                  e.target.value,
                                )
                              }
                              className="text-lg! font-semibold text-white bg-transparent border-none outline-none focus:ring-0 w-full p-0 mb-1 hover:bg-zinc-800/30 rounded! px-1 -ml-1 transition-colors"
                            />
                            <p className="text-sm text-zinc-500">
                              Configure as variáveis para o ambiente{" "}
                              {selectedEnv.name}.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setActiveEnvironment(selectedEnv.id)
                              }
                              disabled={activeEnvironmentId === selectedEnv.id}
                              className={`flex items-center gap-2 px-3 h-8 rounded text-xs font-bold transition-all border-none cursor-pointer ${
                                activeEnvironmentId === selectedEnv.id
                                  ? "bg-green-500/10 text-green-500 cursor-default"
                                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                              }`}
                            >
                              {activeEnvironmentId === selectedEnv.id ? (
                                <>
                                  <Check size={14} /> Ativo
                                </>
                              ) : (
                                "Ativar"
                              )}
                            </button>
                            <button
                              onClick={() => setEnvToDelete(selectedEnv)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-zinc-800! bg-zinc-900/30">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-900/50 border-b border-zinc-800!">
                                <th className="px-3 py-2 text-sm font-medium text-zinc-300 w-1/4">
                                  Variável
                                </th>
                                <th className="px-3 py-2 text-sm font-medium text-zinc-300 w-1/3">
                                  Valor Inicial
                                </th>
                                <th className="px-4 py-2 text-sm font-medium text-zinc-300 w-1/3">
                                  Valor Atual
                                </th>
                                <th className="px-2 py-2 text-sm font-medium text-zinc-500 w-12 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEnv.variables.map((v: any) => (
                                <tr
                                  key={v.id}
                                  className="border-b border-zinc-800/50! hover:bg-zinc-800/20 transition-colors"
                                >
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={v.key}
                                      placeholder="CHAVE"
                                      onChange={(e) =>
                                        updateVariable(selectedEnv.id, v.id, {
                                          key: e.target.value,
                                        })
                                      }
                                      className="w-full bg-transparent border-none outline-none text-sm! text-zinc-200 font-mono placeholder:text-zinc-700"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={v.initialValue}
                                      placeholder="Valor inicial"
                                      onChange={(e) =>
                                        updateVariable(selectedEnv.id, v.id, {
                                          initialValue: e.target.value,
                                        })
                                      }
                                      className="w-full bg-transparent border-none outline-none text-sm! text-zinc-400 font-mono placeholder:text-zinc-700"
                                    />
                                  </td>
                                  <td className="px-2 py-2 pe-0">
                                    <input
                                      type="text"
                                      value={v.currentValue}
                                      placeholder={
                                        v.initialValue || "Valor atual"
                                      }
                                      onChange={(e) =>
                                        updateVariable(selectedEnv.id, v.id, {
                                          currentValue: e.target.value,
                                        })
                                      }
                                      className={`w-full bg-transparent border-none outline-none text-sm! font-mono placeholder:text-zinc-600 ${
                                        !v.currentValue && v.initialValue
                                          ? "text-zinc-500 italic opacity-50"
                                          : "text-zinc-400"
                                      }`}
                                    />
                                  </td>
                                  <td className="px-1 py-2 text-center">
                                    <button
                                      onClick={() =>
                                        deleteVariable(selectedEnv.id, v.id)
                                      }
                                      className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-zinc-900/20">
                                <td colSpan={4} className="p-0">
                                  <button
                                    onClick={() => addVariable(selectedEnv.id)}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all border-none bg-transparent cursor-pointer"
                                  >
                                    <PlusCircle size={18} />
                                    <span>Adicionar Variável</span>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-zinc-500/10 border border-zinc-500/20! mt-4 py-3 px-4 rounded-lg flex items-center gap-2">
                          <Info
                            size={18}
                            className="text-amber-400 shrink-0 m-0"
                          />
                          <p className="text-[0.65rem]! text-zinc-400 m-0 text-left">
                            <span className="text-amber-300/80 font-bold">
                              Valores Iniciais:
                            </span>{" "}
                            Compartilhados na exportação da coleção. <br />
                            <span className="text-amber-300/80 font-bold">
                              Valores Atuais:
                            </span>{" "}
                            Locais e privados (ideais para segredos).
                          </p>
                        </div>

                        {/* Help Section */}
                        <div className="mt-6 border-t border-zinc-800! pt-3 mb-2">
                          <button
                            onClick={() => setIsHelpOpen(!isHelpOpen)}
                            className="flex items-center justify-between w-full p-0 bg-transparent border-none outline-none group/help cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-yellow-500">
                              <Info size={18} />
                              <h3 className="text-base! font-bold text-white m-0 group-hover/help:text-yellow-500 transition-colors text-left">
                                Como usar Variáveis de Ambiente
                              </h3>
                            </div>
                            <div className="bg-zinc-800/50 p-1 rounded transition-colors group-hover/help:bg-zinc-800">
                              {isHelpOpen ? (
                                <ChevronUp
                                  size={16}
                                  className="text-zinc-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                  className="text-zinc-400"
                                />
                              )}
                            </div>
                          </button>

                          {isHelpOpen && (
                            <div className="space-y-6 mt-6 animate-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <section className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50!">
                                  <h4 className="text-xs! font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                                    <Zap
                                      size={14}
                                      className="text-yellow-500"
                                    />
                                    O Conceito
                                  </h4>
                                  <p className="text-[0.7rem] text-zinc-400 leading-relaxed m-0 text-left">
                                    Variáveis permitem que você armazene valores
                                    que mudam dependendo do contexto (ex: URLs
                                    de produção vs local, tokens de acesso) e os
                                    reutilize em qualquer lugar.
                                  </p>
                                </section>

                                <section className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50!">
                                  <h4 className="text-xs! font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                                    <Code size={14} className="text-blue-400" />
                                    Sintaxe
                                  </h4>
                                  <p className="text-[0.7rem]! text-zinc-400 mb-2 m-0 text-left">
                                    Para usar uma variável, envolva o nome dela
                                    em chaves duplas:
                                  </p>
                                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800! font-mono text-[0.7rem]! text-yellow-500/90 italic text-left">
                                    {"{{nome_da_variavel}}"}
                                  </div>
                                </section>
                              </div>

                              <section className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50!">
                                <h4 className="text-xs! font-bold text-white mb-3 uppercase tracking-wide text-left">
                                  Exemplos Práticos
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div className="bg-zinc-800/50 p-2.5 rounded border border-zinc-700/50!">
                                    <span className="text-[0.6rem] text-zinc-500 uppercase font-bold block mb-1 text-left">
                                      Na URL
                                    </span>
                                    <code className="text-[0.7rem] text-zinc-200">
                                      {"{{base_url}}v1/users"}
                                    </code>
                                  </div>
                                  <div className="bg-zinc-800/50 p-2.5 rounded border border-zinc-700/50!">
                                    <span className="text-[0.6rem] text-zinc-500 uppercase font-bold block mb-1 text-left">
                                      Nos Headers
                                    </span>
                                    <div className="flex justify-between text-[0.7rem]">
                                      <span className="text-blue-400 font-medium">
                                        Authorization
                                      </span>
                                      <span className="text-zinc-200">
                                        {"Bearer {{token}}"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-zinc-800/50 p-2.5 rounded border border-zinc-700/50!">
                                  <span className="text-[0.6rem] text-zinc-500 uppercase font-bold block mb-1 text-left">
                                    No Body (JSON)
                                  </span>
                                  <pre className="text-[0.65rem] text-zinc-400 mt-1 m-0 text-left font-mono">
                                    {'{\n "email": "{{user_email}}"\n}'}
                                  </pre>
                                </div>
                              </section>

                              <div className="bg-blue-500/10 border border-blue-500/20! p-4 rounded-lg flex items-center gap-3">
                                <Info
                                  size={16}
                                  className="text-blue-400 shrink-0 m-0"
                                />
                                <p className="text-[0.72rem] leading-relaxed text-blue-200 m-0 text-left">
                                  <strong>Dica:</strong> Se o valor atual
                                  estiver vazio, o sistema utilizará o valor
                                  inicial. Se a variável não for encontrada, o
                                  texto original{" "}
                                  <code className="text-blue-100">
                                    {"{{variavel}}"}
                                  </code>{" "}
                                  será enviado.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <Settings size={48} className="opacity-20" />
                        <p>
                          Selecione um ambiente para gerenciar suas variáveis
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Global Mode Content Area */
                <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                      <h2 className="text-lg! font-semibold text-white m-0">
                        Variáveis Globais
                      </h2>
                      <p className="text-sm text-zinc-500 text-left">
                        Variáveis universais que funcionam em todos os
                        ambientes. Elas não acompanham a coleção ao exportar.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-zinc-800! bg-zinc-900/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-900/50 border-b border-zinc-800!">
                            <th className="px-3 py-2 text-sm font-medium text-zinc-300 w-1/3">
                              Variável
                            </th>
                            <th className="px-3 py-2 text-sm font-medium text-zinc-300 w-1/2">
                              Valor
                            </th>
                            <th className="px-2 py-2 text-sm font-medium text-zinc-500 w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {globals.map((v: any) => (
                            <tr
                              key={v.id}
                              className="border-b border-zinc-800/50! hover:bg-zinc-800/20 transition-colors"
                            >
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={v.key}
                                  placeholder="CHAVE_GLOBAL"
                                  onChange={(e) =>
                                    updateGlobalVariable(v.id, {
                                      key: e.target.value,
                                    })
                                  }
                                  className="w-full bg-transparent border-none outline-none text-sm! text-zinc-200 font-mono placeholder:text-zinc-700"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={v.value}
                                  placeholder="Valor"
                                  onChange={(e) =>
                                    updateGlobalVariable(v.id, {
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-full bg-transparent border-none outline-none text-sm! text-zinc-400 font-mono placeholder:text-zinc-700"
                                />
                              </td>
                              <td className="px-1 py-2 text-center">
                                <button
                                  onClick={() => deleteGlobalVariable(v.id)}
                                  className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-zinc-900/20">
                            <td colSpan={3} className="p-0">
                              <button
                                onClick={addGlobalVariable}
                                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all border-none bg-transparent cursor-pointer"
                              >
                                <PlusCircle size={18} />
                                <span>Adicionar Variável Global</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-8 bg-zinc-900/50 border border-zinc-800! p-4 rounded-lg flex gap-3">
                      <Info
                        size={16}
                        className="text-zinc-500 shrink-0 mt-0.5"
                      />
                      <div className="space-y-2">
                        <p className="text-[0.75rem] text-zinc-200 leading-relaxed font-bold m-0 text-left">
                          Hierarquia e Sobrescrita
                        </p>
                        <p className="text-[0.7rem] text-zinc-400 leading-relaxed m-0 text-left">
                          Se houver uma variável com o mesmo nome em um{" "}
                          <span className="text-zinc-200">Ambiente Ativo</span>{" "}
                          e na seção{" "}
                          <span className="text-zinc-200">Global</span>, o valor
                          do ambiente terá prioridade e sobrescreverá o valor
                          global.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="px-2 py-2.5 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <button
                onClick={() =>
                  setViewMode(viewMode === "envs" ? "globals" : "envs")
                }
                className={`flex items-center px-2 gap-2 h-10 rounded-lg! transition-colors font-medium text-sm! border-none cursor-pointer ${
                  viewMode === "globals"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent"
                }`}
              >
                {viewMode === "envs" ? (
                  <>
                    <History size={14} />
                    Gerenciar Globais
                  </>
                ) : (
                  <>
                    <Settings size={14} />
                    Voltar para Ambientes
                  </>
                )}
              </button>
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button className="h-10 px-3 rounded-lg! bg-zinc-800 text-zinc-300 text-sm! font-bold hover:bg-zinc-700 transition-colors border-none cursor-pointer">
                    Cancelar
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <button className="h-10 px-3 rounded-lg! bg-yellow-600 text-zinc-950 text-sm! font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-600/10! border-none cursor-pointer">
                    Fechar
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de Confirmação customizado */}
      <Dialog.Root
        open={!!envToDelete}
        onOpenChange={() => setEnvToDelete(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-zinc-950 rounded-xl border border-zinc-800! shadow-2xl p-6 z-60 outline-none animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Trash2 size={24} />
              </div>
              <Dialog.Title className="text-lg font-bold text-white">
                Excluir Ambiente
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-400">
                Tem certeza que deseja excluir o ambiente{" "}
                <span className="text-zinc-200 font-bold">
                  "{envToDelete?.name}"
                </span>
                ? Esta ação não pode ser desfeita.
              </Dialog.Description>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setEnvToDelete(null)}
                  className="flex-1 h-10 rounded-lg! bg-zinc-800 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteEnv}
                  className="flex-1 h-10 rounded-lg! bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/10 border-none cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
