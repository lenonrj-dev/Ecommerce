import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeartButton from "./ui/HeartButton.jsx";

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

// 🔥 Desconto global — 40% OFF em todos
const GLOBAL_DISCOUNT = 40;

/** Normaliza e cria o mapa de links por tamanho (prioriza yampiLinks; fallback yampiLink único) */
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
      return { ÚNICO: yampiLink };
    }
    return {};
  }, [yampiLink, yampiLinks, variants, sizes]);
};

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[60] grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
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
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const currencyBRL = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));

/**
 * Props esperadas:
 * { id, image = [], name, price, yampiLink, yampiLinks, variants, sizes }
 */
const ProductItem = ({
  id,
  image = [],
  name,
  price,
  yampiLink,
  yampiLinks,
  variants,
  sizes,
}) => {
  const navigate = useNavigate();

  // normaliza imagens
  const images = useMemo(() => {
    if (Array.isArray(image)) return image.filter(Boolean);
    return image ? [image] : [];
  }, [image]);

  // slideshow com crossfade ao passar o mouse
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
  const hasAnyLink = entries.length > 0;

  const goTo = (link) => link && (window.location.href = link);

  // objeto mínimo para o HeartButton
  const productForHeart = useMemo(
    () => ({ _id: id, name, price, image: images }),
    [id, name, price, images]
  );

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const discount = GLOBAL_DISCOUNT;
  const showDiscount = typeof discount === "number" && discount > 0;

  return (
    <div
      className="text-gray-700 cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Abrir ${name}`}
    >
      <motion.div
        className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-shadow"
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => setHovering(true)}
        onTouchEnd={() => setHovering(false)}
      >
        {/* Imagem mais alta para destaque do produto */}
        <div className="relative w-full aspect-[2/3]">
          {/* Barra de ações: carrinho + coração (topo direito) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {/* Carrinho: navega para a página do produto (igual clique normal) */}
            <motion.button
              type="button"
              aria-label={`Ver detalhes de ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCardClick();
              }}
              whileHover={{ scale: 1.12, y: -1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 shadow-md hover:bg-white/90 hover:shadow-lg ring-0 hover:ring-2 hover:ring-black/10 transition"
            >
              <CartPlusIcon />
            </motion.button>

            {/* HeartButton estilizado (círculo branco) com microinteração */}
            <motion.div whileHover={{ scale: 1.12, y: -1 }} whileTap={{ scale: 0.9 }}>
              <HeartButton product={productForHeart} stopPropagation />
            </motion.div>
          </div>

          {/* Badge de desconto 40% OFF — canto superior esquerdo, estilo pill branco */}
          {showDiscount && (
            <div className="pointer-events-none absolute top-3 left-3 z-30">
              <div className="rounded-full border border-black/5 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-900 shadow-md transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                {discount}% OFF
              </div>
            </div>
          )}

          {/* Imagem principal + crossfade */}
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

          {/* Badge ZERO TRANSPARÊNCIA centralizado na base da imagem */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <span className="rounded-full bg-white/95 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              Zero transparência
            </span>
          </div>
        </div>
      </motion.div>

      {/* Nome + preço abaixo da imagem */}
      <Link
        className="pt-3 pb-1 text-sm font-medium block hover:underline"
        to={`/product/${id}`}
        onClick={(e) => e.stopPropagation()}
      >
        {name}
      </Link>
      <p className="text-sm font-semibold">{currencyBRL(price)}</p>

      {/* Modal de tamanhos (mantido para uso futuro) */}
      <Modal
        open={openSizeModal}
        onClose={() => setOpenSizeModal(false)}
        title="Escolha o tamanho para comprar"
      >
        <div className="grid grid-cols-3 gap-2">
          {entries.map(([tamanho, link]) => (
            <button
              key={tamanho}
              onClick={() => goTo(link)}
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
