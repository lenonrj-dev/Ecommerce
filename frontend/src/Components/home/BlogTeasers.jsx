import { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * BlogTeasers
 * - Mantém todos os textos originais
 * - UI modernizada com Tailwind + Framer Motion
 * - Melhor responsividade, acessibilidade e microinterações
 */
export default function BlogTeasers({ posts = [] }) {
  const reduce = useReducedMotion();

  // Variants para animações suaves + stagger
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: reduce ? 0 : 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: "easeOut" } },
  };

  return (
    <section
      className="px-4 sm:px-8 lg:px-20 py-12"
      aria-label="Artigos do blog e guias"
      role="region"
    >
      <Motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-screen-xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
      >
        {posts.map((p, i) => (
          <Motion.article
            key={i}
            variants={item}
            className="group rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden shadow-sm transition will-change-transform transform-gpu hover:shadow-lg focus-within:shadow-lg"
          >
            <CardImage src={p.image} alt={p.title} href={p.href} />

            <div className="p-4 sm:p-5">
              <h3 className="text-base md:text-lg font-semibold tracking-tight text-neutral-900 leading-snug">
                {p.title}
              </h3>

              {/* Ação padrão (mantém texto original) */}
              <Link
                to={p.href}
                aria-label={`Ler artigo: ${p.title}`}
                className="
                  mt-3 inline-flex min-h-[44px] items-center
                  text-xs md:text-sm font-medium text-neutral-800 underline underline-offset-4
                  hover:opacity-90 active:opacity-100
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2
                "
              >
                Ler artigo
              </Link>
            </div>
          </Motion.article>
        ))}
      </Motion.div>
    </section>
  );
}

/**
 * CardImage
 * - Mantém layout estável com aspect ratio
 * - Skeleton enquanto carrega
 * - Imagem clicável com foco acessível
 */
function CardImage({ src, alt, href }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton / shimmer */}
      <div
        aria-hidden="true"
        className={[
          "absolute inset-0",
          "bg-[linear-gradient(100deg,rgba(0,0,0,0.05)_20%,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.05)_60%)]",
          "bg-[length:200%_100%] animate-[shimmer_1.2s_ease_infinite]",
          loaded ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Link
        to={href}
        className="block focus-visible:outline-none"
        aria-label={alt}
      >
        <Motion.figure
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden"
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={[
              "h-full w-full object-cover",
              "transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </Motion.figure>
      </Link>
    </div>
  );
}
