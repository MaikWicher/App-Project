import React, { useState } from "react";
import {
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
    makeStyles,
    shorthands,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    SearchBox
} from "@fluentui/react-components";
import {
    ArrowDownloadRegular,
    EditRegular,
    ArrowClockwiseRegular,
    CheckmarkRegular,
    DataScatterRegular,
    PlayRegular,
    SettingsRegular,
    FilterRegular
} from "@fluentui/react-icons";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import type { VisualizationTab } from "../types/visualization";
import { exportTable, exportChart, exportGraph } from "../services/exportService";

const useStyles = makeStyles({
    container: {
        ...shorthands.padding("8px", "16px"),
        backgroundColor: "#292929",
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    metaInfo: {
        color: '#888',
        fontSize: '12px'
    }
});

// 1. Narzędzia dla Tabeli (Widoczne przy analizie danych)
const DataTools = ({ onRefresh, onToggleEdit, isEditing, onSearch, onFilterClick }: {
    onRefresh: () => void,
    onToggleEdit: (val: boolean) => void,
    isEditing: boolean,
    onSearch: (val: string) => void,
    onFilterClick: () => void
}) => (
    <>
        <div style={{ minWidth: '200px', marginRight: '8px' }}>
            <SearchBox
                placeholder="Szukaj..."
                onChange={(_, data) => onSearch(data.value)}
                size="small"
            />
        </div>

        <ToolbarDivider />

        <ToolbarButton
            appearance="subtle"
            icon={<FilterRegular />}
            onClick={onFilterClick}
        >
            Filtry
        </ToolbarButton>

        <ToolbarButton
            appearance="subtle"
            icon={<ArrowClockwiseRegular />}
            onClick={onRefresh}
        >
            Odśwież
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
            appearance={isEditing ? "primary" : "subtle"}
            icon={isEditing ? <CheckmarkRegular /> : <EditRegular />}
            onClick={() => onToggleEdit(!isEditing)}
        >
            {isEditing ? "Zakończ edycję" : "Edytuj dane"}
        </ToolbarButton>
    </>
);

// 2. Narzędzia dla Grafów (Widoczne przy wizualizacji grafowej)
const GraphTools = () => (
    <>
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <ToolbarButton appearance="subtle" icon={<DataScatterRegular />}>
                    Układ
                </ToolbarButton>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem>Force Atlas 2</MenuItem>
                    <MenuItem>Kołowy (Circle)</MenuItem>
                    <MenuItem>Hierarchiczny</MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>

        <ToolbarDivider />

        <ToolbarButton appearance="subtle" icon={<PlayRegular />}>
            Start Symulacji
        </ToolbarButton>
    </>
);

// 3. Przycisk Ustawień Aplikacji (Zawsze widoczny)
const AppSettings = () => (
    <ToolbarButton appearance="subtle" icon={<SettingsRegular />}>
        Ustawienia
    </ToolbarButton>
);

// --- GŁÓWNY KOMPONENT RIBBON ---

interface RibbonProps {
    activeTab: VisualizationTab | null;
}

export const Ribbon: React.FC<RibbonProps> = ({ activeTab }) => {
    const styles = useStyles();
    const { t } = useTranslation('common');

    // Stany lokalne (w przyszłości można przenieść do Context/Redux)
    const [exporting, setExporting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Czy obecna karta pozwala na eksport?
    const canExport = activeTab && ["duckdb", "chart", "graph"].includes(activeTab.type);

    const handleExportClick = async () => {
        if (!activeTab || !canExport) return;
        setExporting(true);

        try {
            switch (activeTab.type) {
                case "duckdb":
                    await exportTable(activeTab);
                    break;
                case "chart":
                    await exportChart(activeTab);
                    break;
                case "graph":
                    await exportGraph(activeTab);
                    break;
            }
        } catch (e: any) {
            console.error(e);
            alert(t('error') + ": " + e.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* LEWA STRONA: Narzędzia kontekstowe (zmieniają się zależnie od taba) */}
            <Toolbar aria-label="Ribbon tools">

                {/* A. Sekcja Analizy Danych */}
                {activeTab?.type === "duckdb" && (
                    <>
                        <DataTools
                            onRefresh={() => console.log("Refresh triggered")}
                            onToggleEdit={setIsEditing}
                            isEditing={isEditing}
                            onSearch={(val) => console.log("Szukam:", val)}
                            onFilterClick={() => console.log("Otwórz filtry")}
                        />
                        <ToolbarDivider />
                    </>
                )}

                {/* B. Sekcja Grafów */}
                {activeTab?.type === "graph" && (
                    <>
                        <GraphTools />
                        <ToolbarDivider />
                    </>
                )}

                {/* C. Sekcja Eksportu (Wspólna) */}
                <ToolbarButton
                    appearance="subtle"
                    icon={<ArrowDownloadRegular />}
                    disabled={!canExport || exporting}
                    onClick={handleExportClick}
                >
                    {exporting ? t('loading') : t('actions.export')}
                </ToolbarButton>
            </Toolbar>

            {/* PRAWA STRONA: Informacje i Ustawienia */}
            <div className={styles.rightSection}>
                <div className={styles.metaInfo}>
                    {activeTab ? activeTab.title : "Brak aktywnej karty"}
                </div>

                {/* Separator */}
                <div style={{ width: 1, height: 20, background: '#444', margin: '0 8px' }} />

                <LanguageSelector />
                <AppSettings />
            </div>
        </div>
    );
};