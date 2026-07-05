import { getIconByName } from "@/utils/iconUtils";
import { LucideIcon } from "lucide-react";

interface WorkspaceThemeResult {
  Icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

/**
 * Hook customizado para obter o componente visual do ícone e suas classes
 * css de estilização (cor de texto, fundo e bordas do container) correspondentes.
 */
export function useWorkspaceTheme(iconName?: string | null): WorkspaceThemeResult {
  const Icon = getIconByName(iconName);

  if (iconName === "terminal") {
    return {
      Icon,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-950/20 border-amber-800/30",
    };
  }
  if (iconName === "globe") {
    return {
      Icon,
      colorClass: "text-sky-500",
      bgClass: "bg-sky-950/20 border-sky-800/30",
    };
  }
  if (iconName === "gauge") {
    return {
      Icon,
      colorClass: "text-violet-500",
      bgClass: "bg-violet-950/20 border-violet-800/30",
    };
  }

  // Padrão (Box)
  return {
    Icon,
    colorClass: "text-zinc-400",
    bgClass: "bg-zinc-900 border-zinc-800",
  };
}
