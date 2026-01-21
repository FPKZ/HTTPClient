import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Info, Code, Zap } from "lucide-react";
import useModalStore from "../../store/useModalStore";

export default function EnvInfoModal() {
  const isEnvInfoOpen = useModalStore((state) => state.isEnvInfoOpen);
  const setEnvInfoOpen = useModalStore((state) => state.setEnvInfoOpen);

  return (
    <Dialog.Root open={isEnvInfoOpen} onOpenChange={setEnvInfoOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-overlayShow" />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 
            w-[90vw] max-w-[600px] max-h-[85vh]
            -translate-x-1/2 -translate-y-1/2 
            rounded-lg border
            bg-zinc-900 border-zinc-800! shadow-2xl 
            focus:outline-none z-50 animate-contentShow
            flex flex-col p-0 overflow-hidden
          "
        >
          {/* Header Fixo */}
          <div className="flex items-center justify-between p-3 pb-2 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 text-yellow-500">
              <Info size={20} />
              <Dialog.Title className="text-lg font-bold text-white">
                Como usar Variáveis de Ambiente
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Área com Scroll Interno */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-zinc-300 custom-scrollbar">
            <section>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                <Zap size={14} className="text-yellow-500" />O Conceito
              </h3>
              <p className="text-xs leading-relaxed">
                Variáveis permitem que você armazene valores que mudam
                dependendo do contexto (ex: URLs de produção vs local, tokens de
                acesso, IDs de usuário) e os reutilize em qualquer lugar.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                <Code size={14} className="text-blue-400" />
                Sintaxe
              </h3>
              <p className="text-xs mb-3">
                Para usar uma variável, envolva o nome dela em chaves duplas:
              </p>
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800! font-mono text-[0.7rem] text-yellow-500/90 italic">
                {"{{nome_da_variavel}}"}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                Exemplos Práticos
              </h3>
              <div className="space-y-3">
                <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700/50!">
                  <span className="text-[0.65rem] text-zinc-500 uppercase font-bold block mb-1">
                    Na URL
                  </span>
                  <code className="text-xs text-zinc-200">
                    {"{{base_url}}v1/users"}
                  </code>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700/50!">
                  <span className="text-[0.65rem] text-zinc-500 uppercase font-bold block mb-1">
                    Nos Headers
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">Authorization</span>
                    <span className="text-zinc-200">{"Bearer {{token}}"}</span>
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700/50!">
                  <span className="text-[0.65rem] text-zinc-500 uppercase font-bold block mb-1">
                    No Body (JSON)
                  </span>
                  <pre className="text-[0.65rem] text-zinc-400 mt-1">
                    {`{
  "email": "{{admin_email}}",
  "apiKey": "{{secret_key}}"
}`}
                  </pre>
                </div>
              </div>
            </section>

            <div className="bg-blue-500/10 border border-blue-500/20! p-4 rounded-lg flex gap-3">
              <div className="text-blue-400 mt-0.5">
                <Info size={16} />
              </div>
              <p className="text-[0.7rem] leading-relaxed text-blue-300">
                <strong>Dica:</strong> Se a variável não for encontrada ou
                estiver desabilitada na barra lateral, o sistema enviará o texto
                original <code className="text-blue-200">{"{{variavel}}"}</code>
                .
              </p>
            </div>
          </div>

          {/* Footer Fixo */}
          <div className="flex justify-end p-3 border-t border-zinc-800/50">
            <Dialog.Close asChild>
              <button className="bg-yellow-600 text-white px-6 py-2 rounded text-xs font-bold hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-600/20 active:scale-95">
                Entendi
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
