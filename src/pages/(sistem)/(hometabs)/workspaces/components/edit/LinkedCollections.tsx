import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";
import { Folder, Plus, Download, Trash2 } from "lucide-react";

export default function LinkedCollections() {
  const {
    linkedCollections,
    handleAddCollection,
    handleDeleteCollection,
    handleExportCollection,
  } = useWorkspaceEditContext();

  const handleQuickAdd = () => {
    const defaultNames = [
      "User Accounts API",
      "Billing & Invoices",
      "Notification Dispatcher",
      "Analytics & Reporting",
      "Search Engine Service",
    ];
    // Evita duplicar se possível, ou escolhe aleatoriamente
    const unadded = defaultNames.filter(
      (name) => !linkedCollections.some((c) => c.name === name)
    );
    const nameToAdd = unadded.length > 0 
      ? unadded[0] 
      : defaultNames[Math.floor(Math.random() * defaultNames.length)] + ` (${linkedCollections.length + 1})`;
      
    handleAddCollection(nameToAdd);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header da Seção */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Coleções Vinculadas
        </span>
        
        <button
          type="button"
          onClick={handleQuickAdd}
          className="
            flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover
            transition-colors cursor-pointer outline-none
          "
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>ADICIONAR</span>
        </button>
      </div>

      {/* Lista de Coleções */}
      <div className="flex flex-col gap-2.5">
        {linkedCollections.length === 0 ? (
          <span className="text-zinc-500 text-xs py-2 italic">
            Nenhuma coleção vinculada a este workspace.
          </span>
        ) : (
          linkedCollections.map((col) => (
            <div
              key={col.id}
              className="
                flex items-center justify-between p-3.5 rounded-md border select-none
                bg-[#111113] border-zinc-800/80 hover:bg-[#141416]
                transition-all duration-200 group
              "
            >
              {/* Informações da Coleção */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                {/* Pasta Ícone Laranja */}
                <div className="text-brand shrink-0 flex items-center justify-center">
                  <Folder size={18} className="fill-brand/10" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-zinc-100 font-bold text-[0.875rem] leading-tight truncate">
                    {col.name}
                  </span>
                  <span className="text-zinc-500 text-[0.7rem] mt-0.5 leading-none">
                    {col.version || "v1.0.0"} • {col.endpointsCount !== undefined ? col.endpointsCount : 0} endpoints
                  </span>
                </div>
              </div>

              {/* Botões de Ação na Direita (estilo lista de membros) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Exportar */}
                <button
                  type="button"
                  onClick={() => handleExportCollection(col)}
                  title="Exportar Coleção"
                  className="
                    p-1.5 rounded text-zinc-500 hover:text-brand hover:bg-zinc-900
                    transition-all duration-150 cursor-pointer outline-none
                  "
                >
                  <Download size={14} />
                </button>
                
                {/* Excluir */}
                <button
                  type="button"
                  onClick={() => handleDeleteCollection(col.id)}
                  title="Remover Coleção"
                  className="
                    p-1.5 rounded text-zinc-550 hover:text-rose-450 hover:bg-zinc-900
                    transition-all duration-150 cursor-pointer outline-none
                  "
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
