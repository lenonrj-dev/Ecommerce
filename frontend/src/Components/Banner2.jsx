import React from "react";
import { motion as Motion } from "framer-motion";
const LEFT_URL =
  "https://res.cloudinary.com/dwf2uc6ot/image/upload/v1763943983/Black_tjxfgs.svg";
const RIGHT_URL =
  "https://res.cloudinary.com/dwf2uc6ot/image/upload/v1763943966/athleisu_qvmjw4.svg";
const MOBILE_URL =
  "https://res.cloudinary.com/dwf2uc6ot/image/upload/v1763943983/Black_tjxfgs.svg";
const zoomIn = {
  initial: { scale: 1.08, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.1, ease: "easeOut" },
  },
};
export default function Banner2() {
  const mobileSrc = MOBILE_URL || LEFT_URL;
  return (
    <section aria-label="Hero principal" className="relative w-full bg-white">
      {" "}
      <div className="relative grid w-full overflow-hidden grid-cols-1 md:grid-cols-2 gap-x-0 md:gap-x-[13px] h-[560px] sm:h-[680px] lg:h-[900px] xl:h-[850px]">
        {" "}
        <Motion.figure
          variants={zoomIn}
          initial="initial"
          animate="animate"
          className="relative h-full"
        >
          {" "}
          <picture>
            {" "}
            <source media="(max-width: 767px)" srcSet={mobileSrc} />{" "}
            <img
              src={LEFT_URL}
              alt="Coleção — imagem esquerda"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />{" "}
          </picture>{" "}
          <div className="absolute inset-0 bg-white/6" />{" "}
        </Motion.figure>{" "}
        <Motion.figure
          variants={zoomIn}
          initial="initial"
          animate="animate"
          className="relative h-full hidden md:block"
        >
          {" "}
          <img
            src={RIGHT_URL}
            alt="Coleção — imagem direita"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />{" "}
          <div className="absolute inset-0 bg-white/6" />{" "}
        </Motion.figure>{" "}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {" "}
          <div className="text-center px-4">
            {" "}
            <h2 className="text-[26px] sm:text-[28px] leading-tight tracking-[0.18em] font-semibold text-neutral-900 uppercase [text-wrap:balance]">
              {" "}
              <span className="block">MODA.</span>{" "}
              <span className="block mt-1">Casual.</span>{" "}
              <span className="block mt-1">Athleisure.</span>{" "}
            </h2>{" "}
            <div className="mt-5 flex items-center justify-center">
              {" "}
              <a
                href="/casual"
                className="pointer-events-auto text-[12px] md:text-[13px] tracking-[0.26em] uppercase text-neutral-900 relative after:content-[''] after:block after:h-[1.5px] after:w-full after:mt-2 after:bg-neutral-900/90 hover:opacity-70 transition-opacity"
              >
                {" "}
                Ofertas para Produtos Selecionados!{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
