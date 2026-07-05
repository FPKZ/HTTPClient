import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";
import { Edit3, Check, X } from "lucide-react";

export default function InfoFields() {
  const {
    nameInput,
    setNameInput,
    descriptionInput,
    setDescriptionInput,
    isEditingName,
    setIsEditingName,
    isEditingDescription,
    setIsEditingDescription,
    handleSaveName,
    handleSaveDescription,
    workspace,
  } = useWorkspaceEditContext();

  if (!workspace) return null;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Campo Nome do Workspace */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Nome do Workspace
        </span>
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            disabled={!isEditingName}
            className={`
              w-full py-2 px-3 pr-10 rounded text-[1.1rem] font-bold text-white outline-none
              transition-all duration-200 border
              ${isEditingName
                ? "bg-[#0b0b0d] border-brand/50 ring-1 ring-brand/35"
                : "bg-[#0c0c0e] border-zinc-800/40 text-zinc-300 disabled:opacity-90"
              }
            `}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setIsEditingName(false);
                setNameInput(workspace.name || "");
              }
            }}
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {isEditingName ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveName}
                  title="Salvar Nome"
                  className="p-1 rounded text-green-500 hover:text-green-400 hover:bg-green-950/20 transition-all cursor-pointer"
                >
                  <Check size={16} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setNameInput(workspace.name || "");
                  }}
                  title="Cancelar"
                  className="p-1 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                title="Editar Nome"
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <Edit3 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campo Descrição */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Descrição
        </span>
        <div className="relative w-full flex items-center">
          <textarea
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            disabled={!isEditingDescription}
            rows={2}
            className={`
              w-full py-2 px-3 pr-10 rounded text-[0.875rem] text-zinc-300 leading-relaxed outline-none
              transition-all duration-200 border resize-none h-16
              ${isEditingDescription
                ? "bg-[#0b0b0d] border-brand/50 ring-1 ring-brand/35"
                : "bg-[#0c0c0e] border-zinc-800/40 text-zinc-400 disabled:opacity-90"
              }
            `}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveDescription();
              }
              if (e.key === "Escape") {
                setIsEditingDescription(false);
                setDescriptionInput(workspace.description || "");
              }
            }}
          />

          <div className="absolute right-2 top-2 flex items-center gap-1">
            {isEditingDescription ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveDescription}
                  title="Salvar Descrição"
                  className="p-1 rounded text-green-500 hover:text-green-400 hover:bg-green-950/20 transition-all cursor-pointer"
                >
                  <Check size={16} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingDescription(false);
                    setDescriptionInput(workspace.description || "");
                  }}
                  title="Cancelar"
                  className="p-1 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingDescription(true)}
                title="Editar Descrição"
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <Edit3 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
