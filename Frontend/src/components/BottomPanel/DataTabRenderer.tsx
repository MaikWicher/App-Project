import type { DataTab } from "../../types/dataTabs";

export const DataTabRenderer: React.FC<{ tab: DataTab }> = ({ tab }) => {
  switch (tab.type) {
    case "table":
      return <div>📋 Tabela danych</div>;
    case "log":
      return <div>🧾 Logi systemowe</div>;
    case "stats":
      return <div>📊 Statystyki wydajności</div>;
    case "query":
      return <div>🧠 Wyniki zapytania SQL</div>;
    case "history":
      return <div>🕘 Historia operacji</div>;
    default:
      return null;
  }
};
