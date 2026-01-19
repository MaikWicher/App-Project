
import React, { useState } from 'react';
import { DataChart } from '../../DataChart';
import type { DuckDBConfig, VisualizationTab } from "../../../types/visualization";
import { Dropdown, Option, Label, useId } from "@fluentui/react-components";

interface DuckDbViewProps {
    tab: VisualizationTab;
}

export const DuckDbView: React.FC<DuckDbViewProps> = ({ tab }) => {
    // Read table name from tab content
    const config = tab.content as DuckDBConfig;
    const tableName = config?.tableName;

    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const dropdownId = useId("dropdown-viz-type");

    if (!tableName) {
        return <div style={{ padding: 20 }}>Brak wybranej tabeli. Wybierz tabelę z paska bocznego.</div>;
    }

    return (
        <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <h2>Dane: {tableName}</h2>
                <div>
                    <Label id={dropdownId}>Wizualizacja: </Label>
                    <Dropdown
                        aria-labelledby={dropdownId}
                        value={chartType === 'line' ? 'Wykres Liniowy' : 'Wykres Słupkowy'}
                        onOptionSelect={(_, data) => setChartType(data.optionValue as 'line' | 'bar')}
                    >
                        <Option value="line">Wykres Liniowy</Option>
                        <Option value="bar">Wykres Słupkowy</Option>
                    </Dropdown>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <DataChart tableName={tableName} chartType={chartType} />
            </div>
        </div>
    );
};
