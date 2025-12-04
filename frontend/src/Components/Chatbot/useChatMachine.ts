import { useEffect, useReducer, useState } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "SET_FLOW":
      return { ...state, flow: action.flow, currentId: action.flow.entry, history: [] };
    case "GO_TO":
      return { ...state, currentId: action.id, history: [...state.history, action.id] };
    case "RESET":
      return { ...state, currentId: state.flow?.entry || "start", history: [] };
    default:
      return state;
  }
}

export function useChatMachine() {
  const [state, dispatch] = useReducer(reducer, { flow: null, currentId: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/chat/flow");
        const flow = await res.json();
        dispatch({ type: "SET_FLOW", flow });
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar o chat.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentNode = state.flow?.nodes?.[state.currentId] || null;

  const runAction = async (action) => {
    if (!action) return;
    switch (action.type) {
      case "open_url":
        window.open(action.url, "_blank", "noopener,noreferrer");
        break;
      case "navigate":
        // se usa react-router-dom
        window.location.href = action.to;
        break;
      // Exemplos de ações extras:
      // case "apply_coupon": await fetch(`/api/coupon/apply?code=${action.code}`, { credentials: 'include'}); break;
      // case "fetch_products": ...  // pode abrir modal com resultados
      default:
        // no-op para tipos desconhecidos
        break;
    }
  };

  const chooseOption = async (option) => {
    if (option.action) {
      await runAction(option.action);
    }
    if (option.next) {
      dispatch({ type: "GO_TO", id: option.next });
    }
  };

  const reset = () => dispatch({ type: "RESET" });

  return { loading, error, flow: state.flow, currentNode, chooseOption, reset };
}
