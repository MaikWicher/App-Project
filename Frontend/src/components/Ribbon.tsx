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

// 1. Narzędzia dla Tabeli (Zintegrowane w Ribbon)

// 2. Narzędzia dla Grafów (Zintegrowane w Ribbon)
// 3. Ustawienia (Zintegrowane w Ribbon)

// --- GŁÓWNY KOMPONENT RIBBON ---

interface RibbonProps {
    activeTab: VisualizationTab | null;
}

export const Ribbon: React.FC<RibbonProps> = ({ activeTab }) => {
    const styles = useStyles();
    const { t } = useTranslation(['common', 'menu']);

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
                        <div style={{ minWidth: '200px', marginRight: '8px' }}>
                            <SearchBox
                                placeholder={t('menu:searchPlaceholder')}
                                onChange={(_, data) => console.log("Szukam:", data.value)}
                                size="small"
                            />
                        </div>

                        <ToolbarDivider />

                        <ToolbarButton
                            appearance="subtle"
                            icon={<FilterRegular />}
                            onClick={() => console.log("Otwórz filtry")}
                        >
                            {t('menu:filters')}
                        </ToolbarButton>

                        <ToolbarButton
                            appearance="subtle"
                            icon={<ArrowClockwiseRegular />}
                            onClick={() => console.log("Refresh triggered")}
                        >
                            {t('actions.refresh')}
                        </ToolbarButton>
                        <ToolbarDivider />
                        <ToolbarButton
                            appearance={isEditing ? "primary" : "subtle"}
                            icon={isEditing ? <CheckmarkRegular /> : <EditRegular />}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? t('menu:stopEdit') : t('menu:editMode')}
                        </ToolbarButton>
                        <ToolbarDivider />
                    </>
                )}

                {/* B. Sekcja Grafów */}
                {activeTab?.type === "graph" && (
                    <>
                        <Menu>
                            <MenuTrigger disableButtonEnhancement>
                                <ToolbarButton appearance="subtle" icon={<DataScatterRegular />}>
                                    {t('menu:layout')}
                                </ToolbarButton>
                            </MenuTrigger>
                            <MenuPopover>
                                <MenuList>
                                    <MenuItem>{t('menu:layoutType.forceAtlas2')}</MenuItem>
                                    <MenuItem>{t('menu:layoutType.circle')}</MenuItem>
                                    <MenuItem>{t('menu:layoutType.hierarchical')}</MenuItem>
                                </MenuList>
                            </MenuPopover>
                        </Menu>

                        <ToolbarDivider />

                        <ToolbarButton appearance="subtle" icon={<PlayRegular />}>
                            {t('menu:startSimulation')}
                        </ToolbarButton>
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
                    {activeTab ? activeTab.title : t('mainPanel.noVisualization')}
                </div>

                {/* Separator */}
                <div style={{ width: 1, height: 20, background: '#444', margin: '0 8px' }} />

                <LanguageSelector />
                <ToolbarButton appearance="subtle" icon={<SettingsRegular />}>
                    {t('menu:settings')}
                </ToolbarButton>
            </div>
        </div>
    );
};