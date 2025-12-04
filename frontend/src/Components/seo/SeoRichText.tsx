import { motion as Motion, useReducedMotion } from "framer-motion";

export default function SeoRichText({ title, paragraphs = [], links = [] }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeOut",
        duration: reduce ? 0 : 0.5,
        delayChildren: reduce ? 0 : 0.05,
        staggerChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: reduce ? 0 : 0.4 } },
  };

  return (
    <section
      role="region"
      aria-label={title}
      className="px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="mx-auto max-w-screen-xl">
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="
            rounded-2xl bg-white ring-1 ring-black/5 shadow-sm
            px-5 sm:px-6 md:px-8 py-6 md:py-8
          "
        >
          {/* Título */}
          <Motion.h2
            variants={item}
            className="text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight"
          >
            {title}
          </Motion.h2>

          {/* Parágrafos SEO */}
          <Motion.div
            variants={container}
            className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 max-w-3xl text-neutral-700"
          >
            {paragraphs.map((p, i) => (
              <Motion.p
                key={i}
                variants={item}
                className="text-base leading-relaxed"
              >
                {p}
              </Motion.p>
            ))}
          </Motion.div>

          {/* Links internos (SEO + navegação) */}
          {!!links.length && (
            <Motion.div
              variants={item}
              className="mt-5 sm:mt-6 flex flex-wrap gap-3 sm:gap-4"
            >
              {links.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  className="
                    inline-flex items-center min-h-[44px]
                    rounded-xl border border-neutral-200 bg-white
                    px-3.5 py-2 text-sm font-medium text-neutral-800
                    underline underline-offset-4
                    hover:bg-neutral-50 hover:shadow-sm hover:translate-y-[-1px]
                    active:translate-y-0 transition
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30
                    touch-manipulation
                  "
                >
                  {l.label}
                </a>
              ))}
            </Motion.div>
          )}
        </Motion.div>
      </div>
    </section>
  );
}
