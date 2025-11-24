import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion as Motion, AnimatePresence } from "framer-motion";

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <Motion.div className="fixed inset-0 z-[70] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <Motion.div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">Fechar</button>
            </div>
            <div className="mt-4">{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

const Star = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={filled ? "fill-yellow-400" : "fill-gray-300"}>
    <path d="M12 .587l3.668 7.431 8.207 1.193-5.938 5.79 1.402 8.168L12 18.896l-7.339 3.873 1.402-8.168L.125 9.211l8.207-1.193z"/>
  </svg>
);

const RatingStars = ({ value = 0 }) => {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => <Star key={i} filled={i <= v} />)}
    </div>
  );
};

export default function Feedback() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}`, token }),
    [token]
  );

  const [overview, setOverview] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productComments, setProductComments] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userComments, setUserComments] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOverview = useCallback(async () => {
    const { data } = await axios.get(`${backendUrl}/api/comment/admin/overview/all`);
    if (data?.success) setOverview(data.items || []);
  }, [backendUrl]);

  const fetchUsers = useCallback(async () => {
    const { data } = await axios.get(`${backendUrl}/api/user/users`, { headers: authHeaders });
    if (data?.success) setUsers(data.users || []);
  }, [backendUrl, authHeaders]);

  useEffect(() => { fetchOverview().catch(() => {}); }, [fetchOverview]);
  useEffect(() => { fetchUsers().catch(() => {}); }, [fetchUsers]);

  const openProductModal = async (row) => {
    setSelectedProduct(row);
    const res = await axios.get(`${backendUrl}/api/comment/${row.productId}?limit=200`);
    setProductComments(res?.data?.items || []);
  };

  const openUserModal = async (u) => {
    setSelectedUser(u);
    const res = await axios.get(`${backendUrl}/api/comment/by-user/${u._id}`);
    setUserComments(res?.data?.items || []);
  };

  const closeProductModal = () => { setSelectedProduct(null); setProductComments([]); };
  const closeUserModal = () => { setSelectedUser(null); setUserComments([]); };

  const openEdit = (c) => {
    setEditTarget(c);
    setEditRating(c.rating || 5);
    setEditContent(c.content || "");
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    await axios.patch(`${backendUrl}/api/comment/admin/${editTarget._id}`, { rating: editRating, content: editContent }, { headers: authHeaders });
    setEditOpen(false);
    if (selectedProduct) {
      const res = await axios.get(`${backendUrl}/api/comment/${selectedProduct.productId}?limit=200`);
      setProductComments(res?.data?.items || []);
      await fetchOverview();
    }
    if (selectedUser) {
      const res = await axios.get(`${backendUrl}/api/comment/by-user/${selectedUser._id}`);
      setUserComments(res?.data?.items || []);
    }
  };

  const openReply = (c) => {
    setReplyTarget(c);
    setReplyContent(c.reply?.content || "");
    setReplyOpen(true);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    await axios.post(`${backendUrl}/api/comment/admin/${replyTarget._id}/reply`, { content: replyContent, author: "Marima Oficial" }, { headers: authHeaders });
    setReplyOpen(false);
    if (selectedProduct) {
      const res = await axios.get(`${backendUrl}/api/comment/${selectedProduct.productId}?limit=200`);
      setProductComments(res?.data?.items || []);
    }
    if (selectedUser) {
      const res = await axios.get(`${backendUrl}/api/comment/by-user/${selectedUser._id}`);
      setUserComments(res?.data?.items || []);
    }
  };

  const openDelete = (c) => {
    setDeleteTarget(c);
    setConfirmOpen(true);
  };

  const submitDelete = async () => {
    await axios.delete(`${backendUrl}/api/comment/admin/${deleteTarget._id}`, { headers: authHeaders });
    setConfirmOpen(false);
    if (selectedProduct) {
      const res = await axios.get(`${backendUrl}/api/comment/${selectedProduct.productId}?limit=200`);
      setProductComments(res?.data?.items || []);
      await fetchOverview();
    }
    if (selectedUser) {
      const res = await axios.get(`${backendUrl}/api/comment/by-user/${selectedUser._id}`);
      setUserComments(res?.data?.items || []);
    }
  };

  return (
    <main className="p-6 mt-10 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      <Motion.h1 className="text-2xl md:text-4xl font-extrabold mb-6 tracking-tight text-gray-800"
        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        Avaliações e Comentários
      </Motion.h1>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Produtos</h2>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 bg-gray-50">
            <div className="col-span-6">Produto</div>
            <div className="col-span-2">Avaliações</div>
            <div className="col-span-2">Média</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
          <div className="divide-y">
            {overview.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">Sem dados de avaliações.</div>
            ) : (
              overview.map((row) => (
                <div key={String(row.productId)} className="grid grid-cols-12 items-center px-4 py-3">
                  <div className="col-span-6">
                    <div className="font-medium text-gray-900">{row.name}</div>
                  </div>
                  <div className="col-span-2">{row.count}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <RatingStars value={row.avg || 0} />
                    <span className="text-sm text-gray-700">{(row.avg || 0).toFixed(1)}</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => openProductModal(row)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                      Ver comentários
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Usuários</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {users.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500 italic bg-white rounded-xl border border-gray-200 shadow-sm">
              Nenhum usuário encontrado
            </div>
          ) : (
            users.map((u, idx) => (
              <Motion.div key={u._id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-5 flex flex-col"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.35 }}>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{u.name || "-"}</h3>
                  <p className="text-xs text-gray-500">{u.email || "-"}</p>
                  <p className="text-xs text-gray-500">{u.celular || u.telefone || u.whatsapp || "-"}</p>
                </div>
                <button onClick={() => openUserModal(u)} className="mt-5 w-full rounded-lg bg-black text-white text-sm font-semibold py-2 hover:bg-gray-900 transition">
                  Comentários do usuário
                </button>
              </Motion.div>
            ))
          )}
        </div>
      </section>

      <Modal open={!!selectedProduct} onClose={closeProductModal} title={selectedProduct ? `Comentários · ${selectedProduct.name}` : ""}>
        <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
          {productComments.length === 0 ? (
            <div className="text-sm text-gray-600">Sem comentários para este produto.</div>
          ) : (
            <ul className="space-y-4">
              {productComments.map((c) => (
                <li key={c._id} className="border-b pb-3 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{c?.user?.name || "Usuário"}</span>
                    <span className="text-gray-500">· {new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                    <span className="flex items-center gap-1"><RatingStars value={c.rating} /><span className="text-gray-700">{c.rating}</span></span>
                    {c.verified && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">verificado</span>}
                  </div>
                  {c.content && <p className="text-sm text-gray-700 mt-2">{c.content}</p>}

                  {c.reply && (
                    <div className="mt-3 ml-4 pl-3 border-l-2 border-gray-200">
                      <div className="text-sm font-semibold text-gray-900">{c.reply.author || "Marima Oficial"}</div>
                      <div className="text-sm text-gray-700">{c.reply.content}</div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => openEdit(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Editar</button>
                    <button onClick={() => openReply(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Responder</button>
                    <button onClick={() => openDelete(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 border-red-200">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={!!selectedUser} onClose={closeUserModal} title={selectedUser ? `Comentários de ${selectedUser.name || "Usuário"}` : ""}>
        <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
          {userComments.length === 0 ? (
            <div className="text-sm text-gray-600">Este usuário ainda não comentou.</div>
          ) : (
            <ul className="space-y-4">
              {userComments.map((c) => (
                <li key={c._id} className="border-b pb-3 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{c?.product?.name || "Produto"}</span>
                    <span className="text-gray-500">· {new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                    <span className="flex items-center gap-1"><RatingStars value={c.rating} /><span className="text-gray-700">{c.rating}</span></span>
                    {c.verified && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">verificado</span>}
                  </div>
                  {c.content && <p className="text-sm text-gray-700 mt-2">{c.content}</p>}

                  {c.reply && (
                    <div className="mt-3 ml-4 pl-3 border-l-2 border-gray-200">
                      <div className="text-sm font-semibold text-gray-900">{c.reply.author || "Marima Oficial"}</div>
                      <div className="text-sm text-gray-700">{c.reply.content}</div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => openEdit(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Editar</button>
                    <button onClick={() => openReply(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Responder</button>
                    <button onClick={() => openDelete(c)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 border-red-200">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar comentário">
        {!editTarget ? null : (
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="text-sm text-gray-700">De: <span className="font-medium">{editTarget?.user?.name || "Usuário"}</span></div>
            <div className="flex items-center gap-3">
              {[1,2,3,4,5].map((n) => (
                <label key={n} className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="rating" value={n} checked={editRating === n} onChange={() => setEditRating(n)} className="accent-black" />
                  <span className="text-sm">{n}</span>
                </label>
              ))}
            </div>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full rounded-md border px-3 py-2 h-28"
              placeholder="Edite o conteúdo do comentário" minLength={1} required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">Salvar</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={replyOpen} onClose={() => setReplyOpen(false)} title="Responder como Marima Oficial">
        {!replyTarget ? null : (
          <form onSubmit={submitReply} className="space-y-4">
            <div className="text-sm text-gray-700">Para: <span className="font-medium">{replyTarget?.user?.name || "Usuário"}</span></div>
            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="w-full rounded-md border px-3 py-2 h-28"
              placeholder="Escreva a resposta oficial" minLength={1} required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReplyOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">Responder</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Excluir comentário">
        {!deleteTarget ? null : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Tem certeza que deseja excluir este comentário? Esta ação não poderá ser desfeita.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <div className="font-medium">{deleteTarget?.user?.name || "Usuário"}</div>
              <div className="text-gray-700 mt-1">{deleteTarget?.content}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={submitDelete} className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700">Excluir</button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
