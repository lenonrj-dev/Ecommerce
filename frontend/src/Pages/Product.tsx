import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ShopContext } from "../Context/ShopContext";
import RelatedProducts from "../Components/RelatedProducts";
import ProductComments from "../Components/ProductComments";
import ProductRatingSummary from "../Components/ProductRatingSummary";
import SeoHead from "../Components/seo/SeoHead";
import { extractProductIdFromSlug, getProductUrl } from "../utils/productUrl";

const getAvailableSizes = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length) {
    const actives = product.variants
      .filter((v) => v?.isActive !== false && String(v?.size).trim())
      .map((v) => String(v.size).trim().toUpperCase());
    if (actives.length) return Array.from(new Set(actives));
  }
  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.map((s) => String(s).trim().toUpperCase());
  }
  return [];
};

const buildSizeLinks = (product) => {
  if (product?.yampiLinks && typeof product.yampiLinks === "object" && Object.keys(product.yampiLinks).length) {
    return product.yampiLinks;
  }
  if (product?.yampiLink) {
    const sizes = getAvailableSizes(product);
    if (sizes.length) {
      return sizes.reduce((acc, s) => {
        acc[s] = product.yampiLink;
        return acc;
      }, {});
    }
    return { UNICO: product.yampiLink };
  }
  return {};
};

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <Motion.div
        className="fixed inset-0 z-50 grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
        <Motion.div
          className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
              Fechar
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </Motion.div>
      </Motion.div>
    )}
  </AnimatePresence>
);

const Product = () => {
  const { productId, slug } = useParams();
  const slugOrId = productId || slug || "";
  const resolvedId = useMemo(() => extractProductIdFromSlug(slugOrId), [slugOrId]);
  const navigate = useNavigate();
  const location = useLocation();
  const { products, backendUrl, user, isLoggedIn, isFavorite, toggleFavorite, addToCart, cartItems } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openSizeModal, setOpenSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("UNICO");
  const canonicalPath = product ? getProductUrl(product) : "";
  const canonicalUrl =
    product && canonicalPath && canonicalPath !== "#"
      ? `https://www.usemarima.com${canonicalPath}`
      : "";
  const seoDescription = product?.description?.trim() || "";

  useEffect(() => {
    if (!slugOrId) {
      setProduct(null);
      return;
    }

    const byId = resolvedId
      ? (products || []).find((p) => String(p._id) === resolvedId)
      : null;
    const bySlug = (products || []).find((p) => p.slug === slugOrId);
    const found = byId || bySlug || null;

    setProduct(found);
    if (found) setActiveIndex(0);
  }, [products, resolvedId, slugOrId]);

  useEffect(() => {
    if (!product) return;
    const targetPath = getProductUrl(product);
    if (targetPath !== "#" && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [product, location.pathname, navigate]);

  const images = useMemo(() => {
    if (Array.isArray(product?.image)) return product.image;
    if (product?.image) return [product.image];
    return [];
  }, [product]);
  const mainSrc = images[activeIndex] || "";
  const sizeLinks = useMemo(() => buildSizeLinks(product), [product]);
  const sizeOptions = useMemo(() => getAvailableSizes(product), [product]);
  const sizeChoices = useMemo(() => {
    const linkKeys = Object.keys(sizeLinks || {});
    return linkKeys.length ? linkKeys : sizeOptions;
  }, [sizeLinks, sizeOptions]);
  const combineProducts = useMemo(() => {
    if (!product?.combineWith || !Array.isArray(products)) return [];
    const ids = new Set((product.combineWith || []).map((id) => String(id)));
    return products.filter((p) => ids.has(String(p._id))).slice(0, 3);
  }, [product, products]);

  useEffect(() => {
    setSelectedSize(sizeChoices[0] || "UNICO");
  }, [sizeChoices]);

  const fav = product ? isFavorite(product._id) : false;

  const redirectToLogin = () => {
    navigate("/login", { replace: true, state: { from: location.pathname } });
  };

  const notifyAbandoned = (size, link) => {
    try {
      const email = user?.email;
      if (!email || !link) return;
      const payload = {
        email,
        name: user?.name,
        productId: product?._id,
        productName: product?.name,
        size,
        link,
        image: product?.image?.[0],
      };
      const url = `${backendUrl}/api/abandoned/notify`;
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    } catch (error) {
      console.error("Erro ao notificar abandono:", error);
    }
  };

  const formatBRL = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const basePrice = Number(product?.price) || 0;
  const pixValue = typeof product?.pixPrice === "number" && product.pixPrice >= 0 ? product.pixPrice : basePrice;
  const installmentsQty =
    typeof product?.installments?.quantity === "number" && product.installments.quantity > 0 ? product.installments.quantity : 12;
  const installmentValue =
    typeof product?.installments?.value === "number" && product.installments.value >= 0
      ? product.installments.value
      : installmentsQty > 0
      ? basePrice / installmentsQty
      : basePrice;

  const normalizedProduct = useMemo(
    () =>
      product
        ? {
            ...product,
            price: basePrice,
            pixPrice: pixValue,
            installments: {
              quantity: installmentsQty,
              value: installmentValue,
            },
            image: Array.isArray(product.image) ? product.image : product.image ? [product.image] : [],
          }
        : null,
    [product, basePrice, pixValue, installmentsQty, installmentValue]
  );

  const goToSizeLink = (tamanho) => {
    const link = sizeLinks?.[tamanho];
    if (!link) return;

    if (normalizedProduct && isLoggedIn) {
      addToCart(normalizedProduct, { size: tamanho || "UNICO" });
    }

    setSelectedSize(tamanho);
    notifyAbandoned(tamanho, link);
    window.location.assign(link);
  };

  const handleBuy = (e) => {
    e.preventDefault();

    const normalizedSize = selectedSize || sizeChoices[0];
    if (normalizedSize && sizeLinks?.[normalizedSize]) {
      if (normalizedProduct && isLoggedIn) {
        addToCart(normalizedProduct, { size: normalizedSize });
      }
      notifyAbandoned(normalizedSize, sizeLinks[normalizedSize]);
      window.location.assign(sizeLinks[normalizedSize]);
      return;
    }

    const entries = Object.entries(sizeLinks);
    if (entries.length === 1) {
      const [tamanho, link] = entries[0];
      if (normalizedProduct && isLoggedIn) {
        addToCart(normalizedProduct, { size: tamanho });
      }
      notifyAbandoned(tamanho, link);
      window.location.assign(link);
      return;
    }

    setOpenSizeModal(true);
  };

  const cartMatch = useMemo(() => {
    if (!normalizedProduct) return null;
    const targetSize = selectedSize || "UNICO";
    return (cartItems || []).find(
      (item) => item.productId === normalizedProduct._id && (item.size || "UNICO") === targetSize
    );
  }, [cartItems, normalizedProduct, selectedSize]);

  const isInCart = !!cartMatch;

  const handleAddToCart = () => {
    if (!normalizedProduct) return;
    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }
    if (isInCart) {
      navigate("/cart");
      return;
    }
    const size = selectedSize || sizeChoices[0] || "UNICO";
    addToCart(normalizedProduct, { size });
  };

  if (!product) {
    return (
      <div className="h-96 flex items-center justify-center animate-pulse text-gray-400 text-xl">
        Carregando produto...
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={product.name}
        description={seoDescription}
        canonical={canonicalUrl}
      />
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-12 px-6 md:px-12 max-w-screen-xl mx-auto text-lg">
      <div className="flex flex-col lg:flex-row gap-14">
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-1/2">
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] w-full lg:w-28 flex-none">
            {images.map((src, index) => (
              <Motion.img
                whileHover={{ scale: 1.05 }}
                key={`${src}-${index}`}
                src={src}
                alt={`Miniatura ${index + 1} de ${product.name}`}
                onClick={() => setActiveIndex(index)}
                loading="lazy"
                draggable={false}
                className={["w-24 h-24 object-cover cursor-pointer border rounded-md", "flex-none shrink-0", activeIndex === index ? "border-orange-500" : "border-gray-200"].join(" ")}
              />
            ))}
          </div>
          <div className="flex-1">
            <Motion.div initial={{ opacity: 0.6, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="mx-auto rounded-2xl shadow-lg bg-gray-100 overflow-hidden" style={{ width: "100%", maxWidth: 500 }}>
              <div className="w-full" style={{ aspectRatio: "3/4" }}>
                <img src={mainSrc} alt={product.name} draggable={false} className="w-full h-full object-cover" />
              </div>
            </Motion.div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 leading-snug">{product.name}</h1>
          <ProductRatingSummary productId={product._id} backendUrl={backendUrl} />

          <div className="space-y-2">
            {pixValue !== basePrice && <p className="text-sm text-gray-500 line-through">{formatBRL(basePrice)}</p>}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{formatBRL(pixValue)}</span>
              <span className="text-lg font-semibold text-emerald-600">no PIX</span>
            </div>
            <p className="text-sm text-gray-600">
              ou {installmentsQty}x de <span className="font-semibold text-gray-900">{formatBRL(installmentValue)}</span> no cartao
            </p>
          </div>

          {!!product.description && (
            <p className="text-gray-600 text-[1.05rem] leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {!!product.measurements?.length && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Medidas</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {product.measurements.map((m, idx) => (
                  <li key={`${m.label || "medida"}-${idx}`} className="flex items-center justify-between gap-3">
                    <span className="font-medium text-gray-800">{m.label}</span>
                    <span className="text-gray-600">{m.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {combineProducts.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Combine com</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">Complete o look</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {combineProducts.map((prod) => (
                  <Link
                    key={prod._id}
                    to={getProductUrl(prod)}
                    className="group flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                      <img src={prod.image?.[0]} alt={prod.name} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{prod.name}</p>
                      <p className="text-xs text-emerald-600 font-semibold">{formatBRL(prod.pixPrice || prod.price)} no PIX</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {sizeChoices.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.2em]">Tamanhos Disponiveis</p>
              <div className="flex flex-wrap gap-2">
                {sizeChoices.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={[
                      "min-w-[52px] rounded-full border px-4 py-2 text-sm font-semibold transition",
                      selectedSize === size ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-800 hover:border-gray-500",
                    ].join(" ")}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {selectedSize ? `Selecionado: ${selectedSize}` : "Selecione um tamanho para personalizar o checkout"}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Motion.button
              type="button"
              onClick={handleAddToCart}
              aria-label={isInCart ? "Ir para sacola" : "Adicionar"}
              whileTap={{ scale: 0.96 }}
              animate={{ scale: isInCart ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className={[
                "inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-md border px-6 py-4 text-lg font-semibold shadow-sm transition",
                isInCart
                  ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-gray-900 bg-white text-gray-900 hover:bg-gray-50"
              ].join(" ")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{isInCart ? "Na sacola" : "Adicionar"}</span>
            </Motion.button>
            <button
              type="button"
              onClick={handleBuy}
              className="inline-flex flex-1 min-w-[120px] items-center justify-center rounded-md bg-black px-6 py-4 text-lg font-semibold text-white shadow transition hover:bg-gray-800"
            >
              COMPRAR
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 border ${
                fav ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-800"
              }`}
            >
              <Heart className="h-5 w-5" fill={fav ? "currentColor" : "none"} strokeWidth={1.8} />
              <span className="text-sm font-semibold">{fav ? "Favorito" : "Favoritar"}</span>
            </button>
          </div>

          <ul className="text-base text-gray-600 mt-5 space-y-1">
            <li>Produto 100% original</li>
            <li>Politica de Devolucao em ate 7 dias.</li>
          </ul>

          <ProductComments productId={product._id} backendUrl={backendUrl} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <div className="mt-20">
        <RelatedProducts category={product.category} subCategory={product.subCategory} currentProductId={product._id} currentName={product.name} />
      </div>

      <Modal open={openSizeModal} onClose={() => setOpenSizeModal(false)} title="Escolha o tamanho para continuar a compra">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(sizeLinks).length === 0 && (
            <p className="col-span-3 text-sm text-gray-600">Nenhum link configurado para este produto.</p>
          )}
          {Object.entries(sizeLinks).map(([tamanho]) => (
            <button
              key={tamanho}
              onClick={() => goToSizeLink(tamanho)}
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {tamanho}
            </button>
          ))}
        </div>
      </Modal>
      </Motion.div>
    </>
  );
};

export default Product;
