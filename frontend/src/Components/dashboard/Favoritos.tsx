import { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import { Link } from "react-router-dom";
import HeartButton from "../ui/HeartButton";

const currencyBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

function SkeletonCard() {
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-white">
      <div className="w-full aspect-[3/4] bg-zinc-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-zinc-100 rounded animate-pulse" />
        <div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function Favoritos() {
  const { favorites, loadFavorites, isLoggedIn } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);

  // carrega ao abrir a aba (somente logado)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isLoggedIn || !loadFavorites) return;
      try {
        setLoading(true);
        await Promise.resolve(loadFavorites());
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isLoggedIn, loadFavorites]);

  // normaliza itens e evita duplicados por _id
  const items = useMemo(() => {
    const arr = Array.isArray(favorites) ? favorites : [];
    const seen = new Set();
    return arr.filter((p) => {
      const id = p?._id || p?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [favorites]);

  if (loading && (!items || items.length === 0)) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Favoritos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Favoritos</h2>
        <p className="text-gray-600 mb-3">Você ainda não possui itens favoritos.</p>
        <Link
          to="/fitness"
          className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Favoritos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => {
          const img =
            p.image?.[0] ||
            p.image1 ||
            p.images?.[0] ||
            p.thumbnail ||
            "";
          const category = p.category || "Coleção";
          const price = currencyBRL(p.price);

          return (
            <Link
              key={p._id || p.id}
              to={`/product/${p._id || p.id}`}
              className="relative bg-white rounded-xl overflow-hidden border border-zinc-200 hover:border-zinc-400 transition"
            >
              <div className="relative w-full aspect-[3/4] bg-zinc-50">
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-zinc-400">
                    sem imagem
                  </div>
                )}
                <HeartButton product={p} />
              </div>

              <div className="p-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">{category}</div>
                <div className="font-medium leading-snug line-clamp-2">{p.name}</div>
                <div className="mt-1 font-semibold">{price}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
