import React from "react";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";

interface Props {
    tab: VisualizationTab;
    onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const ManualDataSection: React.FC<Props> = ({ tab, onUpdate }) => {
    const config = tab.content as any;

    if (!config) return null;

    const updateConfig = (changes: Partial<ChartConfig>) => {
        onUpdate(tab.id, { content: { ...config, ...changes } });
    };

    return (
        <div className="panel-section">
            <h4>Osie Wykresu</h4>

            <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>Oś X</span>
                    <button onClick={() => updateConfig({ categories: [...(config.categories || []), `Kat. ${(config.categories?.length || 0) + 1}`] })} style={{ fontSize: "10px", padding: "2px 5px" }}>+ Dodaj</button>
                </div>
                <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #444", padding: "5px" }}>
                    {(config.categories || []).map((cat: string, idx: number) => (
                        <div key={idx} style={{ display: "flex", gap: "5px", marginBottom: "2px" }}>
                            <input
                                value={cat}
                                onChange={(e) => {
                                    const newCats = [...(config.categories || [])];
                                    newCats[idx] = e.target.value;
                                    updateConfig({ categories: newCats });
                                }}
                                style={{ width: "100%", fontSize: "11px", padding: "2px", background: "#222", border: "1px solid #555", color: "#eee" }}
                            />
                            <button
                                onClick={() => {
                                    const newCats = (config.categories || []).filter((_: any, i: number) => i !== idx);
                                    // Also remove data points at this index for all series
                                    const newSeries = (config.series || []).map((s: any) => ({
                                        ...s,
                                        data: s.data.filter((_: any, i: number) => i !== idx)
                                    }));
                                    updateConfig({ categories: newCats, series: newSeries });
                                }}
                                style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                            >🗑️</button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>Wartości (Serie)</span>
                    <button onClick={() => {
                        const newSeries = [...(config.series || []), { name: `Seria ${(config.series?.length || 0) + 1}`, data: new Array((config.categories?.length || 0)).fill(0) }];
                        updateConfig({ series: newSeries });
                    }} style={{ fontSize: "10px", padding: "2px 5px" }}>+ Dodaj Serię</button>
                </div>
                <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #444", padding: "5px" }}>
                    {(config.series || []).map((s: any, sIdx: number) => (
                        <div key={sIdx} style={{ marginBottom: "10px", background: "#2a2a2a", padding: "5px", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                <input
                                    value={s.name}
                                    onChange={(e) => {
                                        const newSeries = [...(config.series || [])];
                                        newSeries[sIdx] = { ...s, name: e.target.value };
                                        updateConfig({ series: newSeries });
                                    }}
                                    style={{ width: "70%", fontSize: "11px", fontWeight: "bold", background: "transparent", border: "none", color: "#fff" }}
                                />
                                <button
                                    onClick={() => {
                                        const newSeries = (config.series || []).filter((_: any, i: number) => i !== sIdx);
                                        updateConfig({ series: newSeries });
                                    }}
                                    style={{ color: "red", fontSize: "10px", cursor: "pointer", background: "none", border: "none" }}
                                >
                                    Usuń Serię
                                </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
                                {(config.categories || []).map((cat: string, cIdx: number) => (
                                    <div key={cIdx} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                        <span style={{ fontSize: "9px", color: "#888", width: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}:</span>
                                        <input
                                            type="number"
                                            value={s.data[cIdx] || 0}
                                            onChange={(e) => {
                                                const newSeries = [...(config.series || [])];
                                                const newData = [...s.data];
                                                newData[cIdx] = parseFloat(e.target.value) || 0;
                                                newSeries[sIdx] = { ...s, data: newData };
                                                updateConfig({ series: newSeries });
                                            }}
                                            style={{ width: "40px", fontSize: "10px", padding: "1px", background: "#222", border: "1px solid #555", color: "#eee" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
