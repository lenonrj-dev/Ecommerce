import { Helmet } from "react-helmet";
export default function SeoHead({ title, description, openGraph, jsonLd = [] }) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {openGraph?.title && <meta property="og:title" content={openGraph.title} />}
      {openGraph?.description && (
        <meta property="og:description" content={openGraph.description} />
      )}
      {openGraph?.image && <meta property="og:image" content={openGraph.image} />}
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
