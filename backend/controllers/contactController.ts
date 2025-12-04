// @ts-nocheck
import sendEmail from "../utils/sendEmail.js";

export const contactForm = async (req, res) => {
  try {
    const { name, email, subject, orderId, message } = req.body || {};

    if (!process.env.CONTACT_EMAIL) {
      return res.status(500).json({
        success: false,
        message: "CONTACT_EMAIL não configurado no .env",
      });
    }
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Nome, e-mail e mensagem são obrigatórios.",
      });
    }

    await sendEmail({
      to: process.env.CONTACT_EMAIL,
      subject: `📩 Novo contato: ${subject || "Sem assunto"}`,
      html: `
        <h2 style="margin:0 0 8px">Novo contato pelo site</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject || "—"}</p>
        <p><strong>Pedido:</strong> ${orderId || "N/A"}</p>
        <p style="margin:12px 0 4px"><strong>Mensagem:</strong></p>
        <p style="white-space:pre-line">${message}</p>
      `,
      text: `Novo contato
Nome: ${name}
Email: ${email}
Assunto: ${subject || "—"}
Pedido: ${orderId || "N/A"}

${message}
`,
    });

    return res
      .status(200)
      .json({ success: true, message: "Mensagem enviada com sucesso" });
  } catch (err) {
    console.error("[contactForm] erro:", err);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao enviar mensagem" });
  }
};
