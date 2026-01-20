import React from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const SystemLogsTab: React.FC<Props> = ({ tab }) => {
    return (
        <div style={{ padding: 10 }}>
            <h3>Logi Systemowe</h3>
            <div style={{ fontFamily: 'monospace', background: '#000', padding: 10, height: 200, overflow: 'auto', color: '#0f0' }}>
                <div>[INFO] 12:00:01 Aplikacja uruchomiona</div>
                <div>[INFO] 12:00:02 Połączenie z backendem nawiązane</div>
                <div>[WARN] 12:01:45 Dłuższy czas odpowiedzi zapytania</div>
            </div>
        </div>
    );
};
