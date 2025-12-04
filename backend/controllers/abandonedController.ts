// @ts-nocheck
// backend/controllers/abandonedController.js
import { sendAbandonedCartEmail } from "../utils/sendEmail.js";

/**
 * Rastreia clique em "COMPRAR" (checkout da Yampi) para um tamanho específico
 * e dispara e-mail de abandono.
 * Body esperado:
 * {
 *   userEmail: string,          // obrigatório (e-mail do login)
 *   userName?: string,
 *   productId?: string,
 *   productName?: string,
 *   productImage?: string,      // opcional (thumbnail)
 *   size?: "P"|"M"|"G"|string,  // opcional
 *   checkoutUrl: string         // obrigatório (link Yampi do tamanho)
 * }
 */
export const track = async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      productId,
      productName,
      productImage,
      size,
      checkoutUrl,
    } = req.body || {};

    if (!userEmail || !checkoutUrl) {
      return res.status(400).json({
        success: false,
        message: "Campos 'userEmail' e 'checkoutUrl' são obrigatórios.",
      });
    }

    // Dispara o e-mail (sem bloquear a resposta ao cliente)
    sendAbandonedCartEmail({
      userEmail,
      userName,
      productName,
      productImage,
      size,
      checkoutUrl,
    }).catch((e) => console.error("[abandoned email] erro:", e));

    return res.json({ success: true, tracked: true, productId });
  } catch (e) {
    console.error("abandoned.track error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};
