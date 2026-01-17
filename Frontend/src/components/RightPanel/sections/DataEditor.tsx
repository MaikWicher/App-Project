import React, { useState, useEffect } from "react";
import type { VisualizationTab } from "../../../types/visualization";

interface Props {
    tab: VisualizationTab;
    onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const DataEditor: React.FC<Props> = ({ tab, onUpdate }) => {
    const [jsonContent, setJsonContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tab.content) {
            setJsonContent(JSON.stringify(tab.content, null, 2));
        }
    }, [tab.content]);

    const handleApply = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            onUpdate(tab.id, { content: parsed });
            setError(null);
        } catch (e) {
            setError("Nieprawidłowy format JSON");
        }
    };

    return (
        <section className="panel-section">
            <h4>📝 Edytor Danych (JSON)</h4>

            <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                style={{ width: "100%", height: "200px", fontFamily: "monospace", fontSize: "11px", backgroundColor: "#333", color: "#ddd", border: "1px solid #444" }}
            />

            {error && <div style={{ color: "red", fontSize: "11px", marginTop: "4px" }}>{error}</div>}

            <div className="button-row" style={{ marginTop: "8px" }}>
                <button onClick={handleApply}>Zapisz zmiany</button>
            </div>
        </section>
    );
};
