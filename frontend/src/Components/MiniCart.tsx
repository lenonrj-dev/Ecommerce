import { useContext, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { ShopContext } from "../Context/ShopContext";
import { getProductUrl } from "../utils/productUrl";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const MiniCart = ({ open, onClose }) => {
  const {
    cartItems,
    cartCount,
    cartSummary,
    removeFromCart,
    updateCartItemQuantity,
    getCartRecommendations,
    addToCart,
  } = useContext(ShopContext);

  const recommendations = useMemo(
    () => getCartRecommendations(3),
    [getCartRecommendations]
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Motion.aside
            className="fixed inset-y-0 right-0 z-[1001] w-full max-w-lg overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            aria-label="Mini carrinho Marima"
          >
            <div className="flex h-full flex-col bg-white shadow-2xl ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-neutral-400">
                    Sua sacola
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <h2 className="text-2xl font-semibold text-neutral-900">
                      {cartCount} {cartCount === 1 ? "item" : "itens"}
                    </h2>
                    <span className="text-sm text-neutral-500">
                      {cartItems.length > 0 && "Pronto para finalizar"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                  aria-label="Fechar mini carrinho"
                >
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {cartItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-neutral-500">
                    <ShoppingBag className="mb-3 h-8 w-8 text-neutral-300" />
                    Sua sacola está vazia. Explore nossos lançamentos e adicione
                    seus favoritos.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.uid}
                        className="flex gap-4 rounded-2xl border border-neutral-100 p-3 shadow-sm transition hover:border-neutral-200"
                      >
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className="block h-24 w-24 flex-none overflow-hidden rounded-2xl bg-neutral-100"
                        >
                          <img
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                to={item.href}
                                onClick={onClose}
                                className="text-sm font-semibold text-neutral-900 hover:underline"
                              >
                                {item.name}
                              </Link>
                              <div className="mt-1 space-y-1 text-xs text-neutral-500">
                                {item.size && <p>Tamanho: {item.size}</p>}
                                <p>
                                  Pix: {" "}
                                  <span className="font-semibold text-neutral-800">
                                    {formatCurrency(item.pixPrice)}
                                  </span>
                                </p>
                                <p>
                                  Cartão: {item.installments?.quantity || 12}x {" "}
                                  {formatCurrency(item.installments?.value || item.price)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.uid)}
                              className="rounded-full border border-transparent p-1 text-neutral-400 transition hover:border-neutral-200 hover:text-neutral-800"
                              aria-label={`Remover ${item.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.uid, -1)}
                                className="px-3 py-1 text-neutral-600 transition hover:text-neutral-900"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-[32px] text-center text-neutral-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.uid, 1)}
                                className="px-3 py-1 text-neutral-600 transition hover:text-neutral-900"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {item.yampiLink && (
                                <a
                                  href={item.yampiLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-full border border-neutral-900 px-3 py-1 font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                                  onClick={onClose}
                                >
                                  Comprar agora
                                </a>
                              )}
                              <Link
                                to={item.href}
                                onClick={onClose}
                                className="rounded-full border border-neutral-200 px-3 py-1 font-semibold text-neutral-700 transition hover:bg-neutral-50"
                              >
                                Ver detalhes
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dashed px-6 py-4">
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>Total no Pix</span>
                  <strong className="text-xl text-neutral-900">
                    {formatCurrency(cartSummary.pixTotal)}
                  </strong>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  ou {cartSummary.installmentQty}x de {" "}
                  <strong>{formatCurrency(cartSummary.installmentValue)}</strong>{" "}
                  sem juros
                </p>
                <p className="mt-3 text-[11px] text-neutral-500">
                  Finalize cada item pelo botão “Comprar agora”. Mantemos a sacola
                  salva para você continuar explorando.
                </p>
              </div>

              {recommendations.length > 0 && (
                <div className="border-t px-6 py-5">
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-neutral-400">
                      Combine com
                    </p>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Complete seu look
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((product) => {
                      const productUrl = getProductUrl(product);
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-3"
                        >
                          <Link
                            to={productUrl}
                            onClick={onClose}
                            className="block h-16 w-16 overflow-hidden rounded-xl bg-neutral-100"
                          >
                            <img
                              src={product.image?.[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </Link>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatCurrency(product.pixPrice)} no Pix
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                className="rounded-full border border-neutral-900 px-3 py-1 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                              >
                                Adicionar
                              </button>
                              <Link
                                to={productUrl}
                                onClick={onClose}
                                className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                              >
                                Ver
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MiniCart;
