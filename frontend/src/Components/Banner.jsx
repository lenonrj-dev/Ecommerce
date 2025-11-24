import { useContext, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import ProductRatingSummary from "./ProductRatingSummary";

const COLOR_MAP = {
  preto: { label: "Preto", hex: "#111111" },
  nude: { label: "Nude", hex: "#d7b19d" },
  branco: { label: "Branco", hex: "#ffffff" },
  off: { label: "Off White", hex: "#f6f1e8" },
  cinza: { label: "Cinza", hex: "#a3a3a3" },
  chumbo: { label: "Chumbo", hex: "#4a4a4a" },
  grafite: { label: "Grafite", hex: "#303030" },
  azul: { label: "Azul", hex: "#1f3a93" },
  verde: { label: "Verde", hex: "#2f6e4f" },
  vermelho: { label: "Vermelho", hex: "#c81e1e" },
  vinho: { label: "Vinho", hex: "#6f1d1b" },
  rosa: { label: "Rosa", hex: "#f472b6" },
  pink: { label: "Pink", hex: "#ff1f8f" },
  laranja: { label: "Laranja", hex: "#f97316" },
  amarelo: { label: "Amarelo", hex: "#facc15" },
  lilas: { label: "Lilás", hex: "#c084fc" },
  roxo: { label: "Roxo", hex: "#7c3aed" },
  marrom: { label: "Marrom", hex: "#8b5e34" },
  bege: { label: "Bege", hex: "#d6c4a5" },
  prata: { label: "Prata", hex: "#cfd2d4" },
  dourado: { label: "Dourado", hex: "#d4a017" },
  coral: { label: "Coral", hex: "#ff7f67" },
  turquesa: { label: "Turquesa", hex: "#40c9c6" },
  neon: { label: "Neon", hex: "#e3ff3c" },
};

const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const parseNameAndColor = (name = "") => {
  const words = name.trim().split(/\s+/);
  let matchLength = 0;
  let colorKey = null;

  for (let len = Math.min(2, words.length); len >= 1; len--) {
    const slice = words.slice(-len).join(" ");
    const normalized = normalizeText(slice);
    if (COLOR_MAP[normalized]) {
      matchLength = len;
      colorKey = normalized;
      break;
    }
  }

  const baseName =
    matchLength > 0 ? words.slice(0, words.length - matchLength).join(" ").trim() : name.trim();

  return {
    baseName: baseName || name.trim(),
    color: colorKey ? COLOR_MAP[colorKey] : null,
  };
};

const formatPrice = (value) => {
  if (typeof value !== "number") return "Coleção exclusiva";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const generateHighlights = (group, variation) => {
  const list = [];
  if (variation.description) {
    list.push(variation.description.length > 110 ? `${variation.description.slice(0, 110)}...` : variation.description);
  } else {
    list.push(`${group.title} desenvolvido para acompanhar treinos e looks do dia a dia.`);
  }
  if (group.variations.length > 1) {
    list.push(`Disponível em ${group.variations.length} cores autorais Marima.`);
  } else {
    list.push("Cápsula limitada com tingimento exclusivo.");
  }
  list.push("Produção local, tecidos tecnológicos e garantia de conforto.");
  return list;
};

const generateSpecs = (variation) => [
  { label: "Categoria", value: variation.category || "Fitness" },
  { label: "Linha", value: variation.subCategory || "Performance" },
  { label: "Preço", value: formatPrice(variation.price) },
];

const FALLBACK_GROUPS = [
  {
    key: "fallback-macacao",
    title: "Flow Motion Macacão",
    variations: [
      {
        id: "fallback-macacao",
        name: "Flow Motion Macacão",
        image: "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758997231/products/b1n65psbkjtwcd0olyan.png",
        gallery: [
          "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103472/products/uakjofj0kgzs4wsbqcpb.png",
          "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758632331/camywhqhwumm4z7mjg7e.png",
          "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103643/products/axlqiifwheya8kijbtbx.png",
        ],
        description: "Macacão com compressão uniforme e recortes estratégicos que afinam a cintura.",
        colorLabel: null,
        colorHex: null,
        price: 258,
        pixPrice: 238,
        installments: { quantity: 12, value: 258 / 12 },
        category: "Fitness",
        subCategory: "Macacão",
        link: "/outlet",
      },
    ],
  },
  {
    key: "fallback-top",
    title: "Elevate Studio Top",
    variations: [
      {
        id: "fallback-top",
        name: "Elevate Studio Top",
        image: "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758992784/products/j1f5lqpcq5wetgppnhln.png",
        gallery: [
          "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758632101/bldfx1uqqrc8yq90wjsj.png",
          "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103821/products/t3qnorxtkrmgfhfgh8pg.png",
        ],
        description: "Suporte médio/alto, bojo removível e alças cruzadas para treinos intensos.",
        colorLabel: null,
        colorHex: null,
        price: 189,
        pixPrice: 169,
        installments: { quantity: 12, value: 189 / 12 },
        category: "Fitness",
        subCategory: "Top",
        link: "/fitness",
      },
    ],
  },
];

const buildGroupsFromProducts = (products = []) => {
  const groups = new Map();

  products.forEach((product, index) => {
    const { baseName, color } = parseNameAndColor(product.name || `Peça ${index + 1}`);
    const key = (baseName || product.name || `produto-${index}`).toLowerCase();
    const gallery = Array.isArray(product.image)
      ? product.image.filter(Boolean)
      : product.image
      ? [product.image]
      : [];

    if (!gallery.length) return;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: baseName || product.name || "Coleção Fitness",
        variations: [],
      });
    }

    groups.get(key).variations.push({
      id: product._id || `${key}-${index}`,
      name: product.name || baseName,
      image: gallery[0],
      gallery,
      description: product.description,
      colorLabel: color?.label || null,
      colorHex: color?.hex || null,
      price: product.price,
      pixPrice: product.pixPrice,
      installments: product.installments,
      category: product.category,
      subCategory: product.subCategory,
      link: product._id ? `/product/${product._id}` : "/outlet",
    });
  });

  return Array.from(groups.values()).filter((group) => group.variations.length);
};

export default function Banner() {
  const { products, backendUrl } = useContext(ShopContext);

  const fitnessProducts = useMemo(() => {
    if (!products?.length) return [];
    return products.filter((product) => {
      const inName = /fitness/i.test(product?.name || "");
      const inCategory = (product?.category || "").toLowerCase().includes("fitness");
      const inSub = (product?.subCategory || "").toLowerCase().includes("fitness");
      return inName || inCategory || inSub;
    });
  }, [products]);

  const computedGroups = useMemo(() => buildGroupsFromProducts(fitnessProducts), [fitnessProducts]);
  const groups = computedGroups.length ? computedGroups : FALLBACK_GROUPS;

  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeVariantMap, setActiveVariantMap] = useState({});
  const [heroImageMap, setHeroImageMap] = useState({});

  useEffect(() => {
    if (!groups.length) return;
    setActiveGroupIndex((prev) => (prev >= groups.length ? 0 : prev));
  }, [groups.length]);

  const currentGroup = groups[activeGroupIndex];
  useEffect(() => {
    if (!currentGroup) return;
    setActiveVariantMap((prev) => {
      if (prev[currentGroup.key] != null) return prev;
      return { ...prev, [currentGroup.key]: 0 };
    });
  }, [currentGroup]);

  const currentVariantIndex =
    currentGroup && currentGroup.variations.length
      ? activeVariantMap[currentGroup.key] ?? 0
      : 0;
  const currentVariation = currentGroup?.variations?.[currentVariantIndex];

  const variationKey = currentVariation?.id || currentGroup?.key;
  useEffect(() => {
    if (!variationKey) return;
    setHeroImageMap((prev) => {
      if (prev[variationKey] != null) return prev;
      return { ...prev, [variationKey]: 0 };
    });
  }, [variationKey]);

  const galleryImages = currentVariation?.gallery?.length
    ? currentVariation.gallery
    : currentVariation?.image
    ? [currentVariation.image]
    : [];
  const heroImageIndex = variationKey ? heroImageMap[variationKey] ?? 0 : 0;
  const heroImage = galleryImages[heroImageIndex] || currentVariation?.image || "";

  const highlights = currentVariation
    ? currentVariation.highlights || generateHighlights(currentGroup, currentVariation)
    : [];
  const specs = currentVariation
    ? currentVariation.specs || generateSpecs(currentVariation)
    : [];

  const basePrice = Number(currentVariation?.price) || 0;
  const rawPix = Number(currentVariation?.pixPrice);
  const pixValue = Number.isFinite(rawPix) && rawPix >= 0 ? rawPix : basePrice;
  const rawInstallmentsQty = Number(currentVariation?.installments?.quantity);
  const installmentsQty =
    Number.isFinite(rawInstallmentsQty) && rawInstallmentsQty > 0
      ? rawInstallmentsQty
      : 12;
  const rawInstallmentValue = Number(currentVariation?.installments?.value);
  const installmentValue =
    Number.isFinite(rawInstallmentValue) && rawInstallmentValue >= 0
      ? rawInstallmentValue
      : installmentsQty > 0
      ? basePrice / installmentsQty
      : basePrice;
  const descriptionText =
    currentVariation?.description?.trim()
      ? currentVariation.description
      : `${currentGroup?.title || "Coleção Fitness"} combina tecnologia e conforto para o dia a dia.`;
  const categorySlug = (
    currentVariation?.category ||
    currentVariation?.subCategory ||
    ""
  ).toLowerCase();
  const categoryHref = /casual/.test(categorySlug) ? "/casual" : "/fitness";

  const progressLabel = `${String(activeGroupIndex + 1).padStart(2, "0")}/${String(
    groups.length
  ).padStart(2, "0")}`;

  const showPalette =
    currentGroup?.variations?.length > 1 &&
    currentGroup.variations.some((variation) => variation.colorHex || variation.colorLabel);

  const handleNext = () =>
    setActiveGroupIndex((prev) => (prev + 1) % groups.length);
  const handlePrev = () =>
    setActiveGroupIndex((prev) => (prev === 0 ? groups.length - 1 : prev - 1));

  const handleColorChange = (index) => {
    if (!currentGroup) return;
    const targetVariation = currentGroup.variations[index];
    if (!targetVariation) return;
    setActiveVariantMap((prev) => ({ ...prev, [currentGroup.key]: index }));
    setHeroImageMap((prev) => ({ ...prev, [targetVariation.id || currentGroup.key]: 0 }));
  };

  const handleGalleryChange = (index) => {
    if (!variationKey) return;
    setHeroImageMap((prev) => ({ ...prev, [variationKey]: index }));
  };

  if (!currentVariation) {
    return null;
  }

  return (
    <section
      className="relative w-full bg-[#f5f3ef] text-neutral-900"
      style={{ minHeight: "min(100vh, 1080px)" }}
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
            <span>{currentVariation.subCategory || currentGroup.title}</span>
            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={handlePrev}
                aria-label="Anterior"
                className="rounded-full border border-black/10 px-3 py-1 hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>{progressLabel}</span>
              <button
                onClick={handleNext}
                aria-label="Próximo"
                className="rounded-full border border-black/10 px-3 py-1 hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
            {groups.map((group, index) => (
              <button
                key={group.key}
                onClick={() => {
                  setActiveGroupIndex(index);
                  const firstVariation = group.variations?.[0];
                  if (firstVariation) {
                    setActiveVariantMap((prev) => ({ ...prev, [group.key]: 0 }));
                    setHeroImageMap((prev) => ({ ...prev, [firstVariation.id || group.key]: 0 }));
                  }
                }}
                className={`flex-shrink-0 rounded-full border px-4 py-1 transition ${
                  index === activeGroupIndex
                    ? "border-neutral-900 bg-neutral-900 text-white shadow"
                    : "border-transparent bg-white/80 text-neutral-600"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] items-start">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[520px] w-full lg:w-28 flex-none">
              {galleryImages.slice(0, 6).map((thumb, index) => (
                <button
                  key={`${variationKey}-thumb-${index}`}
                  onClick={() => handleGalleryChange(index)}
                  className={`min-w-[72px] lg:min-w-0 rounded-xl border ${
                    index === heroImageIndex
                      ? "border-neutral-900"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={thumb}
                    alt=""
                    className="h-24 w-full object-cover rounded-lg"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            <Motion.div
              key={heroImage}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <div
                className="rounded-3xl bg-white shadow-lg overflow-hidden"
                style={{ maxHeight: "720px" }}
              >
                <div className="w-full" style={{ aspectRatio: "3 / 4" }}>
                  <img
                    src={heroImage}
                    alt={currentVariation.name}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            </Motion.div>
          </div>

          <Motion.div
            key={variationKey}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.7 } }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                {currentVariation.subCategory || currentGroup.title}
              </p>
              <h2 className="text-3xl font-semibold text-neutral-900 leading-snug">
                {currentVariation.name || currentGroup.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">{descriptionText}</p>
            </div>

            {(currentVariation?.id || currentVariation?._id) && backendUrl && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
                <ProductRatingSummary
                  productId={currentVariation.id || currentVariation._id}
                  backendUrl={backendUrl}
                />
                <Link
                  to={`/product/${currentVariation.id || currentVariation._id}`}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900"
                >
                  Ver avaliações completas →
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {pixValue !== basePrice && (
                <p className="text-sm text-neutral-500 line-through">{formatPrice(basePrice)}</p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-neutral-900">{formatPrice(pixValue)}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  no pix
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                ou {installmentsQty}x de{" "}
                <span className="font-semibold text-neutral-900">{formatPrice(installmentValue)}</span>{" "}
                sem juros
              </p>
            </div>

            {showPalette && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Cores autorais
                </p>
                <div className="flex flex-wrap gap-3">
                  {currentGroup.variations.map((variation, index) => {
                    const isActive = index === currentVariantIndex;
                    const fill = variation.colorHex || "#f5f5f5";
                    return (
                      <button
                        key={`${variation.id || variation.name}-${index}`}
                        onClick={() => handleColorChange(index)}
                        className="flex flex-col items-center gap-1 text-[11px] text-neutral-600"
                        type="button"
                      >
                        <span
                          className={`h-10 w-10 rounded-full border-2 ${
                            isActive ? "border-neutral-900" : "border-transparent"
                          }`}
                          style={{ backgroundColor: fill }}
                        />
                        {variation.colorLabel && <span>{variation.colorLabel}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!!specs.length && (
              <div className="grid grid-cols-2 gap-3">
                {specs.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm"
                  >
                    <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{item.label}</p>
                    <p className="text-base font-medium text-neutral-900">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {!!highlights.length && (
              <ul className="space-y-2 text-sm text-neutral-600 leading-relaxed">
                {highlights.map((text, idx) => (
                  <li key={`${variationKey}-highlight-${idx}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-900" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={currentVariation.link || "/outlet"}
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-800"
              >
                Ver detalhes do produto
              </Link>
              <Link
                to={categoryHref}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:bg-white"
              >
                Explorar coleção
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}
