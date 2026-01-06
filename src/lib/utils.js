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
