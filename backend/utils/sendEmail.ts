// @ts-nocheck
// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

/* =============================================================================
 * SMTP Transport (produção)
 * ========================================================================== */
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
  maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30_000),
});

/* =============================================================================
 * Utilitários
 * ========================================================================== */
const COLORS = {
  bgBrand: "#f2f2f2",
  text: "#1f2937",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  accent: "#111111",
  link: "#111111",
};

const WRAPPER_STYLE = `
  margin:0; padding:0; width:100%;
  background-color:${COLORS.bgBrand};
`;
const CONTAINER_STYLE = `
  font-family: Arial, Helvetica, sans-serif;
  color:${COLORS.text};
  max-width:600px; margin:0 auto; padding:0 16px;
`;
const CARD_STYLE = `
  background:#ffffff;
  border:1px solid ${COLORS.border};
  border-radius:12px;
  padding:24px;
`;
const H1_STYLE = `
  margin:0 0 8px 0;
  font-size:20px; line-height:28px;
  color:${COLORS.accent};
`;
const LEAD_STYLE = `
  margin:0 0 16px 0;
  font-size:14px; line-height:22px;
  color:${COLORS.text};
`;
const HR_STYLE = `height:1px; border:none; background:${COLORS.border}; margin:16px 0;`;
const CTA_BUTTON_STYLE = `
  display:inline-block; padding:12px 18px; background:${COLORS.accent};
  color:#ffffff !important; text-decoration:none; border-radius:8px;
  font-weight:600; font-size:14px; line-height:20px;
`;
const FOOTER_STYLE = `
  margin:16px 0 32px 0;
  font-size:12px; line-height:18px; color:${COLORS.textMuted};
`;

const stripHtml = (str = "") => String(str).replace(/<[^>]*>/g, "");
const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const firstNameOf = (nameOrEmail = "") => {
  if (!nameOrEmail) return "Cliente";
  const onlyName = String(nameOrEmail).trim();
  if (onlyName.includes("@")) return onlyName.split("@")[0];
  const parts = onlyName.split(/\s+/);
  return parts[0] || "Cliente";
};

const personalize = (text = "", vars = {}) => {
  // Suporta {name} e {first_name}
  const map = {
    "{name}": vars.name || vars.firstName || "Cliente",
    "{first_name}": vars.firstName || vars.name || "Cliente",
  };
  return Object.keys(map).reduce(
    (acc, key) => acc.replace(new RegExp(key, "gi"), map[key]),
    String(text)
  );
};

const absoluteUrl = (pathOrUrl) => {
  try {
    // já é absoluta
    return new URL(pathOrUrl).toString();
  } catch {
    const base =
      process.env.API_URL ||
      process.env.BACKEND_URL ||
      process.env.FRONTEND_URL ||
      "https://www.usemarima.com";
    return new URL(pathOrUrl, base).toString();
  }
};

const buildRedirect = ({ notificationId, siteUrl, campaign }) => {
  const base =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.FRONTEND_URL ||
    "https://www.usemarima.com";

  const endpoint = new URL("/api/notification/t/c", base);
  endpoint.searchParams.set("nid", String(notificationId || ""));
  endpoint.searchParams.set("url", siteUrl);
  endpoint.searchParams.set("utm_source", "email");
  endpoint.searchParams.set("utm_medium", "notification");
  endpoint.searchParams.set("utm_campaign", slug(campaign || "notificacao"));
  return endpoint.toString();
};

const buildPixel = (notificationId) => {
  const base =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.FRONTEND_URL ||
    "https://www.usemarima.com";
  const endpoint = new URL("/api/notification/t/o", base);
  endpoint.searchParams.set("nid", String(notificationId || ""));
  return endpoint.toString();
};

const smartCtaLabel = (title = "", fallback = "Ver agora") => {
  const t = title.toLowerCase();
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

/** Template base com preheader, título, conteúdo e CTA opcional */
function baseTemplate({ preheader = "", title, contentHtml, cta, pixelHtml }) {
  const CTA_BLOCK =
    cta?.url && cta?.label
      ? `<div style="margin-top:16px;"><a href="${cta.url}" target="_blank" style="${CTA_BUTTON_STYLE}">${cta.label}</a></div>`
      : "";

  const PREHEADER_HIDDEN = `
    <div style="display:none;overflow:hidden;line-height:1;font-size:1px;color:#ffffff;opacity:0;max-height:0;max-width:0;">
      ${stripHtml(preheader)}
    </div>
  `;

  return `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${stripHtml(title || (process.env.BRAND_NAME || "Marima"))}</title>
      <style>
        a { color: ${COLORS.link}; }
        @media (max-width: 620px) {
          .container { padding: 0 12px !important; }
          .card { padding: 20px !important; }
        }
        img { max-width:100%; height:auto; border-radius:10px; }
      </style>
    </head>
    <body style="${WRAPPER_STYLE}">
      ${PREHEADER_HIDDEN}
      <div class="container" style="${CONTAINER_STYLE}">
        <div style="height:20px;"></div>
        <div class="card" style="${CARD_STYLE}">
          <h1 style="${H1_STYLE}">${title}</h1>
          <hr style="${HR_STYLE}" />
          <div style="${LEAD_STYLE}">
            ${contentHtml}
          </div>
          ${CTA_BLOCK}
        </div>
        ${pixelHtml || ""}
        <div style="${FOOTER_STYLE}">
          <p>A <strong>${process.env.BRAND_NAME || "Marima"}</strong> oferece curadoria de produtos com experiência de compra clara, segura e transparente.</p>
          <p>Suporte: ${process.env.SMTP_USER || ""}${
            process.env.FRONTEND_URL
              ? ` · Site: <a href="${process.env.FRONTEND_URL}" target="_blank" style="color:${COLORS.link}; text-decoration:none;">${process.env.FRONTEND_URL}</a>`
              : ""
          }</p>
          <p>&copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME || "Marima"}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

/* =============================================================================
 * Envio genérico
 * ========================================================================== */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
  replyTo,
}) => {
  const recipient = to || process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  if (!recipient) throw new Error("Destinatário (to) não definido");

  const BRAND_NAME = process.env.BRAND_NAME || "Marima";

  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    text,
    html,
    attachments,
    replyTo: replyTo || process.env.REPLY_TO || process.env.SMTP_USER,
    headers: {
      "List-Unsubscribe":
        `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
    },
  });
};

/* =============================================================================
 * Notificação genérica (pixel + redirect UTM + personalização)
 * ========================================================================== */
export async function sendNotificationEmail({
  notificationId, // para tracking
  userEmail,
  userName,
  title,
  body,
  link,         // opcional
  productName,  // opcional
  productImage, // opcional
  ctaLabel,     // opcional
}) {
  if (!userEmail) return;

  const safeName = userName || "Cliente";
  const firstName = firstNameOf(safeName);

  const frontUrl = process.env.FRONTEND_URL || "https://www.usemarima.com";
  const siteUrl = absoluteUrl(link || frontUrl);

  // Redirect com UTM + nid
  const campaign = slug(title || "notificacao");
  const clickUrl = buildRedirect({
    notificationId,
    siteUrl,
    campaign,
  });

  // Pixel 1x1
  const pixelUrl = buildPixel(notificationId);
  const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;opacity:0;width:1px;height:1px;" />`;

  const subject =
    `${title || "Você tem novas notificações"} — ${process.env.BRAND_NAME || "Marima"}`;

  // Personaliza placeholders {name} / {first_name} dentro do corpo vindo do painel
  const personalizedBody = personalize(body || "", {
    name: safeName,
    firstName,
  });

  const contentPieces = [
    `<p style="margin:0 0 12px 0;">Olá ${stripHtml(firstName)},</p>`,
    personalizedBody ? `<p style="margin:0 0 12px 0;">${personalizedBody}</p>` : "",
    productName ? `<p style="margin:0 0 6px 0;"><strong>${stripHtml(productName)}</strong></p>` : "",
    productImage
      ? `<div style="margin:12px 0;"><img src="${productImage}" alt="${stripHtml(productName || "Produto")}"/></div>`
      : "",
    `<p style="margin:0;">Acesse e aproveite as condições por tempo limitado.</p>`,
  ].join("");

  const finalCtaLabel = ctaLabel || smartCtaLabel(title, "Ver agora");

  const html = baseTemplate({
    preheader: `Olá ${stripHtml(firstName)}, selecionamos ofertas fitness para você.`,
    title: title || "Novas ofertas para você",
    contentHtml: contentPieces,
    cta: { label: finalCtaLabel, url: clickUrl },
    pixelHtml,
  });

  await sendEmail({
    to: userEmail,
    subject,
    html,
    text: `Olá ${firstName}, ${stripHtml(personalizedBody || "")} Acesse: ${siteUrl}`,
  });
}

/* =============================================================================
 * E-mails ativos (boas-vindas, abandono)
 * ========================================================================== */
export async function sendWelcomeEmail({ userEmail, userName, couponCode, appUrl }) {
  const safeName = userName || userEmail || "Cliente";
  const firstName = firstNameOf(safeName);
  const code = couponCode || process.env.COUPON10 || "USERTEM10";
  const ctaUrl = absoluteUrl(appUrl || process.env.FRONTEND_URL || "#");

  const preheader = `Conta criada com sucesso. Seu cupom: ${code}`;
  const title = "Conta criada com sucesso";
  const content = `
    <p style="margin:0 0 12px 0;">Olá ${stripHtml(firstName)},</p>
    <p style="margin:0 0 12px 0;">Sua conta foi criada com sucesso. Para dar as boas-vindas, disponibilizamos um cupom exclusivo para sua primeira compra:</p>
    <div style="margin:16px 0; padding:14px 16px; border:2px dashed ${COLORS.accent}; border-radius:10px; text-align:center; font-size:18px; font-weight:700; letter-spacing:1px; color:${COLORS.accent};">
      ${stripHtml(code)}
    </div>
    <p style="margin:0 0 12px 0;">Aplique esse código no carrinho ou no checkout. Qualquer dúvida, é só responder este e-mail.</p>
  `;

  const html = baseTemplate({
    preheader,
    title,
    contentHtml: content,
    cta: { label: "Ir para a loja", url: ctaUrl },
  });

  await sendEmail({
    to: userEmail,
    subject: `Conta criada com sucesso — seu cupom ${stripHtml(code)}`,
    html,
    text: `Bem-vindo(a), ${firstName}. Seu cupom é: ${code}. Acesse: ${ctaUrl}`,
  });
}

export async function sendAbandonedCartEmail({
  userEmail,
  userName,
  productName,
  productImage,
  size,
  checkoutUrl,
}) {
  if (!userEmail || !checkoutUrl) return;

  const safeName = userName || "Cliente";
  const firstName = firstNameOf(safeName);
  const preheader = `Seu pedido está te esperando — finalize antes que acabe!`;
  const title = "Volte! Seu pedido está te esperando";
  const content = `
    <p style="margin:0 0 12px 0;">Olá ${stripHtml(firstName)},</p>
    <p style="margin:0 0 12px 0;">
      Notamos que você iniciou a compra e não concluiu o pagamento.
      <strong>Volte agora — estamos com seu pedido aqui</strong> e as unidades são limitadas.
    </p>
    ${
      productImage
        ? `<div style="margin:12px 0;"><img src="${productImage}" alt="${stripHtml(productName || "Produto")}" /></div>`
        : ""
    }
    <p style="margin:0 0 6px 0;"><strong>${stripHtml(productName || "Produto")}</strong>${
      size ? ` • Tamanho ${stripHtml(String(size))}` : ""
    }</p>
    <p style="margin:0;">Garanta o seu antes que acabe o estoque.</p>
  `;

  const html = baseTemplate({
    preheader,
    title,
    contentHtml: content,
    cta: { label: "Finalizar compra agora", url: absoluteUrl(checkoutUrl) },
  });

  await sendEmail({
    to: userEmail,
    subject: "Volte! Seu pedido está te esperando",
    html,
    text: `${firstName}, finalize sua compra: ${checkoutUrl}`,
  });
}

/* default export */
export default sendEmail;
