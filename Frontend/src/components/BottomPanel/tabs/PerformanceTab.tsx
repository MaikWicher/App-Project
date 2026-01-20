import React from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const PerformanceTab: React.FC<Props> = ({ tab }) => {
    return (
        <div style={{ padding: 10 }}>
            <h3>Statystyki Wydajności</h3>
            <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ border: '1px solid #444', padding: 20, borderRadius: 4 }}>
                    <h4>CPU</h4>
                    <div style={{ fontSize: 24, color: '#00ccff' }}>12%</div>
                </div>
                <div style={{ border: '1px solid #444', padding: 20, borderRadius: 4 }}>
                    <h4>RAM</h4>
                    <div style={{ fontSize: 24, color: '#ffcc00' }}>450 MB</div>
                </div>
                <div style={{ border: '1px solid #444', padding: 20, borderRadius: 4 }}>
                    <h4>Zapytania</h4>
                    <div style={{ fontSize: 24, color: '#00ff99' }}>24ms</div>
                </div>
            </div>
        </div>
    );
};
