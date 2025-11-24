import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Title from "./Title";

const CATEGORIES = [
  {
    title: "Coleção Macacões",
    tag: "One piece. Zero preocupações.",
    description:
      "Modelagem estruturada que abraça cada curva e acompanha qualquer treino ou viagem.",
    image:
      "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758997231/products/b1n65psbkjtwcd0olyan.png",
    href: "/outlet?type=Macac%C3%A3o",
    highlight: "Best seller",
  },
  {
    title: "Tops Performance",
    tag: "Compressão + respirabilidade",
    description:
      "Alças inteligentes e tecidos com toque frio para treinar sem distrações.",
    image:
      "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758992784/products/j1f5lqpcq5wetgppnhln.png",
    href: "/fitness?type=Top",
    highlight: "Novidades",
  },
  {
    title: "Leggings Tech Sculpt",
    tag: "Efeito segunda pele",
    description:
      "Cintura alta, zero transparência e compressão na medida certa para o dia todo.",
    image:
      "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758993368/products/cxhfcgf51fqadns3szs3.png",
    href: "/fitness?type=Cal%C3%A7a",
    highlight: "Favoritos do público",
  },
  {
    title: "Shorts Essenciais",
    tag: "Frescor + sustentação",
    description:
      "Perfeitos para corridas ou looks urbanos. Tecidos leves e bolsos estratégicos.",
    image:
      "https://res.cloudinary.com/diwvlsgsw/image/upload/v1758993057/products/zaf2phwmnqxie65cixgn.png",
    href: "/outlet?type=Short",
    highlight: "Novo drop",
  },
  {
    title: "Casual Ativo",
    tag: "Do estúdio para a rua",
    description:
      "Regatas, croppeds e camadas leves para compor looks confortáveis com informação de moda.",
    image:
      "https://res.cloudinary.com/diwvlsgsw/image/upload/v1759103821/products/t3qnorxtkrmgfhfgh8pg.png",
    href: "/casual",
    highlight: "Limited edition",
  },
];

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

  const isMobile = containerWidth < 768;
  const visibleCount = isMobile ? 1 : 3;
  const gapPx = 24;
  const slideWidth = (containerWidth + gapPx) / visibleCount;
  const maxIndex = Math.max(CATEGORIES.length - visibleCount, 0);

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
        <Motion.div
          className="flex gap-4"
          animate={{ x: -currentIndex * slideWidth }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          {CATEGORIES.map((item, index) => (
            <Link
              to={item.href}
              key={item.title}
              className="flex-shrink-0 basis-full sm:basis-[calc((100%-48px)/3)]"
            >
              <div className="group relative overflow-hidden rounded-[28px] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70 opacity-80 group-hover:opacity-90 transition duration-500" />
                <Motion.img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[420px] object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {item.highlight}
                  </span>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">{item.tag}</p>
                  <p className="mt-3 text-[13px] text-white/80 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
                    <span>00{index + 1}</span>
                    <span>ver coleção</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </Motion.div>
      </div>
    </section>
  );
}
