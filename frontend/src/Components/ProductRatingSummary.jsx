"use client";
import { useEffect, useState } from "react";

const Star = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={filled ? "fill-yellow-400" : "fill-gray-300"}>
    <path d="M12 .587l3.668 7.431 8.207 1.193-5.938 5.79 1.402 8.168L12 18.896l-7.339 3.873 1.402-8.168L.125 9.211l8.207-1.193z"/>
  </svg>
);
const RatingStars = ({ value = 0 }) => {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${v} de 5`}>
      {[1,2,3,4,5].map(i => <Star key={i} filled={i <= v} />)}
    </div>
  );
};

export default function ProductRatingSummary({ productId, backendUrl }) {
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(`${backendUrl}/api/comment/${productId}?limit=1`);
        const d = await r.json();
        if (!active) return;
        if (d?.success) {
          setAvg(d.avgRating || 0);
          setTotal(d.total || 0);
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      }
    })();
    return () => { active = false; };
  }, [productId, backendUrl]);
  return (
    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
      <RatingStars value={avg} />
      <span className="ml-1">{(avg || 0).toFixed(1)}/5</span>
      <span>·</span>
      <a href="#reviews" className="hover:underline">
        {total} {total === 1 ? "avaliação" : "avaliações"}
      </a>
    </div>
  );
}
