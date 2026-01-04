import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import HeartButton from "./ui/HeartButton";
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";
import { getProductUrl } from "../utils/productUrl";

const CartPlusIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
    <path
      d="M7 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm9 0a1 1 0 1 0 .001 2.001A1 1 0 0 0 16 18Zm2.57-4.25a1 1 0 0 0 .96-.73l2-7A1 1 0 0 0 20.57 5H6.2l-.3-1.2A2 2 0 0 0 4 2H2v2h2l3 12h11v-2H8.4l-.35-1.4h10.52ZM12 4v3M10.5 5.5h3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M17 8h-3V5h-2v3H9v2h3v3h2v-3h3V8Z" fill="currentColor" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    aria-hidden="true"
    focusable="false"
    className={filled ? "text-amber-400" : "text-neutral-300"}
  >
    <path
      fill="currentColor"
      d="M12 2.5 9.3 8 3.3 8.7l4.5 3.9L6.6 18.5 12 15.6l5.4 2.9-1.2-5.9 4.5-3.9-6-.7L12 2.5z"
    />
  </svg>
);

const GLOBAL_DISCOUNT = 40;
const DEFAULT_INSTALLMENTS_QTY = 12;

const useSizeLinks = (yampiLink, yampiLinks, variants, sizes) => {
  return useMemo(() => {
    if (yampiLinks && typeof yampiLinks === "object" && Object.keys(yampiLinks).length) {
      return yampiLinks;
    }
    if (yampiLink) {
      let available =
        Array.isArray(variants) && variants.length
          ? variants
              .filter((v) => v?.isActive !== false && String(v?.size).trim())
              .map((v) => String(v.size).trim().toUpperCase())
          : Array.isArray(sizes)
          ? sizes.map((s) => String(s).trim().toUpperCase())
          : [];
      available = Array.from(new Set(available));
      if (available.length) {
        return available.reduce((acc, s) => {
          acc[s] = yampiLink;
          return acc;
        }, {});
      }
      return { UNICO: yampiLink };
    }
    return {};
  }, [yampiLink, yampiLinks, variants, sizes]);
};

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <Motion.div
        className="fixed inset-0 z-[60] grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <Motion.div
          className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              Fechar
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </Motion.div>
      </Motion.div>
    )}
  </AnimatePresence>
);

const ProductItem = ({ product: productProp, className = "", ...legacyProps }) => {
  const { addToCart, isLoggedIn } = useContext(ShopContext);
  const data = useMemo(
    () => productProp || legacyProps || {},
    [productProp, legacyProps]
  );
  const {
    _id,
    id: legacyId,
    image = [],
    name,
    price,
    pixPrice,
    installments,
    ratingAverage,
    ratingCount,
    yampiLink,
    yampiLinks,
    variants,
    sizes,
  } = data;
  const id = _id || legacyId;
  const navigate = useNavigate();
  const productUrl = useMemo(
    () => getProductUrl({ ...data, _id: id, name }),
    [data, id, name]
  );

  const images = useMemo(() => {
    if (Array.isArray(image)) return image.filter(Boolean);
    return image ? [image] : [];
  }, [image]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let intervalId;
    let fadeTimeout;
    if (hovering && images.length > 1) {
      intervalId = setInterval(() => {
        setNextIdx((prev) => {
          const base = typeof prev === "number" ? prev : currentIdx;
          const ni = (base + 1) % images.length;
          setFading(true);
          fadeTimeout = setTimeout(() => {
            setCurrentIdx(ni);
            setFading(false);
            setNextIdx(null);
          }, 300);
          return ni;
        });
      }, 1100);
    }
    return () => {
      clearInterval(intervalId);
      clearTimeout(fadeTimeout);
      setNextIdx(null);
      setFading(false);
      setCurrentIdx(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovering, images.length]);

  const [openSizeModal, setOpenSizeModal] = useState(false);
  const sizeLinks = useSizeLinks(yampiLink, yampiLinks, variants, sizes);
  const entries = Object.entries(sizeLinks);

  const goTo = (link) => link && (window.location.href = link);

  const productForHeart = useMemo(
    () => ({ _id: id, name, price, image: images }),
    [id, name, price, images]
  );

  const handleCardClick = () => {
    if (!id || productUrl === "#") return;
    navigate(productUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const basePrice = Number(price) || 0;
  const pixValue =
    Number.isFinite(Number(pixPrice)) && Number(pixPrice) >= 0 ? Number(pixPrice) : basePrice;
  const installmentsQty =
    Number(installments?.quantity) > 0 ? Number(installments.quantity) : DEFAULT_INSTALLMENTS_QTY;
  const installmentValue =
    Number.isFinite(Number(installments?.value)) && Number(installments?.value) >= 0
      ? Number(installments.value)
      : installmentsQty > 0
      ? basePrice / installmentsQty
      : basePrice;

  const normalizedProductPayload = useMemo(
    () => ({
      ...data,
      _id: id,
      name,
      price: basePrice,
      pixPrice: pixValue,
      installments: {
        quantity: installmentsQty,
        value: installmentValue,
      },
      image: images,
    }),
    [data, id, name, basePrice, pixValue, installmentsQty, installmentValue, images]
  );

  const ensureAuthenticated = () => {
    if (isLoggedIn) return true;
    toast.info("Faça login para adicionar produtos à sacola.");
    navigate("/login");
    return false;
  };

  const addProductToCart = (sizeLabel, { skipAuthCheck } = {}) => {
    if (!normalizedProductPayload) return false;
    if (!skipAuthCheck && !ensureAuthenticated()) return false;
    const chosenSize = sizeLabel || entries[0]?.[0] || "UNICO";
    addToCart(normalizedProductPayload, { size: chosenSize });
    return true;
  };

  const handleSizeSelection = (sizeLabel, link) => {
    const added = addProductToCart(sizeLabel);
    if (!added) return;
    setOpenSizeModal(false);
    if (link) goTo(link);
  };

  const handleQuickAdd = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (entries.length <= 1) {
      const [sizeLabel, link] = entries[0] || [null, yampiLink];
      const added = addProductToCart(sizeLabel);
      if (added && link) goTo(link);
    } else {
      if (!ensureAuthenticated()) return;
      setOpenSizeModal(true);
    }
  };

  const discount = GLOBAL_DISCOUNT;
  const showDiscount = typeof discount === "number" && discount > 0;
  const avgRating = typeof ratingAverage === "number" ? ratingAverage : 5;
  const totalRatings = typeof ratingCount === "number" ? ratingCount : 0;

  const cardClasses = ["text-gray-700 cursor-pointer", className].filter(Boolean).join(" ");

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Abrir ${name}`}
    >
      <Motion.div
        className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-shadow"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => setHovering(true)}
        onTouchEnd={() => setHovering(false)}
      >
        <div className="relative w-full aspect-[2/3]">
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <Motion.button
              type="button"
              aria-label={`Adicionar ${name} à sacola`}
              onClick={handleQuickAdd}
              whileHover={{ scale: 1.12, y: -1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 shadow-md hover:bg-white/90 hover:shadow-lg ring-0 hover:ring-2 hover:ring-black/10 transition"
            >
              <CartPlusIcon />
            </Motion.button>

            <Motion.div whileHover={{ scale: 1.12, y: -1 }} whileTap={{ scale: 0.9 }}>
              <HeartButton product={productForHeart} stopPropagation />
            </Motion.div>
          </div>

          {showDiscount && (
            <div className="pointer-events-none absolute top-3 left-3 z-30">
              <div className="rounded-full border border-black/5 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                {discount}% OFF
              </div>
            </div>
          )}

          {images[0] && (
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={images[currentIdx]}
              alt={name}
              loading="lazy"
              draggable={false}
            />
          )}

          {typeof nextIdx === "number" && images[nextIdx] && (
            <img
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                fading ? "opacity-100" : "opacity-0"
              }`}
              src={images[nextIdx]}
              alt={name}
              draggable={false}
            />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <span className="rounded-full bg-white/95 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              Zero transparência
            </span>
          </div>
        </div>
      </Motion.div>

      <Link
        className="pt-3 block text-sm font-medium text-neutral-900 hover:underline"
        to={productUrl}
        onClick={(e) => e.stopPropagation()}
      >
        {name}
      </Link>

      <div className="mt-1 space-y-1">
        <div className="flex items-center gap-[2px] text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <StarIcon key={idx} filled={idx < Math.round(avgRating)} />
          ))}
          {totalRatings > 0 && (
            <span className="ml-1 text-[11px] font-medium text-neutral-600">({totalRatings})</span>
          )}
        </div>

        {pixValue !== basePrice && (
          <div className="text-[11px] text-neutral-500 line-through">
            {formatCurrency(basePrice)}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-[18px] font-semibold text-emerald-600">
            {formatCurrency(pixValue)}
          </span>
          <span className="text-[13px] font-semibold text-neutral-900">no PIX</span>
        </div>

        <div className="text-[11px] text-neutral-500">
          {installmentsQty}x de {" "}
          <span className="font-medium text-neutral-700">
            {formatCurrency(installmentValue)}
          </span>{" "}
          no cartão s/ juros
        </div>
      </div>

      <Modal
        open={openSizeModal}
        onClose={() => setOpenSizeModal(false)}
        title="Escolha o tamanho para comprar"
      >
        <div className="grid grid-cols-3 gap-2">
          {entries.map(([tamanho, link]) => (
            <button
              key={tamanho}
              onClick={() => handleSizeSelection(tamanho, link)}
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {tamanho}
            </button>
          ))}
          {entries.length === 0 && (
            <p className="col-span-3 text-sm text-gray-600">
              Nenhum link configurado.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProductItem;

