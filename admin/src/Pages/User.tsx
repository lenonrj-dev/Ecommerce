import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { getProductUrl } from "../utils/productUrl";

/* ---------- Modal genérico ---------- */
function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <Motion.div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 26, opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                aria-label="Fechar"
              >
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

/* ---------- Abas do modal ---------- */
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
            active === t.value ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function User({ token }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);

  // produtos para mapear favoritos por ID
  const [products, setProducts] = useState([]);
  const productMap = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(String(p._id), p));
    return map;
  }, [products]);

  // modal
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pessoais");
  const [selectedUser, setSelectedUser] = useState(null);

  // fetch usuários
  useEffect(() => {
    if (!token) {
      toast.error("Você precisa estar logado para acessar os usuários");
      return;
    }
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/users`, {
          headers: { Authorization: `Bearer ${token}`, token },
        });
        if (data?.success) setUsers(data.users || []);
        else toast.error("Erro ao carregar usuários");
      } catch {
        toast.error("Erro de conexão com o servidor");
      }
    })();
  }, [token, backendUrl]);

  // fetch produtos (para exibir favoritos com nome/imagem)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/list`);
        if (data?.success) setProducts(data.products || []);
      } catch {
        /* silencioso */
      }
    })();
  }, [backendUrl]);

  const openUserModal = (u) => {
    setSelectedUser(u);
    setActiveTab("pessoais");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const usersEmpty = !users || users.length === 0;

  return (
    <main className="p-6 mt-10 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
      {/* SEO-friendly Heading */}
      <Motion.h1
        className="text-2xl md:text-4xl font-extrabold mb-6 tracking-tight text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Gestão de Usuários | Painel Administrativo
      </Motion.h1>

      <Motion.p
        className="mb-8 text-gray-600 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Visualize cada cliente como um <strong>contato</strong> e abra um modal para detalhes:
        <em> dados pessoais</em>, <em>endereço</em> e <em>favoritos</em>.
      </Motion.p>

      {/* Grid de contatos */}
      <Motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {usersEmpty ? (
          <div className="col-span-full text-center py-10 text-gray-500 italic bg-white rounded-xl border border-gray-200 shadow-sm">
            Nenhum usuário encontrado no sistema
          </div>
        ) : (
          users.map((u, idx) => {
            const favoritesCount = Array.isArray(u.favorites) ? u.favorites.length : 0;
            const hasAddress = !!u.address;
            return (
              <Motion.div
                key={u._id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-5 flex flex-col"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.35 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{u.name || "-"}</h3>
                    <p className="text-xs text-gray-500">{u.email || "-"}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                    {u.sexo || "-"}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Celular:</span> {u.celular || "-"}</p>
                  <p><span className="font-medium text-gray-800">WhatsApp:</span> {u.whatsapp || "-"}</p>
                  <p><span className="font-medium text-gray-800">Nascimento:</span> {u.nascimento || "-"}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${u.promo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    Promo: {u.promo ? "Sim" : "Não"}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Favoritos: {favoritesCount}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                    Endereço: {hasAddress ? "Sim" : "Não"}
                  </span>
                </div>

                <button
                  onClick={() => openUserModal(u)}
                  className="mt-5 w-full rounded-lg bg-black text-white text-sm font-semibold py-2 hover:bg-gray-900 transition"
                >
                  Ver informações
                </button>
              </Motion.div>
            );
          })
        )}
      </Motion.div>

      {/* Modal de informações do usuário */}
      <Modal
        open={open && !!selectedUser}
        onClose={closeModal}
        title={selectedUser ? `Informações de ${selectedUser.name || "Usuário"}` : "Informações"}
      >
        {!selectedUser ? null : (
          <>
            <Tabs
              tabs={[
                { label: "Dados pessoais", value: "pessoais" },
                { label: "Endereço", value: "endereco" },
                { label: "Favoritos", value: "favoritos" },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {/* Conteúdo de cada aba */}
            {activeTab === "pessoais" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Field label="Nome completo" value={selectedUser.name} />
                <Field label="E-mail" value={selectedUser.email} />
                <Field label="Celular" value={selectedUser.celular} />
                <Field label="Telefone" value={selectedUser.telefone} />
                <Field label="WhatsApp" value={selectedUser.whatsapp} />
                <Field label="CPF / CNPJ" value={selectedUser.cpf} />
                <Field label="Data de nascimento" value={selectedUser.nascimento} />
                <Field label="Sexo" value={selectedUser.sexo} />
                <Field label="Recebe promoções" value={selectedUser.promo ? "Sim" : "Não"} />
              </div>
            )}

            {activeTab === "endereco" && (
              <div className="text-sm">
                {selectedUser.address ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nome" value={selectedUser.address.fullName} />
                    <Field label="Telefone" value={selectedUser.address.phone} />
                    <Field label="CEP" value={selectedUser.address.zip} />
                    <Field label="Estado" value={selectedUser.address.state} />
                    <Field label="Cidade" value={selectedUser.address.city} />
                    <Field label="Bairro" value={selectedUser.address.neighborhood} />
                    <Field label="Rua" value={selectedUser.address.street} />
                    <Field label="Número" value={selectedUser.address.number} />
                    <Field label="Complemento" value={selectedUser.address.complement} />
                    <Field label="País" value={selectedUser.address.country || "Brasil"} />
                  </div>
                ) : (
                  <p className="text-gray-600">Sem endereço cadastrado.</p>
                )}
              </div>
            )}

            {activeTab === "favoritos" && (
              <div className="space-y-3">
                {Array.isArray(selectedUser.favorites) && selectedUser.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUser.favorites.map((favIdRaw) => {
                      const favId = String(favIdRaw);
                      const p = productMap.get(favId);
                      if (!p) {
                        // id sem produto carregado (continua mostrando o id)
                        return (
                          <div key={favId} className="border rounded-lg p-3 bg-gray-50 text-sm">
                            <div className="font-medium text-gray-800">Produto #{favId.slice(-6)}</div>
                            <div className="text-gray-600">Não encontrado no catálogo atual.</div>
                          </div>
                        );
                      }
                      const img = p.image?.[0] || p.thumbnail || "";
                      const productUrl = getProductUrl(p);
                      return (
                        <Link
                          key={favId}
                          to={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group border rounded-lg p-3 bg-white hover:bg-gray-50 transition flex gap-3"
                        >
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? (
                              <img src={img} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
                                Sem imagem
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 group-hover:underline">{p.name}</div>
                            <div className="text-gray-700 text-sm">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price || 0)}
                            </div>
                            {p.category && (
                              <div className="text-xs text-gray-500 mt-1">
                                {p.category} {p.subCategory ? `• ${p.subCategory}` : ""}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">Este usuário ainda não possui favoritos.</p>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </main>
  );
}

/* ---------- Campo de leitura simples ---------- */
function Field({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="text-gray-800 break-words">{value || "-"}</div>
    </div>
  );
}
