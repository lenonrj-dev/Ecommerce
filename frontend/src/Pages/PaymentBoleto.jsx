// src/pages/PaymentBoleto.jsx
import { useContext, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { FileText, ArrowRight, Timer, ShieldCheck } from "lucide-react";
import { ShopContext } from "../Context/ShopContext";
import Title from "../Components/Title";

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: d },
});

const PaymentBoleto = () => {
  const { backendUrl, user, isLoggedIn } = useContext(ShopContext);

  // Dispara o e-mail de pós-checkout (boleto gerado)
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    const url = `${backendUrl}/api/post-checkout/notify`;
    const body = JSON.stringify({
      type: "boleto",
      email: user.email,
      name: user?.name,
      ctaUrl: window.location.origin, // link da loja
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [backendUrl, isLoggedIn, user]);

  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-10 lg:px-20 py-12">
        <Motion.div {...fadeUp(0.05)} className="text-center">
          <Title text1="PEDIDO" text2="RECEBIDO" />
          <p className="mt-3 text-neutral-600 max-w-2xl mx-auto">
            Seu <strong>boleto foi gerado</strong>. Assim que o pagamento for
            compensado, enviaremos a confirmação para o seu e-mail.
          </p>
        </Motion.div>

        <Motion.div
          {...fadeUp(0.1)}
          className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-50 text-amber-700 p-2">
                  <FileText className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Boleto gerado • aguardando compensação
                </h2>
              </div>

              <div className="mt-4 text-neutral-700 space-y-3">
                <p>
                  O reconhecimento do pagamento pode levar até{" "}
                  <strong>2 dias úteis</strong>, dependendo do banco. Você será
                  notificado por e-mail quando a confirmação ocorrer.
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Timer className="h-4 w-4" />
                  Prazo de compensação do banco.
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <ShieldCheck className="h-4 w-4" />
                  Seus dados e pedido estão seguros com a Marima.
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 active:translate-y-[1px]"
                >
                  Voltar à loja <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/contato"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-900/15 px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 active:translate-y-[1px]"
                >
                  Precisa de ajuda?
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-neutral-900 p-1.5">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold">Importante</p>
              </div>
              <p className="mt-2 text-sm text-neutral-700">
                Caso tenha fechado a página do boleto, você pode gerar novamente
                pelo seu banco/checkout. Se precisar, fale com nosso suporte.
              </p>
            </div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default PaymentBoleto;
