import { useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Mail, MessageCircle, MapPin, Clock, ShieldCheck,
  Instagram, Facebook, Send, QrCode, CreditCard, Banknote, BadgePercent,
  X, BookText, Info
} from "lucide-react";
import Title from "../Components/Title";
import NewsLetterBox from "../Components/NewsLetterBox";
import { assets } from "../assets/assets";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false); // ⬅️ Formulário via modal

  const formRef = useRef(null);
  const faqRef = useRef(null);
  const mapRef = useRef(null);

  const COMPANY = useMemo(() => ({
    name: "Marima",
    city: "Volta Redonda - Rio de Janeiro",
    address: "Atendemos Toda Região Sul Fluminense",
    email: "suporte.marima.loja@gmail.com",
    phone: "+55 (24) 98146-7489",
    whatsapp: "https://wa.me/5524981467489?text=Olá,%20preciso%20de%20ajuda%20com%20meu%20pedido",
    instagram: "https://www.instagram.com/use.marima.ofc/",
    facebook: "https://www.facebook.com/people/Marima/61579379169198/?mibextid=wwXIfr",
    hours: "Seg a Sex, 9h - 18h (exceto feriados)",
    sla: { whatsapp: "até 8h em horário comercial", email: "até 24h úteis", chat: "Imediato quando online" },
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7342.90487159465!2d-44.1073275!3d-22.5228476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9e7f0227e6a11f%3A0x3c8f4a6f6d3e60c3!2sCentro%2C%20Volta%20Redonda%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1736440100000!5m2!1spt-BR!2sbr",
  }), []);

  const paymentChips = [
    { icon: <QrCode className="h-4 w-4" />, label: "PIX" },
    { icon: <CreditCard className="h-4 w-4" />, label: "Cartões" },
    { icon: <Banknote className="h-4 w-4" />, label: "Boleto" },
    { icon: <BadgePercent className="h-4 w-4" />, label: "Parcelamento" },
  ];

  const faqs = [
    {
      question: "Qual o prazo de entrega?",
      answer:
        "O prazo varia conforme a região e modalidade. Em média, de 5 a 10 dias úteis após a confirmação do pagamento.",
    },
    {
      question: "Posso devolver um produto?",
      answer:
        "Claro! Você tem até 7 dias corridos após o recebimento para solicitar devolução ou troca, conforme o CDC.",
    },
    {
      question: "Quais formas de pagamento aceitam?",
      answer:
        "Aceitamos PIX, Cartões e Boleto — com opção de parcelamento (sujeito às condições da operadora).",
    },
    {
      question: "Como falo com o suporte?",
      answer: `Atendemos por E-mail e WhatsApp. Prazo: E-mail ${COMPANY.sla.email} • WhatsApp ${COMPANY.sla.whatsapp}.`,
    },
  ];

  const openForm = () => setFormOpen(true);
  const closeForm = () => {
    setError("");
    setSent(false);
    setSubmitting(false);
    setFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSent(false);
    setError("");

    try {
      const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
      const payload = {
        name: raw.name?.trim(),
        email: raw.email?.trim(),
        subject: raw.subject?.trim(),
        orderId: raw.orderId?.trim(),
        message: raw.message?.trim(),
      };

      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Falha ao enviar. Tente novamente.");
      }

      setSent(true);
      formRef.current?.reset();
    } catch (err) {
      setError(err.message || "Erro inesperado ao enviar sua mensagem.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToFAQ = () => faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToMap = () => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-5 sm:px-10 lg:px-20 pt-12 pb-24 border-t max-w-screen-xl mx-auto"
    >
      {/* Header */}
      <div className="text-2xl mb-8">
        <Title text1="CONTATO" text2="CONOSCO" />
      </div>

      {/* Ações rápidas (cards) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {/* Enviar mensagem (abre modal) */}
        <button
          onClick={openForm}
          className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition text-left"
          aria-label="Enviar mensagem"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black/20 p-2">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Enviar mensagem</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">
                Formulário rápido
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Resposta {COMPANY.sla.email}</p>
        </button>

        {/* WhatsApp */}
        <a
          href={COMPANY.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition"
          aria-label="Falar no WhatsApp"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black/20 p-2">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">
                Fale com a gente
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Tempo médio {COMPANY.sla.whatsapp}</p>
        </a>

        {/* Blog */}
        <a
          href="/blog"
          className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition"
          aria-label="Ir para o Blog"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black/20 p-2">
              <BookText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Blog</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">
                Conteúdos & novidades
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Dicas e tendências</p>
        </a>

        {/* FAQ */}
        <button
          onClick={scrollToFAQ}
          className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition text-left"
          aria-label="Ir para perguntas frequentes"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black/20 p-2">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Perguntas frequentes</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">
                Tire suas dúvidas
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Políticas e prazos</p>
        </button>

        {/* Loja / Mapa */}
        <button
          onClick={scrollToMap}
          className="group rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition text-left"
          aria-label="Ver localização e região"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-black/20 p-2">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Nossa região</p>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-900">
                Ver no mapa
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Sul Fluminense</p>
        </button>
      </section>

      {/* Coluna informativa + imagem */}
      <div className="flex flex-col-reverse sm:flex-row items-center gap-10">
        <Motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex-1 w-full"
        >
          <div className="flex flex-col gap-3 text-gray-700">
            <h3 className="font-semibold text-lg text-gray-900">Nossa Loja</h3>
            <p className="text-gray-600 leading-relaxed">
              {COMPANY.name} • {COMPANY.city}
              <br />
              {COMPANY.address}
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Endereço</span>
                </div>
                <p className="mt-1 text-sm text-neutral-700">{COMPANY.address}</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Horário do Atendimento</span>
                </div>
                <p className="mt-1 text-sm text-neutral-700">
                  {COMPANY.hours}
                  <br />
                  E-mail: {COMPANY.sla.email}
                </p>
              </div>
            </div>

            {/* Formas de pagamento */}
            <div className="mt-3 rounded-lg border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Formas de pagamento</span>
              </div>
              <p className="mt-1 text-sm text-neutral-700">
                Aceitamos <strong>PIX</strong>, <strong>Cartões</strong> e <strong>Boleto</strong> — com <strong>parcelamento</strong> disponível.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentChips.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs"
                  >
                    {p.icon}
                    {p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Sociais */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 hover:bg-neutral-50 transition text-sm font-medium text-gray-800"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
              <a
                href={COMPANY.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 hover:bg-neutral-50 transition text-sm font-medium text-gray-800"
              >
                <Facebook className="h-5 w-5" />
                Facebook
              </a>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <ShieldCheck className="h-4 w-4" /> Suporte dedicado e política de trocas transparente.
            </div>
          </div>
        </Motion.div>

        <Motion.img
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          src={assets.contact_img}
          alt="Entre em contato"
          className="w-full sm:w-1/2 max-w-md object-cover rounded-xl shadow-md"
        />
      </div>

      {/* ===== MODAL DO FORMULÁRIO ===== */}
      <AnimatePresence>
        {formOpen && (
          <Motion.div
            className="fixed inset-0 z-[60] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            <div className="absolute inset-0 bg-black/40" onClick={closeForm} />

            <Motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Envie uma mensagem</h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Tempo de resposta: {COMPANY.sla.email}.
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-black/10 p-1.5 hover:bg-neutral-50"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="mt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-neutral-800">Nome</label>
                    <input
                      id="name" name="name" required
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-neutral-800">E-mail</label>
                    <input
                      id="email" name="email" type="email" required
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="voce@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium text-neutral-800">Assunto</label>
                    <input
                      id="subject" name="subject" required
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="Dúvida, suporte, parceria…"
                    />
                  </div>
                  <div>
                    <label htmlFor="orderId" className="text-sm font-medium text-neutral-800">Nº do pedido (opcional)</label>
                    <input
                      id="orderId" name="orderId"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="#12345"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="text-sm font-medium text-neutral-800">Mensagem</label>
                    <textarea
                      id="message" name="message" rows={5} required
                      className="mt-1 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                      placeholder="Conte para nós como podemos ajudar"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-neutral-600">
                    Ao enviar, você concorda com nossa{" "}
                    <a href="/privacidade" className="underline underline-offset-2 hover:opacity-80">
                      Política de Privacidade
                    </a>.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg border border-black bg-black px-4 py-2.5 text-sm font-bold text-white transition active:translate-y-[1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Enviando..." : "Enviar"}
                  </button>
                </div>

                <AnimatePresence>
                  {sent && (
                    <Motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 rounded-lg border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                    >
                      Recebemos sua mensagem! Responderemos em breve.
                    </Motion.div>
                  )}
                  {error && (
                    <Motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 rounded-lg border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {error}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ===== FAQ ===== */}
      <section id="faq" ref={faqRef} className="mt-16">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Perguntas Frequentes</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
              <button
                className="flex w-full items-center justify-between text-left font-medium text-neutral-800"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <Motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 text-sm leading-relaxed text-neutral-600"
                  >
                    {faq.answer}
                  </Motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MAPA ===== */}
      {COMPANY.mapEmbed && COMPANY.mapEmbed.length > 20 && (
        <section ref={mapRef} className="mt-16">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Conheça Nossa Região</h3>
          <div className="overflow-hidden rounded-xl border border-black/10">
            <iframe title="Mapa da loja" src={COMPANY.mapEmbed} className="h-64 w-full" loading="lazy" />
          </div>
        </section>
      )}

      {/* Newsletter */}
      <div className="mt-20">
        <NewsLetterBox />
      </div>

    </Motion.div>
  );
}
