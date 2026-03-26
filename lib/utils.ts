import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toProxyUrl(url?: string | null) {
  if (!url) return "";
  if (url.includes("blob.vercel-storage.com")) {
    return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
