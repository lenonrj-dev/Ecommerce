// src/Components/Hero.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const MAIN_IMAGE_URL =
  "https://res.cloudinary.com/dosk8wyqj/image/upload/v1758632332/uypbgnab3aorgddwz5dc.png";

const GALLERY_IMAGES = [
  "https://res.cloudinary.com/dosk8wyqj/image/upload/v1758632331/camywhqhwumm4z7mjg7e.png",
  "https://res.cloudinary.com/dosk8wyqj/image/upload/v1758632101/bldfx1uqqrc8yq90wjsj.png",
  "https://res.cloudinary.com/dosk8wyqj/image/upload/v1758632101/simmsqdbbdrdbgiyluf2.png",
  "https://res.cloudinary.com/dosk8wyqj/image/upload/v1758632333/ycnh3gx9c7wumij7kq3o.png",
];

const HERO_PRODUCT = {
  breadcrumb: ["Início", "Outlet", "Zoho Oversize"],
  name: "ZOHO — OVERSIZE SWEATSHIRT",
  collection: "ESSENTIAL COMFORT DROP",
  description:
    "Moletom oversized em algodão premium, com toque macio, caimento amplo e conforto que acompanha do aquecimento ao pós-treino.",
  sizes: ["PP", "P", "M", "G", "GG"],
  colors: [
    { name: "Branco", hex: "#f5f5f5" },
    { name: "Cinza", hex: "#a3a3a3" },
    { name: "Chumbo", hex: "#595959" },
    { name: "Preto", hex: "#111111" },
  ],
};

const zoomIn = {
  initial: { scale: 1.06, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 1.1, ease: "easeOut" } },
};

export default function Banner() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1
    );
  };

  const totalSlides = GALLERY_IMAGES.length;
  const currentSlideLabel = `${String(activeIndex + 1).padStart(2, "0")}/${String(
    totalSlides
  ).padStart(2, "0")}`;

  return (
    <section
      aria-label="Produto em destaque - Hero principal"
      className="relative w-full bg-[#f5f3f0] text-neutral-900"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid min-h-[520px] gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)] lg:items-stretch">
          {/* COLUNA ESQUERDA - INFO DO PRODUTO */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.8 } }}
            className="flex flex-col justify-between gap-8"
          >
            <div className="space-y-6">
              {/* Breadcrumb */}
              <nav
                aria-label="Trilha de navegação do produto"
                className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.26em] text-neutral-500"
              >
                {HERO_PRODUCT.breadcrumb.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 && (
                      <span aria-hidden="true" className="opacity-40">
                        /
                      </span>
                    )}
                    <button
                      type="button"
                      className="cursor-pointer hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800/50"
                    >
                      {item}
                    </button>
                  </React.Fragment>
                ))}
              </nav>

              {/* Título + descrição */}
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.26em] text-neutral-500">
                  {HERO_PRODUCT.collection}
                </p>
                <h1 className="text-3xl font-semibold uppercase leading-tight tracking-[0.18em] sm:text-[32px] lg:text-[38px]">
                  {HERO_PRODUCT.name}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-700">
                  {HERO_PRODUCT.description}
                </p>
              </div>

              {/* Tamanhos e cores */}
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-1">
                {/* Tamanhos */}
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Tamanhos
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {HERO_PRODUCT.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className="min-w-[2.6rem] rounded-full border border-neutral-300 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cores */}
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Cores
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {HERO_PRODUCT.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white/60 p-[2px] transition-transform hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
                      >
                        <span className="sr-only">{color.name}</span>
                        <span
                          className="block h-full w-full rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÕES - CANTO INFERIOR ESQUERDO */}
            <div className="mt-2 flex items-center gap-4">
              {/* Botão circular */}
              <a
                href="/product"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
              >
                <span className="sr-only">Ver peça em destaque</span>
                <span aria-hidden="true" className="-translate-y-[1px] text-lg">
                  →
                </span>
              </a>

              {/* Botão pill */}
              <a
                href="/product"
                className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-900 px-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
              >
                Comprar agora
              </a>
            </div>
          </motion.div>

          {/* COLUNA CENTRAL - MODELO / IMAGEM PRINCIPAL */}
          <motion.figure
            variants={zoomIn}
            initial="initial"
            animate="animate"
            className="relative flex items-center justify-center"
          >
            <div className="relative h-[360px] w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-[#e4e1dc] shadow-[0_26px_60px_rgba(0,0,0,0.18)] sm:h-[420px] md:h-[480px] lg:h-[520px]">
              <img
                src={MAIN_IMAGE_URL}
                alt="Modelo vestindo o moletom oversized em tom neutro"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
            </div>
          </motion.figure>

          {/* COLUNA DIREITA - CARROSSEL LATERAL (DESKTOP) */}
          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.8 } }}
            className="hidden flex-col justify-between lg:flex"
            aria-label="Galeria de imagens da peça"
          >
            <div className="relative h-[260px] overflow-hidden rounded-[2rem] bg-[#e4e1dc] shadow-[0_18px_40px_rgba(0,0,0,0.14)] md:h-[320px] lg:h-[360px]">
              <img
                src={GALLERY_IMAGES[activeIndex]}
                alt="Variação de ângulo da peça e conjunto fitness"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white/70 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
                  aria-label="Imagem anterior da galeria"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white/70 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60"
                  aria-label="Próxima imagem da galeria"
                >
                  →
                </button>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-neutral-500">
                {currentSlideLabel}
              </p>
            </div>
          </motion.aside>
        </div>

        {/* GALERIA COMPACTA NO MOBILE/TABLET */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 lg:hidden" aria-label="Galeria de imagens da peça">
          {GALLERY_IMAGES.map((image, index) => (
            <div
              key={image + index}
              className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#e4e1dc]"
            >
              <img
                src={image}
                alt="Detalhe visual da peça em diferentes ângulos"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
