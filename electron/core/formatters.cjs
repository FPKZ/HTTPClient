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

    processRoutes(internalModel.routes);
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
    return this._processRoutes(internalModel.routes);
  }

  _processRoutes(routes) {
    let content = "";
    routes.forEach((route) => {
      if (route.items && Array.isArray(route.items)) {
        // É uma pasta, processa os itens internos recursivamente
        content += `### PASTA: ${route.name}\n\n`;
        content += this._processRoutes(route.items);
      } else if (route.request) {
        content += this._formatRequest(route);
      }
    });
    return content;
  }

  _formatRequest(route) {
    const req = route.request;
    let httpContent = `### ${route.name || "Request"}\n`;
    httpContent += `${req.method} ${req.url}\n`;

    route.request.headers?.forEach(({ key, value, enabled }) => {
      if (enabled) httpContent += `${key}: ${value}\n`;
    });

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

  _formatFormData(formData) {
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    let content = "";

    // formData aqui é a lista 'content' se for mode 'formdata' ou 'inputs'
    if (Array.isArray(formData)) {
      formData.forEach(({ key, value, enabled }) => {
        if (!enabled) return;
        content += `--${boundary}\n`;
        // Nota: se for arquivo, o valor é o path no nosso modelo simplificado
        if (
          typeof value === "string" &&
          (value.includes("/") || value.includes("\\"))
        ) {
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
