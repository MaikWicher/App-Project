import React from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const PerformanceTab: React.FC<Props> = () => {
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
                <div style={{ border: '1px solid #444', padding: 20, borderRadius: 4 }}>
                    <h4>Baza Danych</h4>
                    <div style={{ fontSize: 24, color: '#4caf50' }}>Połączono</div>
                </div>
                <div style={{ border: '1px solid #444', padding: 20, borderRadius: 4 }}>
                    <h4>Błędy / Ostrzeżenia</h4>
                    <div style={{ fontSize: 24, color: '#ff5252' }}>0 / 2</div>
                </div>
            </div>
        </div>
    );
};
