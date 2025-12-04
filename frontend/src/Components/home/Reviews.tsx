import { motion as Motion } from "framer-motion";

export default function Reviews({ items = [] }) {
  return (
    <section className="px-4 sm:px-8 lg:px-20 py-12 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <Motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-2xl border border-neutral-200 bg-white p-5"
          >
            <p className="text-sm text-neutral-700">“{t.text}”</p>
            <div className="mt-3 text-xs text-neutral-500">
              {t.name} • {t.rating}★
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}
