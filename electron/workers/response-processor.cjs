const { parentPort, workerData } = require("worker_threads");

try {
  const { arrayBuffer, headers } = workerData;
  const buffer = Buffer.from(arrayBuffer);
  let contentType = (headers["content-type"] || "").toLowerCase();

  // 1. Detecção por Magic Numbers (PNG, JPEG, GIF, WEBP, BMP)
  let isImage = false;
  let detectedMime = null;

  if (buffer.length > 4) {
    const hex = buffer.toString("hex", 0, 4);
    if (hex.startsWith("89504e47")) {
      isImage = true;
      detectedMime = "image/png";
    } else if (hex.startsWith("ffd8ff")) {
      isImage = true;
      detectedMime = "image/jpeg";
    } else if (hex.startsWith("47494638")) {
      isImage = true;
      detectedMime = "image/gif";
    } else if (
      buffer.toString("utf8", 0, 4) === "RIFF" &&
      buffer.toString("utf8", 8, 12) === "WEBP"
    ) {
      isImage = true;
      detectedMime = "image/webp";
    } else if (hex.startsWith("424d")) {
      isImage = true;
      detectedMime = "image/bmp";
    } else if (hex.startsWith("25504446")) {
      detectedMime = "application/pdf";
    }
  }

  // 2. Se detectamos via bytes, forçamos o contentType correto
  if (detectedMime) {
    if (
      !contentType ||
      contentType.includes("application/octet-stream") ||
      contentType.includes("text/plain")
    ) {
      contentType = detectedMime;
    }
  }

  // 3. Fallback por Content-Type
  if (!detectedMime && contentType.startsWith("image/")) {
    isImage = true;
  }

  const isPDF = contentType.includes("application/pdf");
  const isAudio = contentType.includes("audio/");
  const isVideo = contentType.includes("video/");

  let body;
  if (isImage || isPDF || isAudio || isVideo) {
    body = buffer.toString("base64");
  } else {
    body = buffer.toString("utf8");
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Mantém como string se falhar o parse
      }
    }
  }

  parentPort.postMessage({
    body,
    isImage,
    isPDF: contentType.includes("application/pdf"),
    isAudio: contentType.includes("audio/"),
    isVideo: contentType.includes("video/"),
    contentType,
    success: true,
  });
} catch (error) {
  parentPort.postMessage({ success: false, error: error.message });
}
