import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";

function HeartIcon({ filled }) {
  return filled ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 21s-6.716-4.39-9.193-7.218C.986 11.745 1.088 8.6 3.343 6.68c2.08-1.79 5.19-1.39 6.942.642L12 8.17l1.715-1.848c1.753-2.032 4.863-2.432 6.943-.642 2.255 1.92 2.357 5.065.536 7.102C18.716 16.61 12 21 12 21z"
      />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12.001 20.727S5.58 16.23 3.2 13.497C1.07 11.06 1.27 7.79 3.6 5.79c1.87-1.6 4.71-1.3 6.39.6l2.01 2.21 2.01-2.21c1.68-1.9 4.52-2.2 6.39-.6 2.33 2 2.53 5.27.4 7.71-2.38 2.73-8.799 7.23-8.799 7.23zM8.07 6.5c-.76 0-1.52.26-2.12.77-1.41 1.21-1.5 3.21-.21 4.68 1.63 1.87 5.55 4.88 6.26 5.41.72-.54 4.63-3.55 6.26-5.41 1.29-1.47 1.2-3.47-.21-4.68-1.29-1.1-3.2-.9-4.27.46L12 9.36l-1.78-2.03c-.78-.94-1.9-1.43-3.15-1.43z"
      />
    </svg>
  );
}

export default function HeartButton({
  product,
  className = "",
  stopPropagation = true,
}) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLoggedIn } = useContext(ShopContext);
  const [pending, setPending] = useState(false);

  // normaliza id e nome para acessibilidade
  const { id, name } = useMemo(() => {
    if (!product) return { id: undefined, name: "" };
    if (typeof product === "string") return { id: product, name: "" };
    return { id: product._id || product.id, name: product.name || "" };
  }, [product]);

  const fav = isFavorite?.(id);

  const onClick = useCallback(
    async (e) => {
      if (stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!id) return;

      if (!isLoggedIn) {
        navigate("/login");
        return;
      }

      if (!toggleFavorite || pending) return;
      try {
        setPending(true);
        // suporta tanto função async quanto sync no contexto
        await Promise.resolve(toggleFavorite(product));
      } finally {
        setPending(false);
      }
    },
    [id, isLoggedIn, navigate, toggleFavorite, product, stopPropagation, pending]
  );

  const disabled = pending || !id;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-label={
        fav
          ? `Remover ${name || "produto"} dos favoritos`
          : `Adicionar ${name || "produto"} aos favoritos`
      }
      aria-pressed={!!fav}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-black/10 bg-white text-gray-900",
        fav ? "text-red-500" : "text-gray-900",
        "shadow-md hover:shadow-lg hover:bg-white/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
        "disabled:opacity-50 disabled:cursor-not-allowed transition",
        className,
      ].join(" ")}
    >
      <HeartIcon filled={!!fav} />
    </button>
  );
}
