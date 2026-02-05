/**
 *
 * @param {*} text
 * @returns translations = {
 *      "route": "rota",
 *      "folder": "pasta"
 * }
 */
export const translate = (text) => {
  const translations = {
    route: "rota",
    folder: "pasta",
  };
  return translations[text] || text;
};
