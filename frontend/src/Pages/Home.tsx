import { useMemo } from "react";
import { motion as Motion } from "framer-motion";

// EXISTENTES
import Hero from "../Components/Hero";
import ProductCarousel from "../Components/CarrouselProd";
import LatestCollection from "../Components/LatestCollection";
import Banner from "../Components/Banner";
import BestSeller from "../Components/BestSeller";
import OurPolicies from "../Components/OurPolicies";
import NewsLetterBox from "../Components/NewsLetterBox";

// NOVOS (crie os arquivos depois)
import SeoHead from "../Components/seo/SeoHead";
import UspBar from "../Components/home/UspBar";
import CategoryHighlights from "../Components/home/CategoryHighlights";
import BlogTeasers from "../Components/home/BlogTeasers";
import SocialGrid from "../Components/home/SocialGrid";
import SeoRichText from "../Components/seo/SeoRichText";
import CtaStrip from "../Components/home/CtaStrip";
import { assets } from "../assets/assets";
import Banner2 from "../Components/Banner2";

const Home = () => {
  // JSON-LD dinâmico mínimo
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Marima - Moda Fitness",
      url: `${import.meta.env.VITE_FRONTEND_URL || "https://example.com"}`,
      potentialAction: {
        "@type": "SearchAction",
        target: `${
          import.meta.env.VITE_FRONTEND_URL || "https://example.com"
        }/outlet?busca={query}`,
        "query-input": "required name=query",
      },
    }),
    []
  );

  const orgJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Marima",
      url: `${import.meta.env.VITE_FRONTEND_URL || "https://example.com"}`,
      logo: `${
        import.meta.env.VITE_FRONTEND_URL || "https://example.com"
      }/logo.png`,
      sameAs: [
        "https://www.instagram.com/use.marima.ofc/",
        "https://www.facebook.com/people/Marima/61579379169198/?mibextid=wwXIfr&rdid=7tGilGnqPa6S0Q0M&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FGBqEE2W3%2F%3Fmibextid%3DwwXIfr",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Volta Redonda",
        addressRegion: "RJ",
        addressCountry: "BR",
      },
    }),
    []
  );

  return (
    <>
      {/* SEO essentials */}
      <SeoHead
        title="Marima • Moda Fitness feminina - Conforto, Estilo e Performance"
        description="Roupas fitness com tecnologia e caimento perfeito. Entrega rápida, compra segura e troca facilitada. Confira leggings, tops, macacões e shorts."
        jsonLd={[jsonLd, orgJsonLd]}
        openGraph={{
          title: "Marima • Moda Fitness",
          description:
            "Conforto, estilo e performance — descubra a nova coleção fitness.",
          image: assets.Mobile1, // <- substituído
        }}
      />

      {/* HERO */}
      <Hero />

      {/* USP / Trust bar */}
      <UspBar
        items={[
          { icon: "Truck", title: "Entrega rápida", desc: "2-7 dias úteis" },
          {
            icon: "RefreshCcw",
            title: "Troca garantida",
            desc: "Até 7 dias (CDC)",
          },
          {
            icon: "Shield",
            title: "Compra segura",
            desc: "Site com SSL de Segurança Na hora do Seu Pagamento",
          },
          {
            icon: "CreditCard",
            title: "Pagamentos",
            desc: "Pix, Cartão Parcelamento Disponível, Boleto",
          },
        ]}
      />

      {/* Destaques de Categoria (atalhos) */}
      <CategoryHighlights
        items={[
          {
            title: "Regata Casual",
            href: "/casual?type=Regata",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764855827/products/a5kjb0rlu98koit3ffzo.png",
          },
          {
            title: "Croped Casual",
            href: "/casual?type=Croped",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764855747/products/mvekllxqz52g2edao9ns.png",
          },
          {
            title: "Short Casual",
            href: "/casual?type=Short",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764855534/products/mp8y2p2opjiowzu3bfaq.png",
          },
          {
            title: "Leggings Fitness",
            href: "/fitness?type=Calça",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764855991/products/csbtyacmeqjuy5j3pmhf.png",
          },
          {
            title: "Tops Fitness",
            href: "/fitness?type=Top",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764856074/products/gwlegpjshwb5s17i1ppf.png",
          },
          {
            title: "Macacões Fitness",
            href: "/fitness?type=Macacão",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764856237/products/p59d2ei7qeree4mndk9u.png",
          },
          {
            title: "Shorts Fitness",
            href: "/fitness?type=Short",
            image:
              "https://res.cloudinary.com/dxeooztro/image/upload/v1764856168/products/qy8fuhijwphzusyfqxhl.png",
          },
        ]}
      />

      <Banner2 />

      {/* Carrossel de produtos */}
      <ProductCarousel />

      {/* Coleção mais recente */}
      <LatestCollection />

      {/* Banner promocional */}
      <Banner />

      {/* Mais vendidos */}
      <BestSeller />

      {/* Teasers de Conteúdo (Blog/Guias) 
      <BlogTeasers
        posts={[
          {
            title: "Guia de Leggings: como escolher o tecido ideal",
            href: "/blog/guia-leggings",
            image: assets.post1, // <- substituído
          },
          {
            title: "Top Fitness: suporte para cada treino",
            href: "/blog/top-esportivo",
            image: assets.post2, // <- substituído
          },
          {
            title: "Look Gym-To-Street: do treino ao dia a dia",
            href: "/blog/gym-to-street",
            image: assets.Mobile1, // <- substituído
          },
        ]}
      />*/}

      {/* Bloco de Conteúdo SEO */}
      <SeoRichText
        title="Moda Fitness e Athleisure para a sua Black Friday"
        paragraphs={[
          "Na Marima você encontra peças de moda fitness e athleisure que unem desempenho, conforto e estilo, com tecnologia têxtil, compressão na medida e toque macio para acompanhar o seu ritmo dentro e fora da academia.",
          "Aproveite a Black Friday Marima para explorar leggings, tops esportivos, macacões e shorts com ofertas especiais — modelagens versáteis que valorizam diferentes corpos, entrega rápida, troca facilitada e descontos exclusivos por tempo limitado. Garanta agora seus looks favoritos antes que acabem.",
        ]}
        links={[
          { label: "Linha Casual", href: "/casual" },
          { label: "Linha Fitness", href: "/fitness" },
          { label: "Outlet", href: "/outlet" },
          { label: "Política de Privacidade", href: "/privacidade" },
          { label: "Política de Entrega", href: "/entrega" },
        ]}
      />

      {/* Social / Instagram grid */}
      <SocialGrid
        username="use.marima.ofc"
        images={[
          assets.topr, // <- substituídos
          assets.angell,
          assets.macaco,
          assets.shorts,
        ]}
        ctaHref="https://www.instagram.com/use.marima.ofc/"
      />

      {/* Políticas */}
      <OurPolicies />

      {/* CTA final */}
      <CtaStrip
        title="Pronta para elevar seu treino?"
        subtitle="Conheça a coleção fitness com tecnologia e conforto."
        primary={{ label: "Ver coleção Fitness", href: "/fitness" }}
        secondary={{ label: "Falar com suporte", href: "/contato" }}
      />

      {/* Newsletter */}
      <NewsLetterBox />
    </>
  );
};

export default Home;
