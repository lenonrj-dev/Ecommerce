import { motion as Motion, useReducedMotion } from "framer-motion";

/**
 * SocialGrid (imagens maiores)
 * - Aumento sutil/tangível do tamanho dos cards
 * - grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 (antes: 3 e 6 colunas)
 * - aspect-[4/3] no mobile e square do sm+ para melhor visualização
 */
export default function SocialGrid({ username, images = [], ctaHref = "#" }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.5,
        ease: "easeOut",
        delayChildren: reduce ? 0 : 0.08,
        staggerChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: "easeOut" } },
  };

  // Skeleton shimmer para feedback de carregamento
  const Skeleton = () => (
    <div
      className="
        relative overflow-hidden rounded-2xl bg-white
        ring-1 ring-black/5 shadow-sm
        aspect-[4/3] sm:aspect-square
      "
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );

  return (
    <section
      className="px-4 sm:px-8 lg:px-20 py-12 bg-white"
      role="region"
      aria-label={`Feed social de @${username}`}
    >
      <div className="mx-auto max-w-screen-xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold tracking-tight">@{username}</h3>
          <a
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="
              text-sm underline underline-offset-4
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/30 focus-visible:outline-offset-2
            "
          >
            Ver no Instagram
          </a>
        </div>

        {/* Grid de imagens (menos colunas => cards maiores) */}
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="
            grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
            gap-3 sm:gap-4
            will-change-transform transform-gpu
          "
          role="list"
        >
          {/* Skeletons quando não houver imagens ainda */}
          {(!images || images.length === 0) &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={`sk-${i}`} />)}

          {images.map((src, i) => {
            // Aceita string ou objeto { src | image | url }
            const url =
              typeof src === "string" ? src : src?.src || src?.image || src?.url || "";

            return (
              <Motion.figure
                key={i}
                variants={item}
                role="listitem"
                className="
                  group relative overflow-hidden
                  rounded-2xl bg-white
                  ring-1 ring-black/5 shadow-sm
                  focus-within:ring-2 focus-within:ring-black/30
                "
                whileHover={{ scale: reduce ? 1 : 1.015 }}
                whileTap={{ scale: 1 }}
              >
                {/* Imagem maior */}
                <img
                  src={url}
                  alt={`post-${i}`}
                  loading="lazy"
                  decoding="async"
                  className="
                    w-full object-cover h-120
                    aspect-[4/3] sm:aspect-square
                    transition-transform duration-500
                    group-hover:scale-105
                  "
                />

                {/* Overlay sutil no hover para contraste */}
                <div
                  className="
                    pointer-events-none absolute inset-0 opacity-0
                    group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-t from-black/15 via-black/5 to-transparent
                  "
                  aria-hidden="true"
                />

                {/* Botão invisível para foco acessível no card */}
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir @${username} no Instagram`}
                  className="
                    absolute inset-0
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                  "
                />
              </Motion.figure>
            );
          })}
        </Motion.div>
      </div>
    </section>
  );
}
