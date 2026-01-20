import React, { useState } from "react";
import type { DataTab } from "../../../types/dataTabs";

interface Props {
    tab: DataTab;
}

export const SystemLogsTab: React.FC<Props> = () => {
    const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

    const logs = [
        { type: 'INFO', time: '12:00:01', msg: 'Aplikacja uruchomiona' },
        { type: 'INFO', time: '12:00:02', msg: 'Połączenie z backendem nawiązane' },
        { type: 'WARN', time: '12:01:45', msg: 'Dłuższy czas odpowiedzi zapytania' },
        { type: 'ERROR', time: '12:05:00', msg: 'Błąd połączenia z usługą zewnętrzną' },
    ];

    const filteredLogs = logs.filter(l => filter === 'ALL' || l.type === filter);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 0', display: 'flex', gap: 10, borderBottom: '1px solid #333' }}>
                {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: filter === f ? '#007acc' : 'transparent',
                            border: '1px solid #444',
                            color: '#ccc',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            borderRadius: 4
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <div style={{ flex: 1, fontFamily: 'monospace', background: '#000', padding: 10, overflow: 'auto', marginTop: 10 }}>
                {filteredLogs.map((log, i) => (
                    <div key={i} style={{ color: log.type === 'ERROR' ? '#ff5252' : log.type === 'WARN' ? '#ffcc00' : '#00ff00', marginBottom: 2 }}>
                        [{log.type}] {log.time} {log.msg}
                    </div>
                ))}
            </div>
        </div>
    );
};
