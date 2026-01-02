/**
 * Formatters
 * Segue o Princípio da Segregação de Interface (ISP) e SRP.
 * Cada classe tem uma única responsabilidade de formatação.
 */

class AxiosFormatter {
  format(internalModel) {
    const result = {};
    const processItems = (items) => {
      items.forEach((item) => {
        if (item.type === "folder") {
          result[item.name] = this._formatFolder(item.items);
        } else {
          result[item.name] = this._formatRequest(item);
        }
      });
    };

    processItems(internalModel.items);
    return result;
  }

  _formatFolder(items) {
    const folderResult = {};
    items.forEach((item) => {
      if (item.type === "folder") {
        folderResult[item.name] = this._formatFolder(item.items);
      } else {
        folderResult[item.name] = this._formatRequest(item);
      }
    });
    return folderResult;
  }

  _formatRequest(item) {
    return {
      name: item.name,
      request: item.request,
    };
  }
}

class HttpFormatter {
  format(internalModel) {
    return this._processItems(internalModel.items);
  }

  _processItems(items, parentName = "") {
    let content = "";
    items.forEach((item) => {
      if (item.type === "folder") {
        const folderName = parentName ? `${parentName} / ${item.name}` : item.name;
        content += `\n# 📁 Folder: ${folderName}\n`;
        content += this._processItems(item.items, folderName);
      } else {
        content += this._formatRequest(item);
      }
    });
    return content;
  }

  _formatRequest(item) {
    const req = item.request;
    let httpContent = `### ${item.name || "Request"}\n`;
    httpContent += `${req.method} ${req.url}\n`;

    Object.entries(req.headers).forEach(([key, value]) => {
      httpContent += `${key}: ${value}\n`;
    });

    if (req.body) {
      httpContent += "\n";
      if (typeof req.body === "object") {
        // Se for FormData simulada
        if (req.body.type === undefined && Object.keys(req.body).length > 0) {
            // Checa se é um objeto plano (JSON) ou simulador de FormData
            const firstVal = Object.values(req.body)[0];
            if (firstVal && typeof firstVal === 'object' && firstVal.type === 'file') {
                 httpContent += this._formatFormData(req.body);
            } else {
                httpContent += JSON.stringify(req.body, null, 2);
            }
        } else {
            httpContent += JSON.stringify(req.body, null, 2);
        }
      } else {
        httpContent += req.body;
      }
      httpContent += "\n";
    }

    return httpContent + "\n";
  }

  _formatFormData(formData) {
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    let content = "";
    Object.entries(formData).forEach(([key, field]) => {
      content += `--${boundary}\n`;
      if (field && typeof field === 'object' && field.type === "file") {
        content += `Content-Disposition: form-data; name="${key}"; filename="${field.src || "file"}"\n\n`;
        content += `< ${field.src || "./file"}\n`;
      } else {
        content += `Content-Disposition: form-data; name="${key}"\n\n`;
        content += `${field}\n`;
      }
    });
    content += `--${boundary}--\n`;
    return content;
  }
}

module.exports = { AxiosFormatter, HttpFormatter };
