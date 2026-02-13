import HTTPSnippet from "@httptoolkit/httpsnippet";

export const generateCodeSnippet = (preparedRequest, target, client) => {
  const substitutions = new Map();
  let subCounter = 0;

  // Função para substituir placeholders {{...}} por strings seguras (alfanuméricas)
  const protect = (val) => {
    if (typeof val === "string") {
      // Primeiro, decodifica chaves que possam ter sido codificadas em query params
      const decoded = val.replace(/%7B%7B/g, "{{").replace(/%7D%7D/g, "}}");

      return decoded.replace(/\{\{(.+?)\}\}/g, (match) => {
        // Usa IDs que pareçam nomes de variáveis ou hosts válidos (apenas letras)
        const id = `vvar${subCounter++}v`;
        substitutions.set(id, match);
        return id;
      });
    }
    if (Array.isArray(val)) return val.map(protect);
    if (typeof val === "object" && val !== null) {
      const newObj = {};
      for (const [k, v] of Object.entries(val)) {
        newObj[k] = protect(v);
      }
      return newObj;
    }
    return val;
  };

  try {
    // Protege todos os campos da requisição preparada
    const safeRequest = protect(preparedRequest);

    // 1. Extrair Query Params da URL para o array queryString do HAR
    const queryStringArr = [];
    let baseUrl = safeRequest.url || "";
    try {
      if (baseUrl.includes("?")) {
        const parts = baseUrl.split("?");
        baseUrl = parts[0];
        const query = parts.slice(1).join("?");
        const urlParams = new URLSearchParams(query);
        urlParams.forEach((value, name) => {
          queryStringArr.push({ name, value });
        });
      }
    } catch (e) {
      console.warn("Falha ao decompor URL para HAR:", e);
    }

    if (baseUrl && !baseUrl.includes("://")) {
      baseUrl = "http://" + baseUrl;
    }

    const harRequest = {
      method: safeRequest.method || "GET",
      url: baseUrl,
      httpVersion: "HTTP/1.1",
      headers: Object.entries(safeRequest.headers || {}).map(
        ([name, value]) => ({
          name,
          value: String(value),
        }),
      ),
      queryString: queryStringArr,
      cookies: [],
      headersSize: -1,
      bodySize: -1,
    };

    // 2. Processar Body de acordo com o padrão HAR (params vs text)
    if (safeRequest.body) {
      const mode = safeRequest.bodyMode;
      const postData = { mimeType: "application/json" };

      if (mode === "json") {
        postData.mimeType = "application/json";
        postData.text =
          typeof safeRequest.body === "string"
            ? safeRequest.body
            : JSON.stringify(safeRequest.body, null, 2);
      } else if (mode === "urlencoded" || mode === "formdata") {
        postData.mimeType =
          mode === "urlencoded"
            ? "application/x-www-form-urlencoded"
            : "multipart/form-data";

        // Se o corpo for um objeto, enviamos como params (essencial para evitar erros no convert)
        if (typeof safeRequest.body === "object" && safeRequest.body !== null) {
          postData.params = Object.entries(safeRequest.body).map(
            ([name, value]) => ({
              name,
              value:
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value),
            }),
          );
        } else {
          postData.text = String(safeRequest.body);
        }
      } else {
        postData.mimeType = "text/plain";
        postData.text = String(safeRequest.body);
      }
      harRequest.postData = postData;
    }

    const snippet = new HTTPSnippet(harRequest);
    const result = snippet.convert(target, client);

    if (!result) return "// Erro ao gerar snippet";

    // Restaura os placeholders no código gerado
    let finalCode = result;
    substitutions.forEach((original, id) => {
      finalCode = finalCode.split(id).join(original);
    });

    // Pós-processamento estético para JavaScript/Node
    if (target === "javascript" || target === "node") {
      // 1. Garante aspas em todas as chaves de headers
      finalCode = finalCode.replace(
        /^(\s+)([a-zA-Z0-9_$xX-]+):/gm,
        (match, space, key) => {
          if (key.startsWith("'") || key.startsWith('"')) return match;
          return `${space}'${key}':`;
        },
      );

      // 2. Transforma strings JSON no corpo em JSON.stringify(objeto) ou objeto direto
      finalCode = finalCode.replace(
        /(body|data):\s+(['"`])([\s\S]+?)\2/g,
        (match, field, quote, content) => {
          try {
            // Unescape básico se necessário (HTTPSnippet costuma usar aspas simples externas)
            const cleanContent =
              quote === "'" ? content.replace(/\\'/g, "'") : content;
            const parsed = JSON.parse(cleanContent);

            if (typeof parsed === "object" && parsed !== null) {
              const formattedObj = JSON.stringify(parsed, null, 2);
              // Axios e jQuery lidam bem com objetos diretos se o content-type for JSON
              if (
                (client === "axios" || client === "jquery") &&
                field === "data"
              ) {
                return `${field}: ${formattedObj}`;
              }
              // Fetch e outros preferem a string explicitamente
              return `${field}: JSON.stringify(${formattedObj}, null, 2)`;
            }
          } catch {
            // Não é um JSON válido, mantém o original
          }
          return match;
        },
      );
    }

    return finalCode;
  } catch (err) {
    console.error("Erro ao gerar snippet:", err);
    return `// Erro na geração do snippet: ${err.message}`;
  }
};

export const supportedLanguages = [
  {
    id: "javascript",
    label: "JavaScript",
    variants: [
      { id: "fetch", label: "Fetch", mode: "javascript" },
      { id: "axios", label: "Axios", mode: "javascript" },
      { id: "jquery", label: "jQuery", mode: "javascript" },
      { id: "xhr", label: "XHR", mode: "javascript" },
    ],
  },
  {
    id: "node",
    label: "Node.js",
    variants: [
      { id: "fetch", label: "Fetch", mode: "javascript" },
      { id: "axios", label: "Axios", mode: "javascript" },
      { id: "native", label: "Native (http)", mode: "javascript" },
      { id: "request", label: "Request", mode: "javascript" },
    ],
  },
  {
    id: "python",
    label: "Python",
    variants: [
      { id: "requests", label: "Requests", mode: "python" },
      { id: "python3", label: "http.client", mode: "python" },
    ],
  },
  {
    id: "shell",
    label: "Shell",
    variants: [
      { id: "curl", label: "cURL", mode: "bash" },
      { id: "wget", label: "Wget", mode: "bash" },
    ],
  },
  {
    id: "go",
    label: "Go",
    variants: [{ id: "native", label: "Native", mode: "go" }],
  },
  {
    id: "java",
    label: "Java",
    variants: [
      { id: "okhttp", label: "OkHttp", mode: "java" },
      { id: "unirest", label: "Unirest", mode: "java" },
    ],
  },
  {
    id: "csharp",
    label: "C#",
    variants: [
      { id: "httpclient", label: "HttpClient", mode: "csharp" },
      { id: "restsharp", label: "RestSharp", mode: "csharp" },
    ],
  },
  {
    id: "php",
    label: "PHP",
    variants: [
      { id: "curl", label: "cURL", mode: "php" },
      { id: "guzzle", label: "Guzzle", mode: "php" },
    ],
  },
];
