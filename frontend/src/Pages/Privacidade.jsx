import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";

export default function Privacidade() {
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

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Cabeçalho */}
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
                Política de Privacidade
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-700 max-w-lg">
                Esta política estabelece como coletamos, utilizamos, armazenamos e protegemos seus
                dados pessoais ao utilizar nossa plataforma de e-commerce de roupas fitness.
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

      {/* Conteúdo */}
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
              <a href="#introducao" className="block hover:underline">Introdução</a>
              <a href="#dados-coletados" className="block hover:underline">Dados coletados</a>
              <a href="#finalidade" className="block hover:underline">Finalidade e base legal</a>
              <a href="#uso-dados" className="block hover:underline">Uso e compartilhamento</a>
              <a href="#cookies" className="block hover:underline">Cookies e rastreamento</a>
              <a href="#seguranca" className="block hover:underline">Segurança</a>
              <a href="#direitos" className="block hover:underline">Direitos do titular</a>
              <a href="#retencao" className="block hover:underline">Prazo de retenção</a>
              <a href="#menores" className="block hover:underline">Menores de idade</a>
              <a href="#alteracoes" className="block hover:underline">Alterações</a>
              <a href="#contato" className="block hover:underline">Contato</a>
            </nav>
          </Motion.div>
        </aside>

        {/* Seções principais */}
        <article id="conteudo" className="order-1 md:order-2 md:col-span-3">
          {[
            {
              id: "introducao",
              title: "1. Introdução",
              content:
                "Nossa missão é oferecer uma experiência de compra segura, prática e transparente. Ao utilizar nossos serviços, você aceita os termos desta Política de Privacidade, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/18).",
            },
            {
              id: "dados-coletados",
              title: "2. Dados que coletamos",
              content:
                "Coletamos informações fornecidas diretamente por você no cadastro e uso da plataforma, como nome completo, CPF, telefone, e-mail, endereço de entrega e cobrança, além de dados técnicos de navegação (IP, dispositivo e histórico de acesso).",
            },
            {
              id: "finalidade",
              title: "3. Finalidade e base legal",
              content:
                "Seus dados são utilizados para processar pedidos, emitir notas fiscais, realizar entregas, oferecer suporte ao cliente e cumprir obrigações legais e regulatórias. A base legal para o tratamento inclui execução de contrato, cumprimento de obrigação legal e legítimo interesse.",
            },
            {
              id: "uso-dados",
              title: "4. Uso e compartilhamento",
              content:
                "Podemos compartilhar dados com prestadores de serviços essenciais (transportadoras, meios de pagamento, serviços antifraude) e autoridades competentes quando exigido por lei. Não vendemos nem comercializamos seus dados pessoais.",
            },
            {
              id: "cookies",
              title: "5. Cookies e tecnologias de rastreamento",
              content:
                "Utilizamos cookies para autenticação, personalização da navegação, análise de uso e campanhas de marketing. Você pode gerenciar as preferências de cookies no seu navegador.",
            },
            {
              id: "seguranca",
              title: "6. Segurança",
              content:
                "Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perda, alteração ou destruição. Todas as transações são realizadas em ambiente seguro (SSL/HTTPS).",
            },
            {
              id: "direitos",
              title: "7. Direitos do titular",
              content:
                "Você pode solicitar a qualquer momento: confirmação da existência de tratamento, acesso, correção, anonimização, portabilidade, exclusão de dados pessoais e revogação do consentimento. Para exercer esses direitos, entre em contato pelos canais abaixo.",
            },
            {
              id: "retencao",
              title: "8. Prazo de retenção",
              content:
                "Seus dados serão mantidos pelo tempo necessário para atender às finalidades previstas nesta política, respeitando prazos legais e regulatórios (ex.: obrigações fiscais e contábeis).",
            },
            {
              id: "menores",
              title: "9. Menores de idade",
              content:
                "Nosso site não é destinado a menores de 18 anos. Caso identifiquemos o cadastro de dados pessoais de menores sem autorização dos responsáveis, providenciaremos a exclusão imediata.",
            },
            {
              id: "alteracoes",
              title: "10. Alterações",
              content:
                "Podemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes serão comunicadas por e-mail ou aviso no site.",
            },
            {
              id: "contato",
              title: "11. Contato",
              content:
                "Caso tenha dúvidas, solicitações ou queira exercer seus direitos, entre em contato: E-mail: suporte.marima.loja@gmail.com",
            },
          ].map((sec, i) => (
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
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{sec.content}</p>
              {sec.id === "contato" && (
                <div className="mt-6 flex gap-3">
                  <a
                    href="#dados-coletados"
                    className="inline-block px-4 py-2 rounded-lg bg-black text-white font-medium shadow-sm hover:scale-[1.01] transition-transform"
                  >
                    Ver dados coletados
                  </a>
                  <a
                    href="#direitos"
                    className="inline-block px-4 py-2 rounded-lg border border-black text-sm font-medium hover:bg-gray-200 transition"
                  >
                    Como exercer direitos
                  </a>
                </div>
              )}
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
