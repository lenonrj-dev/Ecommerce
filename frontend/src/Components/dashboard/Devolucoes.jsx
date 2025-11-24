import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { RefreshCcw, HelpCircle, Truck } from "lucide-react";

export default function Devolucoes() {
  // Variantes para animações em cascata
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <Motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white min-h-[70vh] text-gray-800"
    >
      {/* SEO-friendly heading */}
      <Motion.h1
        variants={itemVariants}
        className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4"
      >
        Política de Devoluções & Trocas
      </Motion.h1>

      <Motion.p
        variants={itemVariants}
        className="text-gray-600 max-w-2xl text-center mb-8 leading-relaxed text-base sm:text-lg"
      >
        Priorizamos a{" "}
        <span className="font-semibold text-gray-900">
          satisfação e confiança
        </span>{" "}
        dos nossos clientes. Caso precise devolver ou trocar um produto, nosso
        time está preparado para oferecer uma experiência{" "}
        <span className="font-medium">ágil, segura e transparente</span>.
      </Motion.p>

      {/* Etapas do processo */}
      <Motion.div
        variants={itemVariants}
        className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Como funciona o processo:
        </h2>
        <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
          <li className="flex gap-3 items-start">
            <HelpCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span>
              Entre em contato com nosso{" "}
              <span className="font-semibold">suporte oficial</span>, informando
              o motivo da devolução ou troca.
            </span>
          </li>
          <li className="flex gap-3 items-start">
            <Truck className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span>
              Nossa equipe irá avaliar seu caso e indicar a{" "}
              <span className="font-semibold">melhor opção de envio</span> para
              o produto.
            </span>
          </li>
          <li className="flex gap-3 items-start">
            <RefreshCcw className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <span>
              Após o recebimento, o item será analisado e você receberá a{" "}
              <span className="font-semibold">
                aprovação para devolução ou troca
              </span>{" "}
              conforme nossa política.
            </span>
          </li>
        </ul>
      </Motion.div>

      {/* Botão principal */}
      <Motion.div
        variants={itemVariants}
        className="mt-10 flex flex-col items-center"
      >
        <Link
          to="/entrega"
          aria-label="Acessar política de entrega e prazos"
          className="inline-block bg-black hover:bg-gray-800 text-white font-medium px-7 py-3 rounded-full shadow-md transition-all duration-300"
        >
          Consulte nossa Política de Entrega
        </Link>
        <p className="mt-4 text-sm text-gray-500 max-w-md text-center">
          Ao prosseguir, você confirma que leu e concorda com nossas condições
          de devolução e troca.
        </p>
      </Motion.div>
    </Motion.section>
  );
}
