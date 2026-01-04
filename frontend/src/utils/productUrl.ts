import type { Product } from "../types";

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

export const extractProductIdFromSlug = (value: string) => {
  const raw = String(value || "").trim();
  if (/^[a-f0-9]{24}$/i.test(raw)) return raw;
  const match = raw.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
};

export const getProductUrl = (product: Partial<Product> | null | undefined) => {
  if (!product) return "#";
  const slug = String(product.slug || "").trim();
  if (slug) return `/product/${slug}`;

  const id = String(product._id || product.id || "").trim();
  if (!id) return "#";
  const base = slugify(product.name || "");
  return base ? `/product/${base}-${id}` : `/product/${id}`;
};
