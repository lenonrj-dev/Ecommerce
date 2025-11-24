import { motion as Motion } from "framer-motion";

/**
 * Loader animado inspirado nos pontos pulsantes do Google.
 */
const dotColors = ["#DCDCDC", "#696969", "#363636", "#1C1C1C"];

export default function GoogleLoader() {
  return (
    <div
      className="flex justify-center items-center h-screen bg-white"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <span className="sr-only">Carregando...</span>

      <div className="flex gap-2">
        {dotColors.map((color, index) => (
          <Motion.span
            key={index}
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
