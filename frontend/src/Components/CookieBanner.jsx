// frontend/src/Components/CookieBanner.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import { ShopContext } from "../Context/ShopContext";

const STORAGE_KEY = "cookieConsentAccepted"; // "true" quando aceito

export default function CookieBanner() {
  const { token: ctxToken } = useContext(ShopContext) || {};
  const [open, setOpen] = useState(false);
  const acceptBtnRef = useRef(null);
  const reduce = useReducedMotion();

  // decide se deve exibir
  useEffect(() => {
    try {
      const isLoggedIn =
        !!ctxToken || !!localStorage.getItem("token"); // fallback
      const alreadyAccepted = localStorage.getItem(STORAGE_KEY) === "true";

      // só mostra se NÃO estiver logado e ainda não tiver aceitado
      setOpen(!isLoggedIn && !alreadyAccepted);
    } catch {
      // fallback seguro: se algo der errado, mostra
      setOpen(true);
    }
  }, [ctxToken]);

  useEffect(() => {
    if (open) acceptBtnRef.current?.focus();
  }, [open]);

  const close = () => setOpen(false);
  const onKeyDown = (e) => e.key === "Escape" && close();

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.error("Erro ao salvar consentimento de cookies:", error);
    }
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          key="cookie-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
          onKeyDown={onKeyDown}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg"
          initial={{ y: reduce ? 0 : 16, opacity: reduce ? 1 : 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 12, opacity: reduce ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <div className="relative rounded-xl border border-neutral-900/15 bg-white shadow-md px-3.5 py-3 sm:px-4 sm:py-3.5">
            {/* X fecha apenas esta visita; não grava aceite */}
            <button
              type="button"
              onClick={close}
              className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-900/15 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer"
              aria-label="Fechar aviso de cookies"
            >
              ×
            </button>

            <div className="flex flex-col gap-2 pr-8">
              <h2
                id="cookie-title"
                className="text-sm font-semibold tracking-tight text-black sm:text-[15px]"
              >
                Este site usa cookies
              </h2>

              <p
                id="cookie-desc"
                className="text-xs leading-relaxed text-neutral-800 sm:text-sm"
              >
                Utilizamos cookies para melhorar sua experiência e analisar o
                tráfego. Consulte nossas políticas de{" "}
                <Link
                  to="/entrega"
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  Entrega
                </Link>{" "}
                e{" "}
                <Link
                  to="/privacidade"
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  Privacidade
                </Link>
                .
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                <button
                  ref={acceptBtnRef}
                  type="button"
                  onClick={accept}
                  className="inline-flex items-center justify-center rounded-lg border border-black bg-black px-3.5 py-2 text-xs font-bold text-white cursor-pointer hover:opacity-90"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-900/20 bg-white px-3.5 py-2 text-xs font-semibold text-black cursor-pointer hover:bg-neutral-100"
                >
                  Recusar
                </button>
              </div>
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
