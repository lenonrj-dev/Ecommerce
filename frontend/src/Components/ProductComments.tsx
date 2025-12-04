"use client";
import { useCallback, useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Star = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={filled ? "fill-yellow-400" : "fill-gray-300"}>
    <path d="M12 .587l3.668 7.431 8.207 1.193-5.938 5.79 1.402 8.168L12 18.896l-7.339 3.873 1.402-8.168L.125 9.211l8.207-1.193z"/>
  </svg>
);
const RatingStars = ({ value = 0 }) => {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${v} de 5`}>
      {[1,2,3,4,5].map(i => <Star key={i} filled={i <= v} />)}
    </div>
  );
};

const initials = (name = "") => name.trim().split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase()).join("");
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return ""; } };

export default function ProductComments({ productId, backendUrl, isLoggedIn }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const fetchComments = useCallback(async (limit = 50) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/comment/${productId}?limit=${limit}`);
      const data = await res.json();
      if (data?.success) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, productId]);

  useEffect(() => {
    if (productId && backendUrl) fetchComments(50);
  }, [productId, backendUrl, fetchComments]);

  const onWrite = () => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    setOpenForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      rating: Number(fd.get("rating")),
      content: String(fd.get("content") || "").trim(),
    };
    if (!payload.rating) return;
    const res = await fetch(`${backendUrl}/api/comment/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.success) {
      setOpenForm(false);
      await fetchComments(50);
    } else {
      alert(data?.message || "Não foi possível salvar sua avaliação.");
    }
  };

  return (
    <section id="reviews" className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-semibold tracking-tight">Avaliações</h3>
        <button onClick={onWrite} className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">Escrever avaliação</button>
      </div>

      <div className="relative">
        <div
          className="review-scroll overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory pr-1 -mr-1 rounded-xl bg-white max-h-[220px] md:max-h-[240px]"
          role="list"
          aria-label="Lista de avaliações"
        >
          {loading && (
            <div className="p-4 space-y-3">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="p-4 text-sm text-gray-600">Ainda não há avaliações. Seja o primeiro a avaliar!</p>
          )}

          {!loading && items.map((c) => (
            <div key={c._id} className="snap-start">
              <div className="px-4 py-4 border-b last:border-b-0 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center font-semibold">{initials(c?.user?.name || "U")}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium truncate max-w-[140px]">{c?.user?.name || "Usuário"}</span>
                      <RatingStars value={c.rating} />
                      <span className="text-xs text-gray-500">· {fmtDate(c.createdAt)}</span>
                      {c.verified && (
                        <span className="ml-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          verificada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {c.content && <p className="text-sm text-gray-700 leading-relaxed mt-2">{c.content}</p>}

                {c.reply?.content ? (
                  <div className="mt-3 ml-4 pl-3 border-l-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-black text-white grid place-items-center text-[10px] font-semibold">M</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {c.reply.author || "Marima Oficial"}
                        <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-gray-900 text-white">Resposta oficial</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mt-2">{c.reply.content}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {items.length > 2 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 rounded-b-xl bg-gradient-to-t from-white via-white/95 to-transparent" />
        )}
      </div>

      <AnimatePresence>
        {openForm && (
          <Motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenForm(false)} />
            <Motion.form
              onSubmit={handleSubmit}
              className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Escreva sua avaliação</h3>
                <button type="button" onClick={() => setOpenForm(false)} className="rounded-md px-2 py-1 text-sm hover:bg-gray-100">Fechar</button>
              </div>

              <label className="block text-sm font-medium mb-1">Sua nota</label>
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map((n) => (
                  <label key={n} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="rating" value={n} className="accent-black" required />
                    <span className="text-sm">{n}</span>
                  </label>
                ))}
              </div>

              <label className="block text-sm font-medium mb-1">Comentário</label>
              <textarea name="content" className="w-full rounded-md border px-3 py-2 h-28 mb-4" placeholder="Conte como foi sua experiência" minLength={8} maxLength={2000} required />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpenForm(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">Enviar</button>
              </div>
            </Motion.form>
          </Motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .review-scroll{ scrollbar-width:none; -ms-overflow-style:none; }
        .review-scroll::-webkit-scrollbar{ width:0; height:0; }
      `}</style>
    </section>
  );
}
