#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Converte uma coleção Postman para o formato .http (REST Client)
 * Suporta estrutura de pastas e gera arquivos separados
 * Uso: node convert_postman.js <arquivo-postman.json> [diretorio-saida]
 */

/**
 * Processa autenticação do Postman e retorna headers apropriados
 */
function processAuth(auth) {
  const headers = [];

  if (!auth || !auth.type) {
    return headers;
  }

  switch (auth.type) {
    case "bearer":
      if (auth.bearer && Array.isArray(auth.bearer)) {
        const tokenObj = auth.bearer.find((item) => item.key === "token");
        if (tokenObj && tokenObj.value) {
          headers.push({
            key: "Authorization",
            value: `Bearer ${tokenObj.value}`,
          });
        }
      }
      break;

    case "oauth2":
      // OAuth2 geralmente adiciona Bearer token também
      if (auth.oauth2 && Array.isArray(auth.oauth2)) {
        const tokenObj = auth.oauth2.find((item) => item.key === "accessToken");
        if (tokenObj && tokenObj.value) {
          headers.push({
            key: "Authorization",
            value: `Bearer ${tokenObj.value}`,
          });
        } else {
          // Se não tem token específico, adiciona placeholder
          headers.push({ key: "Authorization", value: "Bearer {{token}}" });
        }
      }
      break;

    case "apikey":
      if (auth.apikey && Array.isArray(auth.apikey)) {
        const keyObj = auth.apikey.find((item) => item.key === "key");
        const valueObj = auth.apikey.find((item) => item.key === "value");
        const inObj = auth.apikey.find((item) => item.key === "in");

        if (keyObj && valueObj && inObj && inObj.value === "header") {
          headers.push({ key: keyObj.value, value: valueObj.value });
        }
      }
      break;

    case "basic":
      if (auth.basic && Array.isArray(auth.basic)) {
        const username = auth.basic.find((item) => item.key === "username");
        const password = auth.basic.find((item) => item.key === "password");

        if (username && password) {
          const credentials = Buffer.from(
            `${username.value}:${password.value}`
          ).toString("base64");
          headers.push({ key: "Authorization", value: `Basic ${credentials}` });
        }
      }
      break;
  }

  return headers;
}

/**
 * Converte um item (request) para formato .http
 */
function convertRequestToHttp(item) {
  let httpContent = "";

  if (!item.request) {
    return httpContent;
  }

  httpContent += `### ${item.name || "Request"}\n`;

  const isFormData = item.request.body && item.request.body.mode === "formdata";

  // Método e URL
  const method = item.request.method || "GET";
  const url = buildUrl(item.request.url);
  httpContent += `${method} ${url}\n`;

  // Headers de autenticação (processados primeiro)
  const authHeaders = processAuth(item.request.auth);
  authHeaders.forEach((header) => {
    httpContent += `${header.key}: ${header.value}\n`;
  });

  // Headers normais
  if (item.request.header && Array.isArray(item.request.header)) {
    item.request.header.forEach((header) => {
      if (header.key && !header.disabled) {
        // Se for formdata, ignoramos o Content-Type original para forçar o nosso com boundary
        if (isFormData && header.key.toLowerCase() === "content-type") {
          return;
        }
        httpContent += `${header.key}: ${header?.value}\n`;
      }
    });
  }

  // Body (se existir)
  if (item.request.body && item.request.body.mode === "raw") {
    httpContent += "\n";
    // Limpar comentários inline do JSON (formato Postman)
    let bodyContent = item.request.body.raw || "";

    // Array para armazenar os comentários extraídos com contexto
    const extractedComments = [];

    // Processar linha por linha para capturar o contexto (nome da chave)
    // Isso permite associar o comentário à chave do JSON (ex: "nome": "valor" // msg -> # nome: msg)
    const lines = bodyContent.split("\n");
    const cleanLines = lines.map((line) => {
      const commentIndex = line.indexOf("//");
      if (commentIndex !== -1) {
        const comment = line.substring(commentIndex);
        const contentBefore = line.substring(0, commentIndex);

        // Tentar encontrar a chave JSON mais próxima do comentário na mesma linha
        // Procura por todas as ocorrências de "chave":
        const keyMatches = [...contentBefore.matchAll(/"([^"]+)"\s*:/g)];
        let contextPrefix = "";

        if (keyMatches.length > 0) {
          // Pega a última chave encontrada na linha antes do comentário
          const lastKey = keyMatches[keyMatches.length - 1][1];
          contextPrefix = `${lastKey}: `;
        }

        extractedComments.push({
          raw: comment,
          prefix: contextPrefix,
        });

        return contentBefore; // Retorna a linha sem o comentário
      }
      return line;
    });

    // Remonta o corpo sem os comentários
    bodyContent = cleanLines.join("\n");

    httpContent += bodyContent.trim();
    httpContent += "\n";

    // Exibir comentários extraídos após o body para referência
    if (extractedComments.length > 0) {
      httpContent += "\n# Comentários extraídos:\n";
      extractedComments.forEach((item) => {
        // Remove as barras originais e espaços extras
        const cleanComment = item.raw.replace(/^\/\/\s*/, "");
        httpContent += `# ${item.prefix}${cleanComment}\n`;
      });
    }
  } else if (isFormData) {
    // Tratamento para multipart/form-data
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

    // Adicionar header Content-Type com boundary obrigatório
    httpContent += `Content-Type: multipart/form-data; boundary=${boundary}\n`;

    httpContent += "\n";

    const formdata = item.request.body.formdata;
    if (Array.isArray(formdata)) {
      formdata.forEach((field) => {
        if (field.disabled) return;

        httpContent += `--${boundary}\n`;

        if (field.type === "file") {
          httpContent += `Content-Disposition: form-data; name="${field.key}"; filename="${field.src || "file"}"\n`;
          httpContent += "\n";
          // Sintaxe para envio de arquivo no .http
          // Tenta usar o caminho original (src) ou um placeholder
          const filePath = field.src
            ? Array.isArray(field.src)
              ? field.src[0]
              : field.src
            : "./arquivo.txt";
          httpContent += `< ${filePath}\n`;
        } else {
          // Campo de texto normal
          httpContent += `Content-Disposition: form-data; name="${field.key}"\n`;
          httpContent += "\n";
          httpContent += `${field.value}\n`;
        }
      });
      // Fechamento do boundary
      httpContent += `--${boundary}--\n`;
    }

    // Adicionar comentários de ajuda no final
    httpContent += "\n# COMENTÁRIOS DE AJUDA:\n";
    httpContent +=
      "# 1. Content-Type: Deve incluir o 'boundary' que separa as partes do conteúdo.\n";
    httpContent +=
      '# 2. name="...": Nome do campo esperado pelo backend. NÃO ALTERE se a API exigir este nome.\n';
    httpContent +=
      '# 3. filename="...": Nome do arquivo que aparecerá para o servidor.\n';
    httpContent +=
      "# 4. < /caminho/...: O caminho deve ser absoluto no seu sistema.\n";
  }

  httpContent += "\n";

  return httpContent;
}

/**
 * Processa itens recursivamente, separando por pastas
 */
function processItems(items, folderName = null) {
  const result = {
    requests: [],
    folders: {},
  };

  if (!items || !Array.isArray(items)) {
    return result;
  }

  items.forEach((item) => {
    if (item.request) {
      // É uma requisição
      result.requests.push(item);
    } else if (item.item && Array.isArray(item.item)) {
      // É uma pasta
      const subFolderName = item.name || "Unnamed Folder";
      result.folders[subFolderName] = processItems(item.item, subFolderName);
    }
  });

  return result;
}

/**
 * Gera conteúdo .http a partir de requisições
 */
function generateHttpContent(requests, title) {
  let httpContent = "";

  if (title) {
    httpContent += `# ${title}\n`;
    httpContent += `# Convertido automaticamente de Postman Collection\n\n`;
  }

  requests.forEach((item, index) => {
    if (index > 0) {
      httpContent += "\n";
    }
    httpContent += convertRequestToHttp(item);
  });

  return httpContent;
}

/**
 * Salva arquivos .http recursivamente
 */
function saveHttpFiles(structure, basePath, collectionName, parentFolder = "") {
  const files = [];

  // Salvar requisições da pasta atual
  if (structure.requests.length > 0) {
    const folderPath = parentFolder
      ? path.join(basePath, parentFolder)
      : basePath;

    // Criar diretório se não existir
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = parentFolder
      ? `${sanitizeFileName(parentFolder)}.http`
      : `${sanitizeFileName(collectionName)}.http`;
    const filePath = path.join(folderPath, fileName);

    const title = parentFolder || collectionName;
    const content = generateHttpContent(structure.requests, title);

    fs.writeFileSync(filePath, content, "utf8");
    files.push(filePath);
  }

  // Processar subpastas
  for (const [folderName, folderStructure] of Object.entries(
    structure.folders
  )) {
    const newParentFolder = parentFolder
      ? path.join(parentFolder, folderName)
      : folderName;
    const subFiles = saveHttpFiles(
      folderStructure,
      basePath,
      collectionName,
      newParentFolder
    );
    files.push(...subFiles);
  }

  return files;
}

/**
 * Remove caracteres inválidos de nomes de arquivo
 */
function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_");
}

/**
 * Constrói a URL a partir do objeto URL do Postman
 */
function buildUrl(urlObj) {
  if (typeof urlObj === "string") {
    return urlObj;
  }

  if (urlObj.raw) {
    return urlObj.raw;
  }

  // Construir URL a partir das partes
  let url = "";

  if (urlObj.protocol) {
    url += urlObj.protocol + "://";
  }

  if (urlObj.host) {
    if (Array.isArray(urlObj.host)) {
      url += urlObj.host.join(".");
    } else {
      url += urlObj.host;
    }
  }

  if (urlObj.path) {
    url += "/";
    if (Array.isArray(urlObj.path)) {
      url += urlObj.path.join("/");
    } else {
      url += urlObj.path;
    }
  }

  // Query parameters
  if (urlObj.query && Array.isArray(urlObj.query)) {
    const activeQueries = urlObj.query.filter((q) => !q.disabled);
    if (activeQueries.length > 0) {
      url += "?";
      url += activeQueries.map((q) => `${q.key}=${q.value || ""}`).join("&");
    }
  }

  return url;
}

/**
 * Busca recursivamente por arquivos .json em um diretório
 */
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorar node_modules e diretórios ocultos
      if (!file.startsWith(".") && file !== "node_modules") {
        findJsonFiles(filePath, fileList);
      }
    } else if (stat.isFile() && file.endsWith(".json")) {
      // Verificar se é uma coleção Postman válida
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(content);

        // Verificar se tem a estrutura de uma coleção Postman
        if (json.info && json.item) {
          fileList.push(filePath);
        }
      } catch (error) {
        // Ignorar arquivos JSON inválidos ou que não são coleções Postman
      }
    }
  });

  return fileList;
}

/**
 * Processa um único arquivo de coleção Postman
 */
function processPostmanFile(inputFile) {
  try {
    console.log(`\n📄 Processando: ${inputFile}`);

    // Ler arquivo Postman
    const postmanContent = fs.readFileSync(inputFile, "utf8");
    const postmanCollection = JSON.parse(postmanContent);

    const collectionName = postmanCollection.info?.name || "Collection";

    // Processar estrutura
    const structure = processItems(postmanCollection.item);

    // Diretório de saída é o mesmo do arquivo JSON
    const outputDir = path.dirname(inputFile);

    // Salvar arquivos
    const generatedFiles = saveHttpFiles(structure, outputDir, collectionName);

    console.log(`   ✅ Gerado(s) ${generatedFiles.length} arquivo(s):`);
    generatedFiles.forEach((file) => {
      console.log(`      - ${path.basename(file)}`);
    });

    return { success: true, files: generatedFiles };
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  findJsonFiles,
  processPostmanFile,
  processItems,
  saveHttpFiles,
};
