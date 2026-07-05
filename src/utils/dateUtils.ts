interface RelativeTimeOptions {
  uppercase?: boolean;
}

/**
 * Retorna uma representação legível e relativa de tempo decorrido.
 * Suporta formatos tradicionais (ex: "2h atrás") e formatos em caixa alta para histórico (ex: "HÁ 2 H").
 */
export function getRelativeTime(
  dateValue: string | number | Date | null | undefined,
  options?: RelativeTimeOptions
): string {
  if (!dateValue) {
    return options?.uppercase ? "RECENTEMENTE" : "recentemente";
  }

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return options?.uppercase ? "RECENTEMENTE" : "recentemente";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Menos de 1 minuto
    if (diffMs < 60000) {
      return options?.uppercase ? "AGORA" : "agora mesmo";
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return options?.uppercase ? `HÁ ${diffMins} MIN` : `${diffMins}m atrás`;
    }

    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) {
      return options?.uppercase ? `HÁ ${diffHours} H` : `${diffHours}h atrás`;
    }

    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 1 && options?.uppercase) {
      return "ONTEM";
    }
    if (diffDays < 30) {
      return options?.uppercase ? `HÁ ${diffDays} DIAS` : `${diffDays}d atrás`;
    }

    return date.toLocaleDateString("pt-BR");
  } catch {
    // Trata datas formatadas como string simples ex: "2022-01-01"
    if (typeof dateValue === "string" && dateValue.includes("-")) {
      const parts = dateValue.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return options?.uppercase ? "RECENTEMENTE" : "recentemente";
  }
}
