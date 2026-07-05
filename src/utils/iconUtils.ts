import { Terminal, Globe, Gauge, Box, Folder, Settings, User, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  globe: Globe,
  gauge: Gauge,
  box: Box,
  folder: Folder,
  settings: Settings,
  user: User,
};

/**
 * Retorna o componente Lucide correspondente à string fornecida.
 * Fallback para o ícone Box se o nome for nulo ou desconhecido.
 */
export function getIconByName(iconName?: string | null): LucideIcon {
  if (!iconName) return Box;
  const key = iconName.trim().toLowerCase();
  return iconMap[key] || Box;
}
