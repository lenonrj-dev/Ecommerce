// src/pages/Notifications.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion as Motion, AnimatePresence } from "framer-motion";

/* ---------- Modal genérico ---------- */
function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <Motion.div
            className="relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                Fechar
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Helpers ---------- */
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null;
  return token ? { Authorization: `Bearer ${token}`, token } : {};
};
const fmt = (n) => (typeof n === "number" ? n.toLocaleString("pt-BR") : n || 0);

/* ---------- CTA sugerido (mesma lógica do backend) ---------- */
const smartCTA = (title = "", fallback = "Ver agora") => {
  const t = String(title).toLowerCase();
  if (t.includes("cupom") || t.includes("%") || t.includes("off")) return "Usar cupom agora";
  if (t.includes("outlet") || t.includes("últimas") || t.includes("ultimas")) return "Garantir no Outlet";
  if (t.includes("legging")) return "Ver leggings";
  if (t.includes("top")) return "Ver tops";
  if (t.includes("moletinho")) return "Ver moletinhos";
  if (t.includes("short")) return "Ver shorts";
  if (t.includes("frete")) return "Comprar com frete grátis";
  if (t.includes("carrinho")) return "Finalizar compra";
  if (t.includes("novidades") || t.includes("pré-venda") || t.includes("pre-venda")) return "Conferir novidades";
  return fallback;
};

/* ---------- Templates (10 focados em conversão, prontos p/ produção) ---------- */
const seedTemplates = [
  {
    title: "⚡ Cupom relâmpago: 10% OFF até 23:59",
    body:
      "Olá {first_name}, ganhe 10% OFF em qualquer peça usando o cupom AGORA10 no carrinho. Só hoje até 23:59. Corre!",
    type: "promo",
    icon: "sale",
    link: "https://www.usemarima.com",
    productId: "",
  },
  {
    title: "🔥 Últimas unidades no Outlet",
    body:
      "Estoque baixíssimo com preços abaixo do normal. Se você viu e gostou, garanta antes que acabe, {first_name}.",
    type: "promo",
    icon: "gift",
    link: "https://www.usemarima.com/outlet",
    productId: "",
  },
  {
    title: "✅ Combo Top + Legging com desconto imediato",
    body:
      "Monte seu combo (Top + Legging) e o desconto aplica automático no checkout. Performance e caimento impecáveis.",
    type: "promo",
    icon: "sale",
    link: "https://www.usemarima.com/combos",
    productId: "",
  },
  {
    title: "🚚 Frete grátis acima de R$199",
    body:
      "Aproveite frete grátis na sua região em compras a partir de R$199. Válido por tempo limitado.",
    type: "promo",
    icon: "gift",
    link: "https://www.usemarima.com",
    productId: "",
  },
  {
    title: "💨 Reposição limitada: Leggings de compressão",
    body:
      "Entraram novas unidades dos best-sellers: cintura alta, compressão e conforto. Garanta a sua, {first_name}.",
    type: "promo",
    icon: "sale",
    link: "https://www.usemarima.com/leggings",
    productId: "",
  },
  {
    title: "⏱️ Lembrete: seu carrinho está guardado",
    body:
      "Você deixou itens no carrinho e os preços podem mudar. Finalize agora para garantir tamanho e valor.",
    type: "system",
    icon: "lightbulb",
    link: "https://www.usemarima.com/cart",
    productId: "",
  },
  {
    title: "🎯 Oferta personalizada para você",
    body:
      "Selecionamos peças do seu estilo e tamanho. Clique e veja as sugestões que combinam com você, {first_name}.",
    type: "promo",
    icon: "gift",
    link: "https://www.usemarima.com/recomendados",
    productId: "",
  },
  {
    title: "🏷️ Leve 2 e pague menos: 2ª peça com 50% OFF",
    body:
      "Na compra de 2 peças participantes, a segunda sai com 50% OFF — desconto aplicado no checkout.",
    type: "promo",
    icon: "sale",
    link: "https://www.usemarima.com",
    productId: "",
  },
  {
    title: "🌡️ Treino intenso pede RespTech",
    body:
      "Tecidos respiráveis com compressão equilibrada para render sem abrir mão do conforto. Veja a linha RespTech.",
    type: "tip",
    icon: "lightbulb",
    link: "https://www.usemarima.com/resptech",
    productId: "",
  },
  {
    title: "📣 Novidades da semana e pré-venda",
    body:
      "Chegaram novas cores e abrimos pré-venda de modelos disputados. Garanta o seu antes de esgotar, {first_name}.",
    type: "promo",
    icon: "gift",
    link: "https://www.usemarima.com/novidades",
    productId: "",
  },
];

export default function Notifications() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // notifications admin list
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // stats
  const [stats, setStats] = useState({ totals: { sent: 0, opens: 0, clicks: 0 }, byDay: [], rangeDays: 30 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDays, setStatsDays] = useState(30);

  // form
  const [targetAll, setTargetAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState(seedTemplates[0]);
  const [openPreview, setOpenPreview] = useState(false);

  // edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    type: "tip",
    icon: "lightbulb",
    link: "",
    productId: "",
    _mark: "unread",
  });

  const headers = getAuthHeaders();

  /* ------ Loaders ------ */
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const { data } = await axios.get(`${backendUrl}/api/user/users`, { headers });
      if (data?.success) setUsers(data.users || []);
      else setUsersError("Não foi possível carregar a lista de usuários.");
    } catch {
      setUsersError("Erro de conexão ao carregar usuários.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAdminList = async () => {
    try {
      setListLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/notification/admin/list`, { headers });
      if (data?.success) setList(data.items || []);
    } catch {
      /* ignore */
    } finally {
      setListLoading(false);
    }
  };

  const loadStats = async (days = 30) => {
    try {
      setStatsLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/notification/admin/stats?days=${days}`, { headers });
      if (data?.success) setStats(data);
    } catch {
      /* ignore */
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminList();
    loadStats(statsDays);
  }, [backendUrl]); // eslint-disable-line

  useEffect(() => {
    if (!targetAll && users.length === 0 && !usersLoading) {
      loadUsers();
    }
  }, [targetAll]); // eslint-disable-line

  /* ------ Users - filtros e seleção ------ */
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.celular || u.whatsapp || u.telefone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, userSearch]);

  const toggleId = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : prev.concat(id)));

  const selectAllFiltered = () => {
    const ids = filteredUsers.map((u) => u._id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => setSelectedIds([]);

  /* ------ Envio ------ */
  const sendNow = async () => {
    if (!targetAll && selectedIds.length === 0) {
      alert("Selecione pelo menos 1 usuário para envio direcionado.");
      return;
    }
    const payload = {
      title: form.title,
      body: form.body,
      type: form.type,
      icon: form.icon,
      link: form.link,
      productId: form.productId || null,
      target: targetAll ? "all" : "users",
      userIds: targetAll ? [] : selectedIds,
    };
    await axios.post(`${backendUrl}/api/notification/admin/send`, payload, { headers });
    await Promise.all([loadAdminList(), loadStats(statsDays)]);
    setOpenPreview(false);
  };

  /* ------ Edit ------ */
  const onClickEdit = (n) => {
    setEditItem(n);
    setEditForm({
      title: n.title || "",
      body: n.body || "",
      type: n.type || "tip",
      icon: n.icon || "lightbulb",
      link: n.link || "",
      productId: n.product?._id || "",
      _mark: n.readAt ? "read" : "unread",
    });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    if (!editItem?._id) return;
    const payload = {
      title: editForm.title,
      body: editForm.body,
      type: editForm.type,
      icon: editForm.icon,
      link: editForm.link,
      productId: editForm.productId || null,
      markUnread: editForm._mark === "unread" ? true : undefined,
      markRead: editForm._mark === "read" ? true : undefined,
    };
    await axios.patch(`${backendUrl}/api/notification/admin/${editItem._id}`, payload, { headers });
    setOpenEdit(false);
    setEditItem(null);
    await Promise.all([loadAdminList(), loadStats(statsDays)]);
  };

  const removeItem = async (id) => {
    if (!confirm("Excluir esta notificação?")) return;
    await axios.delete(`${backendUrl}/api/notification/admin/${id}`, { headers });
    await Promise.all([loadAdminList(), loadStats(statsDays)]);
  };

  /* ------ UI Aux ------ */
  const StatCard = ({ label, value }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{fmt(value)}</div>
    </div>
  );

  // Mini “gráfico” em SVG puro
  const Chart = ({ data = [] }) => {
    const w = 520;
    const h = 140;
    const pad = 24;
    const days = data.map((d) => d.sent || 0);
    const opens = data.map((d) => d.opens || 0);
    const clicks = data.map((d) => d.clicks || 0);
    const maxY = Math.max(1, ...days, ...opens, ...clicks);
    const stepX = (w - pad * 2) / Math.max(1, data.length - 1);
    const toPath = (arr) =>
      arr.map((v, i) => {
        const x = pad + i * stepX;
        const y = h - pad - (v / maxY) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ");
    const gridY = Array.from({ length: 4 }, (_, i) => Math.round((maxY * (i + 1)) / 4));

    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="rounded-xl border border-gray-200 bg-white">
        {gridY.map((gy, i) => {
          const y = h - pad - (gy / maxY) * (h - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e5e7eb" strokeDasharray="2 4" />;
        })}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" />
        <path d={toPath(days)} fill="none" strokeWidth="2" />
        <path d={toPath(opens)} fill="none" strokeWidth="2" />
        <path d={toPath(clicks)} fill="none" strokeWidth="2" />
        <g transform={`translate(${pad}, ${pad - 8})`} fontSize="10">
          <text>Enviadas — Aberturas — Cliques</text>
        </g>
      </svg>
    );
  };

  // Preview com “nome de exemplo”
  const previewBody = form.body.replace(/\{first_name\}|\{name\}/gi, "Ana");

  return (
    <main className="p-6 mt-10 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      <Motion.h1
        className="text-2xl md:text-4xl font-extrabold mb-6 tracking-tight text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Notificações
      </Motion.h1>

      {/* RESUMO + CONTROLES DE PERÍODO */}
      <section className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Performance (últimos <strong>{stats?.rangeDays || statsDays}</strong>d)
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Período:</label>
              <select
                value={statsDays}
                onChange={async (e) => {
                  const v = Number(e.target.value);
                  setStatsDays(v);
                  await loadStats(v);
                }}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value={7}>7 dias</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Enviadas" value={stats?.totals?.sent || 0} />
            <StatCard label="Aberturas" value={stats?.totals?.opens || 0} />
            <StatCard label="Cliques" value={stats?.totals?.clicks || 0} />
          </div>

          <div className="rounded-2xl overflow-hidden">
            {statsLoading ? (
              <div className="h-[160px] rounded-xl border border-gray-200 bg-white animate-pulse" />
            ) : (
              <Chart data={stats?.byDay || []} />
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: formulário de envio */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {seedTemplates.map((t, i) => (
              <button
                key={i}
                onClick={() => setForm(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  form.title === t.title
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Template {i + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="tip">Dica</option>
                <option value="promo">Promoção</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Ícone</label>
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="lightbulb">Lâmpada</option>
                <option value="sale">Oferta</option>
                <option value="gift">Presente</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Link (opcional)</label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
                placeholder="https://..."
              />
              {/* Info CTA sugerido (e-mail) */}
              <div className="mt-1 text-[11px] text-gray-500">
                CTA sugerido (e-mail): <strong>{smartCTA(form.title)}</strong>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">ID do Produto (opcional)</label>
              <input
                type="text"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
                placeholder="ObjectId"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Mensagem</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 h-28"
              />
              <div className="mt-1 text-[11px] text-gray-500">
                Use <code>{`{first_name}`}</code> ou <code>{`{name}`}</code> — substituímos pelo nome real no e-mail.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="target" checked={targetAll} onChange={() => setTargetAll(true)} />
                <span className="text-sm">Todos os usuários</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="target" checked={!targetAll} onChange={() => setTargetAll(false)} />
                <span className="text-sm">Selecionar usuários</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenPreview(true)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Pré-visualizar
              </button>
              <button
                onClick={sendNow}
                className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: últimos envios */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="text-sm font-semibold mb-3">Últimas notificações</div>
          <div className="max-h-[520px] overflow-y-auto pr-1 -mr-1 divide-y">
            {listLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3 py-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="text-sm text-gray-600">Sem envios.</div>
            ) : (
              list.map((n) => (
                <div key={n._id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">{n.body}</div>
                      <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{new Date(n.createdAt).toLocaleString("pt-BR")}</span>
                        <span>· {n.user?.name || "Usuário"} ({n.user?.email || "-"})</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aberturas: {n.openCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Cliques: {n.clickCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onClickEdit(n)}
                        className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeItem(n._id)}
                        className="text-xs px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <style>{`.line-clamp-2{-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}`}</style>
        </div>
      </section>

      {/* SELEÇÃO DE USUÁRIOS */}
      {!targetAll && (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2">Selecionar usuários</div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone…"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllFiltered}
                disabled={filteredUsers.length === 0}
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                title="Selecionar todos (filtrados)"
              >
                Selecionar todos
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedIds.length === 0}
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Limpar seleção
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600 mb-3">
            {usersLoading
              ? "Carregando usuários…"
              : usersError
              ? usersError
              : `${filteredUsers.length} de ${users.length} usuários listados · Selecionados: ${selectedIds.length}`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1 -mr-1">
            {usersLoading ? (
              [...Array(9)].map((_, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="text-sm text-gray-600">Nenhum usuário encontrado para o filtro.</div>
            ) : (
              filteredUsers.map((u) => (
                <label
                  key={u._id}
                  className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition ${
                    selectedIds.includes(u._id) ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u._id)}
                    onChange={() => toggleId(u._id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.name || "-"}</div>
                    <div className="text-xs text-gray-600 truncate">{u.email || "-"}</div>
                    {(u.celular || u.whatsapp || u.telefone) && (
                      <div className="text-[11px] text-gray-500 truncate">
                        {u.celular || u.whatsapp || u.telefone}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </section>
      )}

      {/* Pré-visualização */}
      <Modal open={openPreview} onClose={() => setOpenPreview(false)} title="Pré-visualização">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-emerald-600">
              <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">{form.title}</div>
            <div className="text-sm text-gray-700">{previewBody}</div>
          </div>
        </div>
        {!targetAll && (
          <div className="mt-4 text-xs text-gray-600">
            Destinatários selecionados: <strong>{selectedIds.length}</strong>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpenPreview(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Fechar
          </button>
          <button onClick={sendNow} className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
            Enviar
          </button>
        </div>
      </Modal>

      {/* Editar */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Editar notificação">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600">Título</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Tipo</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="tip">Dica</option>
              <option value="promo">Promoção</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Ícone</label>
            <select
              value={editForm.icon}
              onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="lightbulb">Lâmpada</option>
              <option value="sale">Oferta</option>
              <option value="gift">Presente</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Link (opcional)</label>
            <input
              type="url"
              value={editForm.link}
              onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="https://..."
            />
            <div className="mt-1 text-[11px] text-gray-500">
              CTA sugerido (e-mail): <strong>{smartCTA(editForm.title)}</strong>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">ID do Produto (opcional)</label>
            <input
              type="text"
              value={editForm.productId}
              onChange={(e) => setEditForm((f) => ({ ...f, productId: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="ObjectId"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Mensagem</label>
            <textarea
              value={editForm.body}
              onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 h-28"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Status</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mark"
                  checked={editForm._mark === "unread"}
                  onChange={() => setEditForm((f) => ({ ...f, _mark: "unread" }))}
                />
                <span className="text-sm">Marcar como não lida</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mark"
                  checked={editForm._mark === "read"}
                  onChange={() => setEditForm((f) => ({ ...f, _mark: "read" }))}
                />
                <span className="text-sm">Marcar como lida</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpenEdit(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={saveEdit} className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
            Salvar
          </button>
        </div>
      </Modal>
    </main>
  );
}
