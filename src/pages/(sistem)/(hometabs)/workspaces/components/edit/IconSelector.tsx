import { useWorkspaceEditContext } from "../../context/WorkspaceEditContext";
import { useWorkspaceTheme } from "@/core/hooks/useWorkspaceTheme";

export default function IconSelector() {
  const { workspace, handleChangeIcon } = useWorkspaceEditContext();

  if (!workspace) return null;

  const currentIconName = workspace.icon || "box";
  const { Icon: SelectedIcon, colorClass, bgClass } = useWorkspaceTheme(currentIconName);

  // Nomes dos ícones disponíveis
  const iconOptions = ["terminal", "globe", "gauge", "box"];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
        Ícone
      </span>
      
      {/* Caixa de Visualização do Ícone Grande - Usa os mesmos estilos do card */}
      <div
        className={`
          w-24 h-24 rounded-xl border flex items-center justify-center
          shadow-inner shadow-black/30 transition-all duration-200
          ${bgClass}
        `}
      >
        <SelectedIcon className={colorClass} size={38} strokeWidth={2} />
      </div>

      {/* Lista de Ícones Pequenos para Seleção */}
      <div className="flex items-center gap-2 mt-1">
        {iconOptions.map((name) => {
          const isSelected = currentIconName === name;
          // Resolve o tema de cada ícone individual para colorir as opções selecionadas com fidelidade
          const { Icon: OptionIcon, colorClass: optColor, bgClass: optBg } = useWorkspaceTheme(name);
          
          return (
            <button
              key={name}
              type="button"
              onClick={() => handleChangeIcon(name)}
              title={`Selecionar ícone ${name}`}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center border
                transition-all duration-200 cursor-pointer scale-100 hover:scale-105 active:scale-95
                ${isSelected
                  ? `${optBg} ${optColor} border-brand/40 shadow-sm shadow-black/40`
                  : "bg-[#0f0f12] border-zinc-800/80 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }
              `}
            >
              <OptionIcon size={12} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
