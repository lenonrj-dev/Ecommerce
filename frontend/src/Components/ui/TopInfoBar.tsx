import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent, Truck } from "lucide-react";

const TopInfoBar = () => {
  return (
    <div
      role="region"
      aria-label="Avisos da loja"
      className="w-full bg-slate-50 border-b border-slate-200/70"
    >
      <div className="mx-auto flex h-9 max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 text-xs text-slate-700 sm:px-6 sm:text-sm">
        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          <Truck size={16} strokeWidth={2} />
          <span>Frete Grátis para toda a região Sul Fluminense</span>
        </div>

        <span className="hidden h-4 w-px bg-slate-300/60 sm:block" aria-hidden="true" />

        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          <BadgePercent size={16} strokeWidth={2} />
          <span>40% OFF em todas as peças</span>
          <Link
            to="/outlet"
            className="inline-flex items-center gap-1 font-semibold text-slate-900 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
          >
            Aproveite agora
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopInfoBar;
