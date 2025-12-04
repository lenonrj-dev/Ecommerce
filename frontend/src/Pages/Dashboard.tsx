import { useSearchParams } from "react-router-dom";

import Sidebar from "../Components/dashboard/Sidebar";
import DadosPessoais from "../Components/dashboard/DadosPessoais";
import Devolucoes from "../Components/dashboard/Devolucoes";
import Favoritos from "../Components/dashboard/Favoritos";
import Endereco from "../Components/dashboard/Endereco";

const VALID_TABS = new Set(["dados", "favoritos", "endereco", "devolucoes"]);

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // A URL decide a aba ativa
  const urlTab = searchParams.get("tab");
  const activeTab = VALID_TABS.has(urlTab) ? urlTab : "dados";

  // Troca de aba = só atualizar a query quando necessário (sem loop)
  const setActiveTab = (nextTab) => {
    if (!VALID_TABS.has(nextTab)) return;
    if (nextTab !== activeTab) {
      setSearchParams({ tab: nextTab }, { replace: true });
      // opcional: scroll pro topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dados": return <DadosPessoais />;
      case "favoritos": return <Favoritos />;
      case "endereco": return <Endereco />;
      case "devolucoes": return <Devolucoes />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
