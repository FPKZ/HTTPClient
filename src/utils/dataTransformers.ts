/**
 * Data Transformers
 * Funções utilitárias para conversão de estruturas de dados.
 */

/**
 * Converte uma lista de objetos { key, value, enabled } em uma string JSON formatada.
 */
export const listToJson = (list: any[]): string => {
  const obj: Record<string, any> = {};
  if (Array.isArray(list)) {
    list.forEach((item) => {
      if (item.key) {
        let val = item.value;
        try {
          if (
            typeof val === "string" &&
            (val.trim().startsWith("{") || val.trim().startsWith("["))
          ) {
            val = JSON.parse(val);
          }
        } catch {
          // Ignora erro de parse
        }
        obj[item.key] = val;
      }
    });
  }
  return JSON.stringify(obj, null, 2);
};

/**
 * Converte uma string JSON em uma lista de objetos { key, value, enabled }.
 */
export const jsonToList = (jsonStr: string): any[] => {
  try {
    const obj = JSON.parse(jsonStr);
    return Object.entries(obj).map(([key, value]) => ({
      key,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
      enabled: true,
    }));
  } catch (e) {
    console.warn("[DataTransformers] Falha ao converter JSON para lista:", e);
    return [];
  }
};
