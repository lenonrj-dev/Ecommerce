import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGES = [
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768760004/LinhaFitness1_w6ocmg.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768760004/PerfomanceBanner2_jltkfo.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768760004/AthleisureBanner_dzhuwp.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768760013/ConjuntoAthleisure3_nuyeig.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768760014/ConjuntoAthleisure_weaqkj.png",
];
const HERO_IMAGES_MOBILE = [
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768761413/IMG_8923_qbl5qg.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768761421/DSC09936_femjdp.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768761442/GAB08727_aaljeh.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768761457/GAB08718_vcb4v1.png",
  "https://res.cloudinary.com/dpyrbbvjd/image/upload/v1768761486/GAB08709_uhjggz.png",
];
const HERO_ROTATION_MS = 5000;

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const heroImages = isMobile ? HERO_IMAGES_MOBILE : HERO_IMAGES;

  useEffect(() => {
    setActiveIndex(0);
  }, [isMobile]);

  useEffect(() => {
    if (!heroImages.length) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, HERO_ROTATION_MS);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const heroImage = heroImages[activeIndex] || heroImages[0] || "";
  const heroHref = activeIndex < 2 ? "/fitness" : "/casual";

  return (
    <section
      className="w-full flex flex-col overflow-hidden bg-[#FAFAFA]"
      aria-label="Seção Hero em imagem"
    >
      <div className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        <Link
          to={heroHref}
          aria-label={activeIndex < 2 ? "Explorar linha fitness" : "Explorar linha casual"}
          className="block w-full h-full"
        >
          <img
            src={heroImage}
            alt="Coleção destaque Marima"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
