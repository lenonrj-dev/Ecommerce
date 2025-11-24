"use client";
import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";

export default function Entrega() {
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === "A" && e.target.hash) {
        const id = e.target.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", `#${id}`);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const sectionVariant = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      id: "introducao",
      title: "1. Introdução",
      content:
        "Esta Política de Entrega estabelece as condições aplicáveis às entregas realizadas pela Marima Moda Fitness em território nacional. Ao efetuar uma compra, o cliente declara estar ciente e de acordo com os prazos, condições e responsabilidades aqui descritos.",
    },
    {
      id: "prazos",
      title: "2. Prazos de Entrega",
      content:
        "O prazo para entrega é de até 30 (trinta) dias úteis, contados a partir da confirmação do pagamento. Os prazos podem variar conforme a localidade, disponibilidade do produto e modalidade de envio selecionada.",
    },
    {
      id: "modalidades",
      title: "3. Modalidades de Envio",
      content:
        "As entregas são realizadas por transportadoras parceiras e Correios. O cliente poderá escolher a modalidade de envio no momento da compra, considerando prazos e valores disponíveis para seu endereço.",
    },
    {
      id: "rastreamento",
      title: "4. Rastreamento",
      content:
        "Após a postagem do pedido, será enviado ao cliente um código de rastreamento para acompanhamento da entrega em tempo real pelo site da transportadora ou dos Correios.",
    },
    {
      id: "atrasos",
      title: "5. Atrasos",
      content:
        "Eventuais atrasos decorrentes de greves, fenômenos naturais, acidentes, períodos de alta demanda ou situações alheias ao nosso controle não caracterizam descumprimento contratual. Nestes casos, o cliente será comunicado e acompanhado pela nossa equipe de suporte.",
    },
    {
      id: "responsabilidade",
      title: "6. Responsabilidade da Entrega",
      content:
        "É responsabilidade do cliente informar corretamente o endereço de entrega. Caso haja erro ou impossibilidade de entrega por endereço incorreto, será necessário o pagamento de um novo frete. A transportadora é responsável pela integridade do pacote durante o trajeto.",
    },
    {
      id: "tentativas",
      title: "7. Tentativas de Entrega",
      content:
        "Serão realizadas até 3 (três) tentativas de entrega. Caso não haja sucesso, o pedido retornará ao centro de distribuição e o cliente será contatado para reagendamento mediante novo pagamento de frete.",
    },
    {
      id: "trocas-devolucoes",
      title: "8. Trocas e Devoluções",
      content:
        "O cliente poderá solicitar a devolução ou troca do produto em até 7 (sete) dias corridos após o recebimento, conforme previsto no Código de Defesa do Consumidor. As condições e prazos para trocas seguem a Política de Troca e Devolução disponível em nosso site.",
    },
    {
      id: "custos",
      title: "9. Custos de Frete",
      content:
        "Os custos de frete são de responsabilidade do cliente, salvo em campanhas promocionais ou em casos de defeito de fabricação. Os valores serão exibidos antes da finalização da compra.",
    },
    {
      id: "alteracoes",
      title: "10. Alterações desta Política",
      content:
        "A Marima reserva-se o direito de alterar esta Política de Entrega a qualquer momento, mediante publicação em nosso site. Alterações relevantes serão comunicadas aos clientes.",
    },
    {
      id: "contato",
      title: "11. Contato",
      content:
        "Em caso de dúvidas sobre a entrega, entre em contato com nossa equipe de suporte: suporte.marima.loja@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="max-w-6xl mx-auto p-6 md:p-10">
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl shadow-md p-6 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Política de Entrega
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-700 max-w-lg">
                Esta política define as regras e prazos para entregas realizadas
                pela Marima Moda Fitness, garantindo transparência e segurança
                nas compras efetuadas em nosso ecommerce.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <nav aria-label="Índice rápido" className="hidden md:block">
                <a
                  href="#conteudo"
                  className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  Ir para conteúdo
                </a>
              </nav>
            </div>
          </div>
        </Motion.div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Índice lateral */}
        <aside className="order-2 md:order-1 md:col-span-1">
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="sticky top-6 bg-white p-4 rounded-2xl shadow-sm"
          >
            <h2 className="text-sm font-semibold mb-3">Índice</h2>
            <nav aria-label="Tabela de conteúdo" className="space-y-2 text-sm">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block hover:underline"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </Motion.div>
        </aside>

        {/* Conteúdo */}
        <article
          id="conteudo"
          className="order-1 md:order-2 md:col-span-3"
        >
          {sections.map((sec, i) => (
            <Motion.section
              key={sec.id}
              id={sec.id}
              className="mb-8 bg-white p-6 rounded-2xl shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionVariant}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <h3 className="text-xl font-bold">{sec.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {sec.content}
              </p>
            </Motion.section>
          ))}
        </article>

        {/* Rodapé */}
        <div className="md:col-span-4 order-3">
          <div className="max-w-6xl mx-auto p-4 text-center text-xs text-gray-500">
            <p>Última atualização: 2 de Setembro de 2025</p>
          </div>
        </div>
      </main>
    </div>
  );
}
