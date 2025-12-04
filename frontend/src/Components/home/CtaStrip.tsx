import { motion as Motion, useReducedMotion } from "framer-motion";

export default function CtaStrip({ title, subtitle, primary, secondary }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.5,
        ease: "easeOut",
        delayChildren: reduce ? 0 : 0.1,
        staggerChildren: reduce ? 0 : 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.45, ease: "easeOut" },
    },
  };

  return (
    <section
      className="px-4 sm:px-8 lg:px-20 py-12"
      role="region"
      aria-label="Chamada para ação"
    >
      <Motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="
          mx-auto max-w-screen-xl
          relative overflow-hidden
          rounded-2xl bg-neutral-900 text-white
          ring-1 ring-black/5 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)]
        "
      >
        {/* Máscara sutil p/ legibilidade sem alterar cor de marca */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8">
          {/* Título + subtítulo */}
          <Motion.div variants={item} className="space-y-1">
            <h4 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {title}
            </h4>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              {subtitle}
            </p>
          </Motion.div>

          {/* Ações */}
          <Motion.div
            variants={item}
            className="flex w-full sm:w-auto gap-3 sm:gap-4"
          >
            {primary && (
              <Motion.a
                href={primary.href}
                className="
                  inline-flex min-h-[44px] items-center justify-center
                  rounded-xl border border-white bg-white px-4 sm:px-5 py-2.5
                  text-sm font-bold text-neutral-900
                  shadow-sm hover:shadow-md
                  transition transform-gpu will-change-transform
                  hover:-translate-y-0.5 active:translate-y-0
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80 focus-visible:outline-offset-2
                  touch-manipulation
                "
                whileHover={{ scale: reduce ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {primary.label}
              </Motion.a>
            )}

            {secondary && (
              <Motion.a
                href={secondary.href}
                className="
                  inline-flex min-h-[44px] items-center justify-center
                  rounded-xl border border-white/80 px-4 sm:px-5 py-2.5
                  text-sm fontBold font-bold text-white
                  hover:bg-white/10
                  shadow-sm hover:shadow-md
                  transition transform-gpu will-change-transform
                  hover:-translate-y-0.5 active:translate-y-0
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80 focus-visible:outline-offset-2
                  touch-manipulation
                "
                whileHover={{ scale: reduce ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {secondary.label}
              </Motion.a>
            )}
          </Motion.div>
        </div>
      </Motion.div>
    </section>
  );
}
