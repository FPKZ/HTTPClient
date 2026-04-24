/**
 * Traduz termos técnicos para o usuário.
 */
export const translate = (text: string): string => {
  const translations: Record<string, string> = {
    route: "rota",
    folder: "pasta",
  };
  return translations[text] || text;
};
