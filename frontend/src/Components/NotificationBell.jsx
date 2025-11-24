// src/components/NotificationBell.jsx
"use client";
import { useEffect, useRef, useState, useContext, useMemo, useCallback } from "react";
import { ShopContext } from "../Context/ShopContext";
import { motion as Motion, AnimatePresence } from "framer-motion";

/* -------------------------------- Utils -------------------------------- */
const timeAgo = (iso) => {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("pt-BR");
};

const decodeJwtName = (token) => {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload));
    return json?.name || json?.user?.name || json?.userName || json?.email || "";
  } catch {
    return "";
  }
};
const firstNameOf = (val = "") => {
  if (!val) return "";
  if (val.includes("@")) return val.split("@")[0];
  return String(val).trim().split(/\s+/)[0] || "";
};
const personalizeLocal = (text = "", nameCandidate = "") => {
  const first = firstNameOf(nameCandidate) || "você";
  return String(text)
    .replace(/\{first_name\}/gi, first)
    .replace(/\{name\}/gi, nameCandidate || first);
};

/* ----------------------------- Icones inline ---------------------------- */
const IconBell = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2V8z" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IconArrowUpRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

/* ---------------------- Painel interno (mobile/desktop) --------------------- */
function PanelInner({
  unread,
  tab,
  setTab,
  loading,
  filtered,
  onMarkAll,
  onItemOpen,
  onMarkRead,
  onDeleteOne,
  isMobile,
  onClose,
  currentName,
}) {
  return (
    <div className={`flex h-full flex-col ${isMobile ? "rounded-t-3xl" : "rounded-3xl"}`}>
      {/* Header */}
      <div
        className={[
          "sticky top-0 z-10 border-b border-gray-200",
          "bg-gradient-to-r from-white to-gray-50/70",
          "backdrop-blur supports-[backdrop-filter]:bg-white/80",
          isMobile ? "px-5 pt-3 pb-2 rounded-t-3xl" : "px-5 py-4 rounded-t-3xl",
        ].join(" ")}
      >
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-black text-white flex-shrink-0">
                <IconBell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-none truncate">Notificações</div>
                <div className="text-xs text-gray-500 leading-none mt-1">
                  {unread} não lida{unread === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="inline-flex p-0.5 rounded-xl bg-gray-100">
                <button
                  onClick={() => setTab("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    tab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTab("unread")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    tab === "unread" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Não lidas
                </button>
              </div>

              {isMobile && (
                <button
                  onClick={onClose}
                  className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  aria-label="Fechar notificações"
                >
                  <IconX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="mt-3 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 px-2 py-2 overflow-y-auto no-scrollbar ${isMobile ? "pb-2" : ""}`}>
        <div className="mx-auto max-w-[820px]">
          {loading ? (
            <div className="p-5 text-sm text-gray-600">Carregando…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-100 grid place-items-center">
                <IconCheck className="w-6 h-6 text-gray-400" />
              </div>
              <div className="mt-3 text-sm font-medium text-gray-900">Tudo lido por aqui</div>
              <div className="mt-1 text-xs text-gray-500">Você verá novidades e ofertas aqui.</div>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((n) => {
                const isUnread = !n.readAt;
                const thumb = n.product?.image?.[0] || null;
                const displayBody = personalizeLocal(n.body || "", currentName);

                return (
                  <Motion.li
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`group rounded-2xl border px-4 py-3 transition ${
                      isUnread ? "border-emerald-200/70 bg-emerald-50/70 hover:bg-emerald-50" : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className={`flex ${isMobile ? "flex-col gap-3" : "items-start gap-3"}`}>
                      {/* Thumb/Icon */}
                      <div
                        className={`relative ${isMobile ? "h-12 w-12" : "h-11 w-11"} rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 grid place-items-center`}
                      >
                        {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <IconBell className="w-5 h-5 text-gray-500" />}
                        {isUnread && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />}
                      </div>

                      {/* Content + actions */}
                      <div className="min-w-0 flex-1">
                        <div className={`flex ${isMobile ? "flex-col gap-2" : "items-start justify-between gap-3"}`}>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 truncate">{n.title}</div>
                              <div className="text-[11px] text-gray-500">{timeAgo(n.createdAt)}</div>
                            </div>
                            <div className={`${isMobile ? "text-sm" : "text-[13px]"} text-gray-700 mt-1 line-clamp-3`}>{displayBody}</div>
                            {n.product?.name && <div className="mt-1 text-[11px] text-gray-500">Produto: {n.product.name}</div>}
                          </div>

                          {/* Ações */}
                          <div className={`${isMobile ? "mt-1 flex items-center gap-2" : "flex flex-col gap-1 items-end"}`}>
                            {n.link && (
                              <button
                                onClick={() => onItemOpen(n)}
                                className={`inline-flex items-center gap-1 ${
                                  isMobile ? "text-xs px-3 py-1.5" : "text-xs px-2 py-1"
                                } rounded-md bg-black text-white hover:bg-gray-900`}
                                title="Abrir"
                              >
                                <IconArrowUpRight className="w-3.5 h-3.5" />
                                Abrir
                              </button>
                            )}
                            <button
                              onClick={() => onMarkRead(n._id)}
                              disabled={!isUnread}
                              className={`inline-flex items-center gap-1 ${
                                isMobile ? "text-xs px-3 py-1.5" : "text-xs px-2 py-1"
                              } rounded-md border transition ${
                                isUnread ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : "border-gray-300 text-gray-500 cursor-default"
                              }`}
                              title="Marcar como lida"
                            >
                              <IconCheck className="w-3.5 h-3.5" />
                              Lida
                            </button>
                            <button
                              onClick={() => onDeleteOne(n._id)}
                              className={`inline-flex items-center gap-1 ${
                                isMobile ? "text-xs px-3 py-1.5" : "text-xs px-2 py-1"
                              } rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50`}
                              title="Limpar"
                            >
                              <IconX className="w-3.5 h-3.5" />
                              Limpar
                            </button>
                          </div>
                        </div>

                        {/* CTA secundário */}
                        {n.link && (
                          <button onClick={() => onItemOpen(n)} className="mt-2 inline-flex items-center gap-1 text-[12px] text-gray-700 hover:text-gray-900">
                            Ver detalhes
                            <IconArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 ${
          isMobile ? "px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]" : "px-5 py-3"
        } ${isMobile ? "rounded-b-none" : "rounded-b-3xl"}`}
      >
        <div className="mx-auto max-w-[820px] flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {filtered.length} {tab === "unread" ? "notificação(ões) não lida(s)" : "notificação(ões)"}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onMarkAll} className="inline-flex text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
              Marcar todas como lidas
            </button>
            {isMobile && (
              <button onClick={onClose} className="inline-flex text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .line-clamp-3{-webkit-line-clamp:3;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
        .no-scrollbar::-webkit-scrollbar{width:0;height:0}
        .no-scrollbar{scrollbar-width:none}
      `}</style>
    </div>
  );
}

/* ------------------------------- Componente ------------------------------ */
export default function NotificationBell({ variant = "icon", className = "" }) {
  const { backendUrl, isLoggedIn, user } = useContext(ShopContext);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [emphasize, setEmphasize] = useState(false); // destaque quando vem do e-mail

  const ref = useRef(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}`, token } : {}),
    [token]
  );

  // Nome do usuário (para personalizar {name} na UI também)
  const localName =
    user?.name ||
    (typeof window !== "undefined" ? localStorage.getItem("userName") : "") ||
    (token ? decodeJwtName(token) : "") ||
    "";

  const filtered = useMemo(() => (tab === "unread" ? items.filter((n) => !n.readAt) : items), [items, tab]);

  // Carrega notificações (com fallback para contar "unread" localmente)
  const load = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);

      // Busca lista primeiro (permite computar unread mesmo se o endpoint de count mudar)
      const listRes = await fetch(`${backendUrl}/api/notification?limit=40`, { headers });
      const lst = await listRes.json();

      if (lst?.success) {
        const it = Array.isArray(lst.items) ? lst.items : [];
        setItems(it);
        setUnread(it.filter((n) => !n.readAt).length);
      }

      // Tenta endpoint de contagem (se existir/habilitado no backend)
      try {
        const cntRes = await fetch(`${backendUrl}/api/notification/unread-count`, { headers });
        const cnt = await cntRes.json();
        if (cnt?.success && typeof cnt.count === "number") {
          setUnread(cnt.count);
        }
      } catch {
        /* ignore endpoint ausente */
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, backendUrl, headers]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto refresh eventual + quando volta ao foco
  useEffect(() => {
    const iv = setInterval(load, 30000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  // Fechar ao clicar fora / tecla ESC
  useEffect(() => {
    const onClick = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Destacar quando chega de e-mail (UTM ou nid)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const fromEmail = sp.get("utm_medium") === "notification" || sp.has("nid") || sp.get("utm_source") === "email";
    const storedHint = sessionStorage.getItem("notif:hint") === "1";

    if (fromEmail) sessionStorage.setItem("notif:hint", "1");

    if (fromEmail || storedHint) {
      setEmphasize(true);
      // Tenta carregar na hora (e abrir se já estiver logado)
      load().then(() => {
        if (isLoggedIn) {
          setOpen(true);
          // remove “hint” após abrir
          sessionStorage.removeItem("notif:hint");
        }
      });
      // remove destaque após alguns segundos
      const t = setTimeout(() => setEmphasize(false), 8000);
      return () => clearTimeout(t);
    }
  }, [isLoggedIn]); // eslint-disable-line

  const markRead = async (id) => {
    try {
      await fetch(`${backendUrl}/api/notification/${id}/read`, { method: "PATCH", headers });
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    try {
      await fetch(`${backendUrl}/api/notification/read-all`, { method: "PATCH", headers });
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnread(0);
      setTab("all");
    } catch {
      /* ignore */
    }
  };

  const removeLocal = (id) => setItems((prev) => prev.filter((n) => n._id !== id));

  const deleteOne = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/notification/${id}`, { method: "DELETE", headers });
      if (res.ok) return removeLocal(id);
      await markRead(id);
      removeLocal(id);
    } catch {
      await markRead(id);
      removeLocal(id);
    }
  };

  // Abre link com tracking de clique no backend (inclui UTM se faltar)
  const onItemOpen = async (n) => {
    if (!n.readAt) await markRead(n._id);
    if (n.link) {
      const trackUrl = `${backendUrl}/api/notification/t/c?nid=${encodeURIComponent(n._id)}&url=${encodeURIComponent(n.link)}`;
      window.open(trackUrl, "_blank", "noopener");
    }
  };

  if (!isLoggedIn) return null;

  const iconBtnBase =
    variant === "icon"
      ? "relative inline-grid place-items-center w-6 h-6 text-gray-800 hover:text-gray-900"
      : "relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50";

  const showTempDot = emphasize && unread === 0; // mostra ponto mesmo antes do fetch
  const badgeCount = unread > 0 ? (unread > 9 ? "9+" : String(unread)) : "";

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger */}
      <button onClick={() => setOpen((v) => !v)} className={iconBtnBase} aria-label="Notificações">
        <div className="relative">
          <IconBell className={`w-6 h-6 ${emphasize ? "animate-bounce" : ""}`} />
          {(unread > 0 || showTempDot) && (
            <>
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] leading-[16px] text-[10px] text-center bg-red-600 text-white rounded-full px-1">
                {badgeCount || "•"}
              </span>
              {emphasize && <span className="absolute -top-1.5 -right-1.5 inline-flex h-[16px] w-[16px] rounded-full animate-ping bg-red-600/60" />}
            </>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* MOBILE: backdrop */}
            <Motion.div
              className="fixed inset-0 z-[60] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ background: "rgba(0,0,0,0.45)" }}
            />
            {/* MOBILE: sheet */}
            <Motion.div
              role="dialog"
              aria-modal="true"
              className="fixed inset-x-0 bottom-0 top-[20vh] sm:hidden z-[61] rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.25)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <PanelInner
                unread={unread}
                tab={tab}
                setTab={setTab}
                loading={loading}
                filtered={filtered}
                onMarkAll={markAll}
                onItemOpen={onItemOpen}
                onMarkRead={markRead}
                onDeleteOne={deleteOne}
                isMobile
                onClose={() => setOpen(false)}
                currentName={localName}
              />
            </Motion.div>

            {/* DESKTOP/TABLET: popover */}
            <Motion.div
              role="dialog"
              aria-modal="true"
              className="absolute right-0 mt-3 hidden sm:block w-[min(92vw,560px)] lg:w-[520px] max-h-[75vh] overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] z-50"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <PanelInner
                unread={unread}
                tab={tab}
                setTab={setTab}
                loading={loading}
                filtered={filtered}
                onMarkAll={markAll}
                onItemOpen={onItemOpen}
                onMarkRead={markRead}
                onDeleteOne={deleteOne}
                isMobile={false}
                onClose={() => setOpen(false)}
                currentName={localName}
              />
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar{width:0;height:0}
        .no-scrollbar{scrollbar-width:none}
      `}</style>
    </div>
  );
}
