import { useContext, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import Title from "./Title";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopContext } from "../Context/ShopContext";

/**
 * Newsletter exibida apenas para usuários NÃO logados.
 * Detecta autenticação por:
 * - ShopContext: token | user
 * - localStorage: token | authToken
 * - cookies: "token="
 */
const NewsLetterBox = () => {
  const shop = useContext(ShopContext);

  const isLoggedIn = useMemo(() => {
    const ctxToken = shop?.token || shop?.authToken;
    const ctxUser = shop?.user || shop?.currentUser;

    // localStorage (projetos Vite/SPA geralmente têm)
    let lsToken = null;
    try {
      lsToken =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("authToken")
          : null;
    } catch {
      /* ignore */
    }

    // cookies (fallback leve)
    const hasCookieToken =
      typeof document !== "undefined" &&
      /(^|;\s*)token=/.test(document.cookie || "");

    return Boolean(ctxToken || ctxUser || lsToken || hasCookieToken);
  }, [shop]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    // aqui você pode integrar com sua API de newsletter se quiser
    toast.success("Inscrição realizada com sucesso!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      style: {
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        fontSize: "0.95rem",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "12px 20px",
      },
    });
  };

  // Se o usuário estiver logado, não renderiza a seção
  if (isLoggedIn) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center px-4 sm:px-8 py-16 bg-white"
    >
      <Title text2="Se Inscreva e Ganhe Desconto na Sua Primeira Compra!" />
      <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-xl mx-auto">
        Fique por dentro das novidades e receba promoções exclusivas em primeira mão!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4"
        aria-label="Formulário de inscrição na newsletter"
      >
        <input
          type="email"
          name="email"
          placeholder="Digite seu e-mail"
          required
          className="flex-1 w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none transition-all duration-200 text-sm sm:text-base"
          aria-label="E-mail"
        />
        <Motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className="bg-black text-white px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium transition duration-300"
        >
          Continuar
        </Motion.button>
      </form>

      {/* Caso você já tenha um ToastContainer global, pode remover este */}
      <ToastContainer />
    </Motion.div>
  );
};

export default NewsLetterBox;
