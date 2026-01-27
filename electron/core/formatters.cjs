/**
 * Formatters
 * Segue o Princípio da Segregação de Interface (ISP) e SRP.
 * Cada classe tem uma única responsabilidade de formatação.
 */

class AxiosFormatter {
  format(internalModel) {
    const result = {};

    const processRoutes = (routes, parentPath = "") => {
      routes.forEach((route) => {
        const currentPath = parentPath
          ? `${parentPath} / ${route.name}`
          : route.name;

        if (route.items && Array.isArray(route.items)) {
          // É uma pasta, processa recursivamente
          processRoutes(route.items, currentPath);
        } else if (route.request) {
          // É uma requisição direta
          const method = route.request.method || "GET";
          const uniqueKey = `[${method}] ${currentPath}`;
          result[uniqueKey] = this._formatRequest(route);
        }
      });
    };

    processRoutes(internalModel.items);
    return result;
  }

  _formatRequest(item) {
    return {
      request: item.request,
    };
  }
}

class HttpFormatter {
  format(internalModel) {
    let content = `### REST Client Documentation\n`;
    content += `# Use 'Ctrol+Shift+O' (Cmd+Shift+O on macOS) para pesquisar.\n`;
    content += `# Use 'Ctrl+Alt+R' (Cmd+Alt+R on macOS) para executar uma requisição.\n`;
    content += `# Use '###' para separar requisições.\n`;
    content += `# Documentação: https://marketplace.visualstudio.com/items?itemName=humao.rest-client\n\n`;

    // Variáveis de Ambiente
    if (
      internalModel.environments &&
      Array.isArray(internalModel.environments)
    ) {
      const activeEnvs = internalModel.environments.filter(
        (env) => env.enabled,
      );
      if (activeEnvs.length > 0) {
        activeEnvs.forEach((env) => {
          // Exporta sem aspas para evitar que o REST Client as inclua no valor final do header
          content += `@${env.name} = ${env.value}\n`;
        });
        content += `\n`;
      }
    }

    return content + this._processRoutes(internalModel.items);
  }

  _processRoutes(routes) {
    let content = "";
    routes.forEach((route) => {
      if (route.items && Array.isArray(route.items)) {
        // É uma pasta, processa os itens internos recursivamente
        content += `############################################################\n`;
        content += `# PASTA: ${route.name}\n`;
        content += `############################################################\n\n`;
        content += this._processRoutes(route.items);
      } else if (route.request) {
        content += this._formatRequest(route);
      }
    });
    return content;
  }

  _formatRequest(route) {
    const req = route.request;
    const method = (req.method || "GET").toUpperCase();
    const name = route.name || "Request";
    const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");

    let httpContent = `### ${name}\n`;
    httpContent += `# @name req_${safeName}\n`;
    httpContent += this._getMethodComment(method);
    httpContent += `${method} ${req.url}\n`;

    // Headers
    const headers = route.request.headers || [];
    const hasContentType = headers.some(
      (h) => h.key.toLowerCase() === "content-type" && h.enabled,
    );

    headers.forEach(({ key, value, enabled }) => {
      if (enabled) httpContent += `${key}: ${value}\n`;
    });

    // Auth Header handling
    if (
      req.auth &&
      req.auth.name !== "none" &&
      req.auth.config &&
      req.auth.config.value === "header"
    ) {
      const authHeaderName = req.auth.name;
      const type = req.auth.config.type;
      const key = req.auth.config.key || "";

      // Adicionamos o prefixo automaticamente se configurado no sistema (ex: Bearer, Basic),
      // mesmo que o valor seja uma variável {{...}}.
      // Só evitamos se o valor já começar com o prefixo para não duplicar.
      const needsPrefix =
        type &&
        type !== "none" &&
        !key.toLowerCase().startsWith(type.toLowerCase());

      const authPrefix = needsPrefix ? `${type} ` : "";
      const authValue = `${authPrefix}${key}`.trim();

      const alreadyHasAuth = headers.some(
        (h) =>
          h.key.toLowerCase() === authHeaderName.toLowerCase() && h.enabled,
      );

      if (!alreadyHasAuth && authValue) {
        httpContent += `${authHeaderName}: ${authValue}\n`;
      }
    }

    // Auto-add Content-Type if missing for JSON bodies
    if (!hasContentType && req.body && req.body.mode === "json") {
      httpContent += `Content-Type: application/json\n`;
    }

    if (req.body && req.body.mode !== "none") {
      httpContent += "\n";
      if (req.body.mode === "inputs" || req.body.mode === "formdata") {
        if (req.body.mode === "formdata") {
          httpContent += this._formatFormData(req.body.content);
        } else {
          // JSON simplificado a partir dos inputs
          const obj = {};
          req.body.content.forEach((i) => {
            if (i.enabled) obj[i.key] = i.value;
          });
          httpContent += JSON.stringify(obj, null, 2);
        }
      } else if (req.body.mode === "json") {
        httpContent += req.body.content;
      }
      httpContent += "\n";
    }

    return httpContent + "\n";
  }

  _getMethodComment(method) {
    switch (method) {
      case "GET":
        return `# Requisição para buscar dados\n`;
      case "POST":
        return `# Requisição para criar um novo recurso\n`;
      case "PUT":
        return `# Requisição para atualizar um recurso existente\n`;
      case "PATCH":
        return `# Requisição para atualização parcial de um recurso\n`;
      case "DELETE":
        return `# Requisição para remover um recurso\n`;
      default:
        return `# Requisição ${method}\n`;
    }
  }

  _formatFormData(formData) {
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    let content = "";

    if (Array.isArray(formData)) {
      formData.forEach(({ key, value, enabled }) => {
        if (!enabled) return;
        content += `--${boundary}\n`;
        if (
          typeof value === "string" &&
          (value.includes("/") || value.includes("\\"))
        ) {
          // REST Client syntax for files: < path/to/file
          content += `Content-Disposition: form-data; name="${key}"; filename="${value
            .split(/[/\\]/)
            .pop()}"\n\n`;
          content += `< ${value}\n`;
        } else {
          content += `Content-Disposition: form-data; name="${key}"\n\n`;
          content += `${value}\n`;
        }
      });
    }

    content += `--${boundary}--\n`;
    return content;
  }
}

module.exports = { AxiosFormatter, HttpFormatter };
