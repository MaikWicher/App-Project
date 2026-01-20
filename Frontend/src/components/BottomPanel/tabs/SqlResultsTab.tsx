import React from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const SqlResultsTab: React.FC<Props> = () => {
    return (
        <div style={{ padding: 10 }}>
            <h3>Wyniki SQL</h3>
            <textarea
                style={{ width: '100%', height: 60, background: '#333', color: '#fff', border: '1px solid #555', fontFamily: 'monospace' }}
                placeholder="Wpisz zapytanie SQL..."
            />
            <div style={{ marginTop: 10 }}>
                <button style={{ padding: '4px 12px', cursor: 'pointer' }}>Wykonaj</button>
            </div>
            <div style={{ marginTop: 10, borderTop: '1px solid #444', paddingTop: 10 }}>
                <em>Brak wyników do wyświetlenia.</em>
            </div>
        </div>
    );
};
