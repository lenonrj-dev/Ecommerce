import React from "react";

// Imagem fixa do hero (sem depender de .env)
const HERO_IMAGE =
  "https://res.cloudinary.com/dwf2uc6ot/image/upload/v1763944474/casual_enzlbk.svg";

const Hero = () => {
  return (
    <section
      className="w-full flex flex-col overflow-hidden bg-[#FAFAFA]"
      aria-label="Seção Hero em imagem"
    >
      <div className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        <img
          src={HERO_IMAGE}
          alt="Coleção destaque Marima"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </section>
  );
};

export default Hero;
