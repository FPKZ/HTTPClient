/**
 * Data Transformers
 * Funções utilitárias para conversão de estruturas de dados.
 */

/**
 * Converte uma lista de objetos { key, value, enabled } em uma string JSON formatada.
 * Tenta fazer o parse de valores que parecem JSON.
 */
export const listToJson = (list) => {
  const obj = {};
  if (Array.isArray(list)) {
    list.forEach((item) => {
      if (item.key) {
        let val = item.value;
        // Tenta fazer o parse de volta para objeto se parecer JSON
        try {
          if (
            typeof val === "string" &&
            (val.trim().startsWith("{") || val.trim().startsWith("["))
          ) {
            val = JSON.parse(val);
          }
        } catch {
          // Se falhar o parse, mantém como string
        }
        obj[item.key] = val;
      }
    });
  }
  return JSON.stringify(obj, null, 2);
};

/**
 * Converte uma string JSON em uma lista de objetos { key, value, enabled }.
 * Objetos aninhados são convertidos em string.
 */
export const jsonToList = (jsonStr) => {
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
