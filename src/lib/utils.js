import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getMethodColor = (method) => {
  const colors = {
    GET: "text-green-400",
    POST: "text-yellow-400",
    PUT: "text-blue-400",
    DELETE: "text-red-400",
    PATCH: "text-purple-400",
  };
  return colors[method?.toUpperCase()] || "text-gray-400";
};

export const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
