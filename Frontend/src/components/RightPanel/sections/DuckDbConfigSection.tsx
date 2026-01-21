import React from "react";
import { Dropdown, Option, Label, useId } from "@fluentui/react-components";
import type { VisualizationTab, DuckDBConfig } from "../../../types/visualization";
import { useTranslation } from "react-i18next";

interface Props {
    tab: VisualizationTab;
    onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const DuckDbConfigSection: React.FC<Props> = ({ tab, onUpdate }) => {
    const config = tab.content as DuckDBConfig;
    const columns = config?.columns || [];
    const xColumn = config?.xColumn;
    const yColumns = config?.yColumns || [];
    const { t } = useTranslation('common');

    const xId = useId("dd-x");
    const yId = useId("dd-y");

    const updateConfig = (newConfig: Partial<DuckDBConfig>) => {
        onUpdate(tab.id, {
            content: { ...config, ...newConfig }
        });
    };

    /* 
   * Typ Wykresu removed as it is handled by VisualizationSettings 
   */

    return (
        <div className="panel-section">
            <h4>{t('properties.axes')}</h4>

            <div className="control-group">
                <Label htmlFor={xId}>{t('properties.axisX')}</Label>
                <Dropdown
                    id={xId}
                    value={xColumn || ""}
                    onOptionSelect={(_, data) => {
                        const newX = data.optionValue as string;
                        // Remove new X from Y columns if present
                        const newY = (config?.yColumns || []).filter(c => c !== newX);
                        updateConfig({ xColumn: newX, yColumns: newY });
                    }}
                >
                    {columns.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Dropdown>
            </div>

            <div className="control-group">
                <Label htmlFor={yId}>{t('properties.valuesSeries')}</Label>
                <Dropdown
                    id={yId}
                    multiselect={true}
                    value={yColumns.length > 0 ? t('properties.selected', { count: yColumns.length }) : t('properties.select')}
                    onOptionSelect={(_, data) => updateConfig({ yColumns: data.selectedOptions })}
                >
                    {columns
                        .filter(c => c !== xColumn) // Exclude X column
                        .map(c => <Option key={c} value={c}>{c}</Option>)}
                </Dropdown>
            </div>
        </div >
    );
};
