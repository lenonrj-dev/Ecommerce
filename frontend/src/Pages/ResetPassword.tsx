import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password/${token}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  }
);

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erro ao redefinir senha");

      toast.success("Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md w-full px-6 py-10 mt-16 mx-auto bg-white rounded-lg shadow-md flex flex-col gap-5 text-gray-800"
    >
      {/* Título */}
      <Motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 self-start"
      >
        <h2 className="text-2xl font-semibold tracking-wide">Redefinir Senha</h2>
        <hr className="h-[2px] w-10 bg-gray-800 border-none" />
      </Motion.div>

      {/* Campos */}
      <div className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha"
          className="input"
          required
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar nova senha"
          className="input"
          required
        />
      </div>

      {/* Botão */}
      <Motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg w-full transition"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </Motion.button>

      {/* Link Voltar */}
      <div className="text-sm text-gray-600 text-center">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="hover:underline transition"
        >
          Voltar ao login
        </button>
      </div>
    </Motion.form>
  );
};

export default ResetPassword;
