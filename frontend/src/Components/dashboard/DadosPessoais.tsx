import { useState, useEffect, useContext, useRef } from "react";
import { motion as Motion } from "framer-motion";
import axios from "axios";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-toastify";

export default function DadosPessoais() {
  const { backendUrl, token } = useContext(ShopContext);

  const [form, setForm] = useState({
    nome: "",
    celular: "",
    telefone: "",
    whatsapp: "",
    email: "",
    senha: "",
    cpf: "",
    nascimento: "",
    sexo: "masculino",
    promo: false,
  });
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  // Carregar dados do usuário
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    async function fetchProfile() {
      if (!token) return;
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (data?.success && isMounted.current) {
          setForm((prev) => ({
            ...prev,
            nome: data.user?.name || "",
            celular: data.user?.celular || "",
            telefone: data.user?.telefone || "",
            whatsapp: data.user?.whatsapp || "",
            email: data.user?.email || "",
            senha: "", // nunca preencher senha vinda do backend
            cpf: data.user?.cpf || "",
            nascimento: data.user?.nascimento || "",
            sexo: data.user?.sexo || "masculino",
            promo: !!data.user?.promo,
          }));
        }
      } catch (error) {
        console.error(error);
        if (!controller.signal.aborted) {
          toast.error("Erro ao carregar dados do perfil.");
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [token, backendUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!token) return toast.error("Sessão expirada. Faça login novamente.");
    setLoading(true);
    try {
      const payload = { ...form };
      // não enviar senha vazia
      if (!payload.senha) delete payload.senha;

      const { data } = await axios.put(`${backendUrl}/api/user/update-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        toast.success("✅ Dados atualizados com sucesso!");
        // limpa campo de senha no formulário
        setForm((f) => ({ ...f, senha: "" }));
      } else {
        toast.error(data?.message || "Não foi possível salvar as alterações.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao salvar alterações");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Animação em cascata
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <Motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto px-6 py-12"
    >
      <Motion.h2 variants={itemVariants} className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Atualize seus Dados Pessoais
      </Motion.h2>

      <Motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 space-y-6 border border-gray-100"
      >
        {/* Campos */}
        <Motion.div variants={containerVariants} className="space-y-5">
          {[
            { name: "nome", placeholder: "Nome completo" },
            { name: "celular", placeholder: "Celular" },
            { name: "telefone", placeholder: "Telefone" },
            { name: "whatsapp", placeholder: "WhatsApp" },
            { name: "email", placeholder: "E-mail", type: "email" },
            { name: "senha", placeholder: "Nova senha", type: "password" },
            { name: "cpf", placeholder: "CPF ou CNPJ" },
            { name: "nascimento", placeholder: "Data de nascimento", type: "date" },
          ].map((field) => (
            <Motion.input
              key={field.name}
              variants={itemVariants}
              type={field.type || "text"}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              aria-label={field.placeholder || field.name}
              autoComplete={field.name === "senha" ? "new-password" : "on"}
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
            />
          ))}

          {/* Select sexo */}
          <Motion.select
            variants={itemVariants}
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            aria-label="Selecione seu sexo"
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
          >
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </Motion.select>

          {/* Checkbox promo */}
          <Motion.label variants={itemVariants} className="flex items-center gap-3 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="promo"
              checked={form.promo}
              onChange={handleChange}
              className="w-4 h-4 accent-black"
            />
            Quero receber e-mails com promoções exclusivas
          </Motion.label>
        </Motion.div>

        <Motion.button
          variants={itemVariants}
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg shadow-md transition text-white ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-900"
          }`}
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Motion.button>
      </Motion.div>
    </Motion.section>
  );
}
