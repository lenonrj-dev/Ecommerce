// src/utils/productUtils.js

// Verifica se a string já é uma URL http/https
export const isHttp = (u) => /^https?:\/\//i.test(String(u || "").trim());

// Valida se a string é uma URL http/https válida
export const isValidUrl = (u) => {
  if (!u) return false;
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
};

// Mostra uma versão curta da URL (host + início do path)
export const shortUrl = (u) => {
  if (!isValidUrl(u)) return "";
  try {
    const { hostname, pathname } = new URL(u);
    const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "";
    return `${hostname}${p ? "…" : ""}`;
  } catch {
    return u;
  }
};

/**
 * Normaliza qualquer valor vindo do backend para uma URL exibível.
 *
 * Agora recebe o backendUrl por parâmetro, para não acoplar ao App.
 */
export const normalizeImageUrl = (raw, backendUrl) => {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (isHttp(s)) return s;
  if (s.startsWith("file://")) return null;

  if (s.startsWith("/uploads/")) {
    return `${backendUrl.replace(/\/$/, "")}${s}`;
  }

  const filename = s.split("/").pop();
  if (!filename) return null;
  return `${backendUrl.replace(/\/$/, "")}/uploads/${filename}`;
};

// Gera uma chave única baseada em productId + tamanho
export const keyOf = (productId, size) => `${productId}:${size}`;
