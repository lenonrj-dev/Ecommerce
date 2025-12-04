import { useContext, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ShopContext } from "../Context/ShopContext";
import ProductItem from "../Components/ProductItem";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  },
});

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scenario = location.state?.scenario || "return";
  const { products = [], user } = useContext(ShopContext);

  const firstName = useMemo(() => {
    const raw = user?.name || "";
    if (!raw) return "bem-vinda(o)";
    return raw.split(/\s+/)[0];
  }, [user]);

  const curated = useMemo(() => {
    if (!products.length) return [];
    const bestsellers = products.filter((p) => p.bestseller);
    const source = bestsellers.length ? bestsellers : products;
    return source.slice(0, 4);
  }, [products]);

  const title =
    scenario === "new"
      ? `${firstName}, seu acesso está liberado!`
      : `Bem-vinda(o) de volta, ${firstName}!`;
  const subtitle =
    scenario === "new"
      ? "Agora você pode acompanhar pedidos, salvar favoritos e receber ofertas personalizadas. Escolha o próximo passo para continuar sua experiência."
      : "Ficamos felizes em ter você aqui novamente. Continue de onde parou ou revise suas informações para aproveitar ao máximo sua experiência.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/60 to-white px-4 sm:px-8 lg:px-14 py-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero */}
        <Motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp()}
          className="rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,153,102,0.15),_transparent_55%)]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 p-8 lg:p-12">
            <div className="space-y-6">
              <Motion.div variants={fadeUp(0.1)} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="text-base">✨</span>
                Conta criada com sucesso
              </Motion.div>
              <Motion.h1
                variants={fadeUp(0.2)}
                className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug"
              >
                {title}
              </Motion.h1>
              <Motion.p
                variants={fadeUp(0.3)}
                className="text-gray-600 text-lg leading-relaxed"
              >
                {subtitle}
              </Motion.p>
              <Motion.div
                variants={fadeUp(0.4)}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold shadow-lg hover:bg-gray-800 transition"
                >
                  {scenario === "new" ? "Completar perfil" : "Ir para o painel"}
                </button>
                <Link
                  to="/outlet"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-800 hover:bg-gray-50 transition text-center"
                >
                  {scenario === "new" ? "Continuar comprando" : "Voltar aos produtos"}
                </Link>
              </Motion.div>
              <Motion.ul
                variants={fadeUp(0.5)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600"
              >
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 text-lg">•</span>
                  Acesso rápido aos seus favoritos e endereços salvos.
                </li>
                {scenario === "new" ? (
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 text-lg">•</span>
                    Receba recomendações baseadas no seu estilo.
                  </li>
                ) : (
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-500 text-lg">•</span>
                    Retome seus favoritos e últimos itens consultados.
                  </li>
                )}
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 text-lg">•</span>
                  Promoções exclusivas direto no painel e notificações.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-emerald-500 text-lg">•</span>
                  Histórico de pedidos com rastreamento simplificado.
                </li>
              </Motion.ul>
            </div>

            <Motion.div
              variants={fadeUp(0.6)}
              className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 overflow-hidden"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-300">
                Experiência Marima
              </p>
              <h2 className="text-2xl font-semibold mt-4">
                Tudo o que você precisa em um só lugar
              </h2>
              <p className="text-gray-300 mt-3 leading-relaxed">
                Preparamos uma curadoria especial com os lançamentos e best-sellers para você experimentar o conforto e a tecnologia dos nossos tecidos.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 text-xs">
                {["Fit Premium", "Envio Rápido", "Garantia de troca"].map((label) => (
                  <span
                    key={label}
                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="absolute -bottom-16 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </Motion.div>
          </div>
        </Motion.section>

        {/* Recomendações */}
        <Motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp(0.2)}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-600">Sugestões para você</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {scenario === "new" ? "Continue explorando" : "Recomece em grande estilo"}
              </h3>
              <p className="text-gray-500">
                Selecionamos algumas peças que combinam com o seu estilo.
              </p>
            </div>
            <Link
              to="/outlet"
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>

          {curated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Carregando sugestões personalizadas...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {curated.map((item) => (
                <Motion.div
                  key={item._id}
                  variants={fadeUp(0.3)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <ProductItem product={item} />
                </Motion.div>
              ))}
            </div>
          )}
        </Motion.section>
      </div>
    </div>
  );
};

export default Welcome;
