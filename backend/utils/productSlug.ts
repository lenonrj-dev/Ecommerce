const normalizeText = (value: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildProductSlug = (
  name: string,
  id?: string | { toString: () => string } | null
) => {
  const base = slugify(name);
  const safeId = String(id || "").trim();
  if (!base) return safeId;
  return safeId ? `${base}-${safeId}` : base;
};

export const isObjectIdLike = (value: string) =>
  /^[a-f0-9]{24}$/i.test(String(value || "").trim());

export const extractObjectIdFromSlug = (value: string) => {
  const raw = String(value || "").trim();
  if (isObjectIdLike(raw)) return raw;
  const match = raw.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
};
