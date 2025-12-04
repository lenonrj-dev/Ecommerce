import { motion as Motion, useReducedMotion } from "framer-motion";
import { Truck, RefreshCcw, Shield, CreditCard } from "lucide-react";

const ICONS = { Truck, RefreshCcw, Shield, CreditCard };

export default function UspBar({ items = [] }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 8 },
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
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: reduce ? 0 : 0.4 } },
  };

  const Skeleton = () => (
    <div
      className="
        rounded-2xl ring-1 ring-black/5 shadow-sm
        bg-white p-4 min-h-[64px]
        relative overflow-hidden
      "
      aria-hidden="true"
    >
      <div className="h-5 w-5 rounded-md bg-neutral-200" />
      <div className="mt-3 h-3 w-3/5 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-2/5 rounded bg-neutral-100" />

      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );

  return (
    <section
      className="px-4 sm:px-8 lg:px-20 py-6 bg-white"
      role="region"
      aria-label="Benefícios e garantias"
    >
      <div className="mx-auto max-w-screen-xl">
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          role="list"
        >
          {/* Skeletons se não houver itens */}
          {(!items || items.length === 0) &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={`sk-${i}`} />)}

          {items.map((it, i) => {
            const Icon = ICONS[it.icon] || Shield;
            return (
              <Motion.div
                key={i}
                variants={item}
                role="listitem"
                className="
                  group rounded-2xl bg-white p-4
                  ring-1 ring-black/5 shadow-sm
                  transition
                  hover:shadow-md
                  focus-within:ring-2 focus-within:ring-black/30
                  cursor-default select-none
                  touch-manipulation
                  min-h-[72px]
                "
                whileHover={{ scale: reduce ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={`${it.title} — ${it.desc}`}
                  className="
                    flex items-center gap-3
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30
                  "
                >
                  <span
                    className="
                      rounded-lg border border-neutral-900 p-1.5
                      bg-white/90
                      transition-colors
                      group-hover:bg-white
                    "
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="leading-relaxed">
                    <p className="text-sm font-semibold tracking-tight">{it.title}</p>
                    <p className="text-xs text-neutral-600">{it.desc}</p>
                  </div>
                </a>
              </Motion.div>
            );
          })}
        </Motion.div>
      </div>
    </section>
  );
}
