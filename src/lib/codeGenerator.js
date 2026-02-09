import HTTPSnippet from "@httptoolkit/httpsnippet";

export const generateCodeSnippet = (request, target, client) => {
  try {
    // Converter estrutura interna para HAR
    const harRequest = {
      method: request.method || "GET",
      url: request.url || "",
      httpVersion: "HTTP/1.1",
      headers: (request.headers || [])
        .filter((h) => h.enabled && h.key)
        .map((h) => ({ name: h.key, value: h.value || "" })),
      queryString: [
        ...request.params.map((p) => ({ name: p.key, value: p.value })),
      ], // Implementar se necessário extrair da URL
      cookies: [],
      headersSize: -1,
      bodySize: -1,
    };

    // Adicionar postData se houver corpo e método permitir
    if (["POST", "PUT", "PATCH"].includes(harRequest.method) && request.body) {
      harRequest.postData = {
        mimeType: request.body.mimeType || "application/json",
        text: request.body.content || "",
      };
    }

    const snippet = new HTTPSnippet(harRequest);

    // O método convert retorna false ou string, mas vamos garantir string
    const result = snippet.convert(target, client);
    return (
      result || "// Erro ao gerar snippet ou combinação target/client inválida"
    );
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
