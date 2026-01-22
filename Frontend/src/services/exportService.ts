import { fetchTableData } from "./api";
import type { VisualizationTab } from "../types/visualization";

// Funkcja pomocnicza: Pobiera string i wymusza pobranie pliku w przeglądarce
const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- LOGIKA DLA TABELI (DUCKDB) ---
export const exportTable = async (tab: VisualizationTab) => {
    const tableName = (tab.content as any)?.tableName;
    if (!tableName) throw new Error("Brak nazwy tabeli");

    // Pobieramy dane (limit 100k wierszy dla eksportu)
    const data = await fetchTableData(tableName, 100000);

    if (!data.rows || data.rows.length === 0) {
        throw new Error("Brak danych do wyeksportowania");
    }

    // Tworzenie CSV
    const headers = data.columns.map(c => c.name).join(",");
    const rows = data.rows.map(row =>
        row.map((cell: any) => {
            if (cell === null || cell === undefined) return "";
            const str = String(cell);
            // Obsługa znaków specjalnych w CSV (przecinki, cudzysłowy)
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(",")
    ).join("\n");

    downloadCsv(`${tableName}_export.csv`, `${headers}\n${rows}`);
};

// --- LOGIKA DLA WYKRESU (CHART) ---
export const exportChart = async (tab: VisualizationTab) => {
    const content = tab.content as any;
    if (!content || !content.categories || !content.series) {
        throw new Error("Wykres nie zawiera danych");
    }

    const categories = content.categories as string[];
    const series = content.series as Array<{ name: string; data: number[] }>;

    // Nagłówek: Category, Seria1, Seria2...
    const header = ["Category", ...series.map(s => s.name)].join(",");

    // Wiersze danych
    const rows = categories.map((cat, index) => {
        const rowData = [cat];
        series.forEach(s => {
            rowData.push(String(s.data[index] ?? ""));
        });
        return rowData.join(",");
    }).join("\n");

    downloadCsv(`${tab.title}_chart_export.csv`, `${header}\n${rows}`);
};

// --- LOGIKA DLA GRAFU (GRAPH) ---
export const exportGraph = async (tab: VisualizationTab) => {
    const content = tab.content as any;
    if (!content || !content.nodes) {
        throw new Error("Graf nie zawiera danych");
    }

    const nodes = content.nodes as Array<{ data: any }>;
    const edges = (content.edges || []) as Array<{ data: any }>;

    const csvLines = ["Type,ID,Label,Source,Target,Value"];

    nodes.forEach(n => {
        const d = n.data;
        csvLines.push(`Node,${d.id},"${d.label || ""}",,,${d.value || ""}`);
    });

    edges.forEach(e => {
        const d = e.data;
        csvLines.push(`Edge,${d.id || ""},"${d.label || ""}",${d.source},${d.target},${d.value || ""}`);
    });

    downloadCsv(`${tab.title}_graph_export.csv`, csvLines.join("\n"));
};