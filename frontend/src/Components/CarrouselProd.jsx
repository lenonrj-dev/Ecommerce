import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Title from "./Title";

const titles = [
  "Macacão",
  "Top Fitness",
  "Calça Legging",
  "Short Fitness",
  "Top Nadador",
  "Regata Casual",
  "Croped Casual",
  "Short Casual",
];

const images = [
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758997231/products/b1n65psbkjtwcd0olyan.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758992784/products/j1f5lqpcq5wetgppnhln.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758993368/products/cxhfcgf51fqadns3szs3.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758993057/products/zaf2phwmnqxie65cixgn.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758993368/products/cxhfcgf51fqadns3szs3.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103472/products/uakjofj0kgzs4wsbqcpb.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103821/products/t3qnorxtkrmgfhfgh8pg.png",
  "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103643/products/axlqiifwheya8kijbtbx.png",
];

const prices = [
  "R$258,00",
  "R$90,00",
  "R$160,00",
  "R$115,00",
  "R$90,00",
  "R$80,00",
  "R$70,00",
  "R$90,00",
];

// Descontos fáceis de editar: um por produto (mesma ordem de `titles`)
const discounts = [29, 15, 20, 18, 10, 25, 30, 12];

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const items = titles.map((title, i) => {
  const parts = title.split(" ");
  const text1 = parts.length > 1 ? parts.slice(0, 1).join(" ") : title;
  const text2 = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return {
    id: i,
    title,
    text1,
    text2,
    slug: slugify(title),
    image: images[i],
    price: prices[i % prices.length],
    discount: typeof discounts[i] === "number" ? discounts[i] : null,
  };
});

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isMobile = containerWidth < 640;
  const visibleCount = isMobile ? 1 : 5;
  const gapPx = 16;
  const slideWidth = (containerWidth + gapPx) / visibleCount;
  const maxIndex = items.length - visibleCount;

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section className="relative w-full bg-white px-4 py-12">
      {/* Cabeçalho centralizado */}
      <div className="flex flex-col items-center mb-8 text-center">
        <Title text1="Explore Categorias" text2="Que Todo Mundo Ama" />
        <div className="flex gap-2 mt-4">
          <button
            onClick={prev}
            className="p-2 text-gray-600 hover:text-black transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="p-2 text-gray-600 hover:text-black transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -currentIndex * slideWidth }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          {items.map((item) => {
            const query = `?type=${encodeURIComponent(item.title)}`;
            const targetLink = `/outlet${query}`;
            const hasDiscount =
              typeof item.discount === "number" && item.discount > 0;

            return (
              <Link
                to={targetLink}
                key={item.id}
                className="flex-shrink-0 basis-full sm:basis-[calc((100%-64px)/5)]"
              >
                <div className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  {/* Faixa BLACK FRIDAY */}
                  {hasDiscount && (
                    <div className="pointer-events-none absolute -left-10 top-4 z-30 rotate-[-45deg] bg-red-600 px-10 py-1 shadow-md">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Black Friday
                      </span>
                    </div>
                  )}

                  {/* Badge de desconto */}
                  {hasDiscount && (
                    <div className="pointer-events-none absolute right-0 top-0 z-30 rounded-bl-lg bg-black/90 px-3 py-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                        {item.discount}% OFF
                      </span>
                    </div>
                  )}

                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[520px] object-cover transition duration-500 group-hover:scale-105 group-hover:blur-sm"
                  />

                  <motion.div
                    className="absolute inset-0 z-10 bg-black/30"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.4 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 px-4">
                    <Title text1={item.text1} text2={item.text2} />
                    <p className="text-sm mt-1 drop-shadow-md">
                      A partir de{" "}
                      <span className="font-bold">{item.price}</span>
                    </p>
                    <p className="text-xs mt-1 italic drop-shadow-md">
                      Últimas unidades desta coleção
                    </p>

                    <motion.button
                      className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium py-1 px-3 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      COMPRAR AGORA →
                    </motion.button>
                  </motion.div>
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
