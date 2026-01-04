const normalizeText = (value: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProductUrl = (product: any) => {
  if (!product) return "#";
  const slug = String(product.slug || "").trim();
  if (slug) return `/product/${slug}`;

  const id = String(product._id || product.id || "").trim();
  if (!id) return "#";
  const base = slugify(product.name || "");
  return base ? `/product/${base}-${id}` : `/product/${id}`;
};
