import React from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const HistoryTab: React.FC<Props> = () => {
    return (
        <div style={{ padding: 10 }}>
            <h3>Historia Operacji</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '4px 0', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#888' }}>12:15</span> Otwarto zakładkę "Sprzedaż 2024"
                </li>
                <li style={{ padding: '4px 0', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#888' }}>12:14</span> Zaimportowano plik <code>data.csv</code>
                </li>
                <li style={{ padding: '4px 0', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#888' }}>12:10</span> Uruchomiono aplikację
                </li>
            </ul>
        </div>
    );
};
