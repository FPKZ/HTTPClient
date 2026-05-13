import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Template HTML para a página de callback do OAuth.
 * Esta página captura o hash da URL (tokens) e envia para o servidor desktop local.
 */

// Fallback caso o arquivo não seja encontrado (garante funcionamento após build)
const DEFAULT_HTML = `
<!DOCTYPE html>
<html lang="pt-br">
  <head>
      <meta charset="UTF-8">
      <title>Volt Auth - Sincronizando</title>
      <style>body { background: #0f0f0f; color: #e2e8f0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }</style>
  </head>
  <body>
      <div style="text-align: center;">
          <h1>Autenticando...</h1>
          <p>Aguarde enquanto sincronizamos sua conta.</p>
      </div>
      <script>
          const hash = window.location.hash;
          if (hash) {
              fetch('/capture' + window.location.search + hash.replace('#', '?'))
                  .then(() => setTimeout(() => window.close(), 2000))
                  .catch(console.error);
          }
      </script>
  </body>
</html>
`;

function loadHtmlTemplate(): string {
  const isDev = process.env.NODE_ENV === "development" || process.env.DEBUG === "true";
  
  try {
    // Lista de caminhos possíveis para tentar encontrar o template
    const pathsToTry = [
      // 1. Relativo ao arquivo compilado em dist_electron/ (Dev com tsup)
      path.join(__dirname, "../electron/templates/oauth-callback.html"),
      // 2. Relativo à raiz do projeto (Dev)
      path.join(process.cwd(), "electron/templates/oauth-callback.html"),
      // 3. Relativo ao __dirname (Prod se copiado para a mesma pasta)
      path.join(__dirname, "templates/oauth-callback.html"),
      // 4. Fallback prod (dist_electron/templates/...)
      path.join(__dirname, "../templates/oauth-callback.html"),
    ];

    for (const templatePath of pathsToTry) {
      if (fs.existsSync(templatePath)) {
        console.log(`[OAuthHtml] Template encontrado em: ${templatePath}`);
        return fs.readFileSync(templatePath, "utf-8");
      }
    }

    console.warn("[OAuthHtml] Nenhum arquivo de template encontrado. Usando fallback embutido.");
    return DEFAULT_HTML;
  } catch (error) {
    console.error("[OAuthHtml] Erro crítico ao carregar template HTML:", error);
    return DEFAULT_HTML;
  }
}

export const OAUTH_CALLBACK_HTML = loadHtmlTemplate();
