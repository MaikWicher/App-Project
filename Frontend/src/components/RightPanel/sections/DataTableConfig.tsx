import React, { useState } from "react";
import type { DataTab } from "../../../types/dataTabs";
import { useTranslation } from "react-i18next";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';

interface Props {
    tab: DataTab;
    onUpdate: (id: string, changes: Partial<DataTab>) => void;
}

function SortableItem(props: { id: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        padding: '8px',
        background: '#333',
        marginBottom: '4px',
        borderRadius: '4px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none' as const,
        border: '1px solid #444'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <span style={{ color: '#888', fontSize: '12px', cursor: 'grab' }}>⋮⋮</span>
            <span style={{ fontSize: '13px' }}>{props.id}</span>
        </div>
    );
}

export const DataTableConfig: React.FC<Props> = ({ tab, onUpdate }) => {
    const { t } = useTranslation();
    const [selectedSortCol, setSelectedSortCol] = useState("");
    const [selectedGroupedCol, setSelectedGroupedCol] = useState("");
    const [selectedFilterCol, setSelectedFilterCol] = useState("");
    const [filterSetName, setFilterSetName] = useState("");

    const updateSearch = (changes: Partial<typeof tab.search>) => {
        onUpdate(tab.id, { search: { ...tab.search, ...changes } });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = (tab.content?.columns || []).indexOf(active.id as string);
            const newIndex = (tab.content?.columns || []).indexOf(over?.id as string);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newColumns = arrayMove((tab.content?.columns || []), oldIndex, newIndex);
                onUpdate(tab.id, { content: { ...tab.content!, columns: newColumns } });
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Wyszukiwanie */}
            <div className="panel-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>🔍 {t('dataConfig.search.title')}</h4>
                    <button
                        className="btn-icon"
                        style={{ background: '#333', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => {
                            // Add a new empty global search term
                            const currentTerms = tab.search?.terms || [];
                            updateSearch({ terms: [...currentTerms, ""] });
                        }}
                    >
                        +
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Render Global Search Terms */}
                    {(tab.search?.terms && tab.search.terms.length > 0 ? tab.search.terms : [""]).map((globalTerm, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder={t('dataConfig.search.placeholder')}
                                value={globalTerm}
                                onChange={e => {
                                    const newTerms = [...(tab.search?.terms || [""])];
                                    newTerms[idx] = e.target.value;
                                    updateSearch({ terms: newTerms });
                                }}
                                style={{ flex: 1, padding: 6, borderRadius: 4, background: '#333', border: '1px solid #555', color: '#fff' }}
                            />
                            {idx > 0 && (
                                <button
                                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 2 }}
                                    onClick={() => {
                                        const newTerms = (tab.search?.terms || [""]).filter((_, i) => i !== idx);
                                        updateSearch({ terms: newTerms });
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Separator if column filters exist */}
                    {Object.keys(tab.search?.columns || {}).length > 0 && <hr style={{ border: 'none', borderTop: '1px solid #444', margin: '8px 0' }} />}

                    {/* Existing Column Filters Display (Legacy/Hidden support) */}
                    {tab.search?.columns && Object.entries(tab.search.columns).map(([col, val]) => (
                        <div key={col} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 'bold', width: '30%', color: '#aaa' }}>{col}:</span>
                            <input
                                type="text"
                                value={val}
                                onChange={(e) => {
                                    const newCols = { ...tab.search!.columns, [col]: e.target.value };
                                    updateSearch({ columns: newCols });
                                }}
                                style={{ flex: 1, padding: 6, borderRadius: 4, background: '#333', border: '1px solid #555', color: '#fff' }}
                            />
                            <button
                                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 2 }}
                                onClick={() => {
                                    const newCols = { ...tab.search!.columns };
                                    delete newCols[col];
                                    updateSearch({ columns: newCols });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                </div>
            </div>

            {/* Sortowanie */}
            <div className="panel-section">
                <h4>⇅ {t('dataConfig.sort.title')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <select
                            style={{ flex: 1, padding: 6, background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 4 }}
                            value={selectedSortCol}
                            onChange={e => setSelectedSortCol(e.target.value)}
                        >
                            <option value="">{t('dataConfig.common.selectColumn')}</option>
                            {tab.content?.columns?.map((col: string) => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                if (!selectedSortCol) return;
                                const baseSorting = tab.sorting || { columns: [], isMultiSort: false, isCustomSort: false, isStandardSort: false, useCalculatedValues: false };
                                const currentSorts = baseSorting.columns || [];
                                // Check if already exists
                                if (currentSorts.some(s => s.column === selectedSortCol)) return;

                                const newSorts = [...currentSorts, { column: selectedSortCol, direction: 'asc' as const }];
                                onUpdate(tab.id, { sorting: { ...baseSorting, columns: newSorts } });
                                setSelectedSortCol("");
                            }}
                            disabled={!selectedSortCol}
                        >
                            {t('dataConfig.sort.add')}
                        </button>
                    </div>

                    {/* Lista aktywnych sortowań */}
                    <div style={{ background: '#252526', padding: 8, borderRadius: 4 }}>
                        {(!tab.sorting?.columns || tab.sorting.columns.length === 0) && (
                            <div style={{ color: '#888', fontStyle: 'italic', fontSize: 12 }}>{t('dataConfig.sort.noRules')}</div>
                        )}
                        {tab.sorting?.columns?.map((sort) => (
                            <div key={sort.column} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 13, background: '#333', padding: '4px 8px', borderRadius: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' }}>
                                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{sort.column}</span>
                                    <select
                                        value={sort.direction}
                                        onChange={(e) => {
                                            const newDirection = e.target.value as any;
                                            const newSorts = tab.sorting?.columns.map(s => s.column === sort.column ? { ...s, direction: newDirection } : s) || [];
                                            onUpdate(tab.id, { sorting: { ...tab.sorting!, columns: newSorts } });
                                        }}
                                        style={{
                                            background: '#252526',
                                            color: 'white',
                                            border: '1px solid #555',
                                            borderRadius: 4,
                                            padding: 2,
                                            fontSize: 12,
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                    >
                                        <option value="none">{t('dataConfig.sort.direction.none')}</option>
                                        <option value="asc">{t('dataConfig.sort.direction.asc')}</option>
                                        <option value="desc">{t('dataConfig.sort.direction.desc')}</option>
                                        <option value="calculated">{t('dataConfig.sort.direction.calculated')}</option>
                                    </select>
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                                        onClick={() => {
                                            const newSorts = tab.sorting?.columns.filter(s => s.column !== sort.column) || [];
                                            onUpdate(tab.id, { sorting: { ...tab.sorting!, columns: newSorts } });
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kolejność Kolumn */}
            <div className="panel-section">
                <h4>↔ {t('dataConfig.columns.title')}</h4>
                <div style={{ padding: 8, background: '#252526', marginBottom: 8, borderRadius: 4 }}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tab.content?.columns || []}
                            strategy={verticalListSortingStrategy}
                        >
                            {tab.content?.columns?.map((col: string) => (
                                <SortableItem key={col} id={col} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            if (tab.content?.defaultColumns) {
                                onUpdate(tab.id, { content: { ...tab.content, columns: tab.content.defaultColumns } });
                            }
                        }}
                    >
                        {t('dataConfig.columns.reset')}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            if (tab.content?.columns) {
                                onUpdate(tab.id, { content: { ...tab.content, defaultColumns: tab.content.columns } });
                            }
                        }}
                    >
                        {t('dataConfig.columns.save')}
                    </button>
                </div>
            </div>

            {/* Grupowanie */}
            <div className="panel-section">
                <h4>📂 {t('dataConfig.grouping.title')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Główna kolumna */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#aaa' }}>{t('dataConfig.grouping.mainColumn')}</div>
                        <select
                            style={{ width: '100%', padding: 6, background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 4 }}
                            value={tab.grouping?.groupByColumn || ""}
                            onChange={e => {
                                const val = e.target.value;
                                const currentGrouped = tab.grouping?.groupedColumns || [];
                                onUpdate(tab.id, {
                                    grouping: {
                                        groupByColumn: val,
                                        groupedColumns: currentGrouped.filter(c => c !== val)
                                    }
                                });
                            }}
                        >
                            <option value="">{t('dataConfig.grouping.selectMainColumn')}</option>
                            {tab.content?.columns?.map((col: string) => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kolumny podrzędne (zgrupowane) */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#aaa' }}>{t('dataConfig.grouping.groupedColumns')}</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            <select
                                style={{ flex: 1, padding: 6, background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 4 }}
                                value={selectedGroupedCol}
                                onChange={e => setSelectedGroupedCol(e.target.value)}
                            >
                                <option value="">{t('dataConfig.common.selectColumn')}</option>
                                {tab.content?.columns?.filter((c: string) =>
                                    c !== tab.grouping?.groupByColumn &&
                                    !tab.grouping?.groupedColumns?.includes(c)
                                ).map((col: string) => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    if (!selectedGroupedCol) return;
                                    const current = tab.grouping?.groupedColumns || [];
                                    if (current.includes(selectedGroupedCol)) return;
                                    onUpdate(tab.id, {
                                        grouping: {
                                            groupByColumn: tab.grouping?.groupByColumn || "",
                                            groupedColumns: [...current, selectedGroupedCol]
                                        }
                                    });
                                    setSelectedGroupedCol("");
                                }}
                                disabled={!selectedGroupedCol}
                            >
                                +
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {tab.grouping?.groupedColumns?.map((g: string) => (
                                <div key={g} style={{ background: '#252526', padding: '2px 6px', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #444' }}>
                                    {g}
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 0, display: 'flex' }}
                                        onClick={() => {
                                            const newGroups = tab.grouping?.groupedColumns.filter((x: string) => x !== g) || [];
                                            onUpdate(tab.id, {
                                                grouping: {
                                                    groupByColumn: tab.grouping?.groupByColumn || "",
                                                    groupedColumns: newGroups
                                                }
                                            });
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtrowanie */}
            <div className="panel-section">
                <h4>Y {t('dataConfig.filtering.title')}</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select
                        style={{ flex: 1, padding: 6, background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 4 }}
                        value={selectedFilterCol}
                        onChange={e => setSelectedFilterCol(e.target.value)}
                    >
                        <option value="">{t('dataConfig.common.selectColumn')}</option>
                        {tab.content?.columns?.map((col: string) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            if (!selectedFilterCol) return;
                            const currentFilters = (tab.filters as any[]) || [];
                            const newFilter = {
                                id: crypto.randomUUID(),
                                column: selectedFilterCol,
                                operator: 'contains',
                                value: ''
                            };
                            onUpdate(tab.id, { filters: [...currentFilters, newFilter] as any });
                            setSelectedFilterCol("");
                        }}
                        disabled={!selectedFilterCol}
                    >
                        {t('dataConfig.filtering.add')}
                    </button>
                </div>

                {/* Active Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {((tab.filters as any[]) || []).map((filter: any, idx: number) => (
                        <div key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#252526', padding: 4, borderRadius: 4 }}>
                            <div style={{ fontSize: 11, fontWeight: 'bold', width: '60px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={filter.column}>
                                {filter.column}
                            </div>
                            <select
                                value={filter.operator}
                                onChange={(e) => {
                                    const newFilters = [...((tab.filters as any[]) || [])];
                                    newFilters[idx] = { ...filter, operator: e.target.value };
                                    onUpdate(tab.id, { filters: newFilters as any });
                                }}
                                style={{
                                    width: '80px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: 2, fontSize: 11
                                }}
                            >
                                <option value="eq">=</option>
                                <option value="neq">!=</option>
                                <option value="gt">&gt;</option>
                                <option value="lt">&lt;</option>
                                <option value="gte">&gt;=</option>
                                <option value="lte">&lt;=</option>
                                <option value="contains">{t('dataConfig.filtering.operators.contains')}</option>
                                <option value="starts">{t('dataConfig.filtering.operators.starts')}</option>
                                <option value="ends">{t('dataConfig.filtering.operators.ends')}</option>
                            </select>
                            <input
                                type="text"
                                value={filter.value}
                                placeholder={t('dataConfig.filtering.valuePlaceholder')}
                                onChange={(e) => {
                                    const newFilters = [...((tab.filters as any[]) || [])];
                                    newFilters[idx] = { ...filter, value: e.target.value };
                                    onUpdate(tab.id, { filters: newFilters as any });
                                }}
                                style={{ flex: 1, padding: 4, borderRadius: 4, background: '#333', border: '1px solid #555', color: '#fff', fontSize: 12, minWidth: 0 }}
                            />
                            <button
                                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 2 }}
                                onClick={() => {
                                    const newFilters = ((tab.filters as any[]) || []).filter(f => f.id !== filter.id);
                                    onUpdate(tab.id, { filters: newFilters as any });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {(!tab.filters || (tab.filters as any[]).length === 0) && (
                        <div style={{ color: '#888', fontStyle: 'italic', fontSize: 12 }}>{t('dataConfig.filtering.noFilters')}</div>
                    )}
                </div>

                <div style={{ marginTop: 16, borderTop: '1px solid #444', paddingTop: 8 }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: 12, color: '#aaa' }}>{t('dataConfig.filtering.savedSets')}</h5>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                        <input
                            type="text"
                            placeholder={t('dataConfig.filtering.setNamePlaceholder')}
                            value={filterSetName}
                            onChange={(e) => setFilterSetName(e.target.value)}
                            style={{ flex: 1, padding: 4, borderRadius: 4, background: '#333', border: '1px solid #555', color: '#fff', fontSize: 12 }}
                        />
                        <button
                            className="btn-secondary"
                            disabled={!filterSetName || !tab.filters || (tab.filters as any[]).length === 0}
                            onClick={() => {
                                const currentSaved = tab.savedFilterSets || {};
                                onUpdate(tab.id, {
                                    savedFilterSets: { ...currentSaved, [filterSetName]: tab.filters as any }
                                });
                                setFilterSetName("");
                            }}
                        >
                            {t('dataConfig.filtering.add')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {Object.entries(tab.savedFilterSets || {}).map(([name, set]) => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4, background: '#2d2d30', borderRadius: 4 }}>
                                <span
                                    style={{ fontSize: 12, cursor: 'pointer', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    onClick={() => onUpdate(tab.id, { filters: set as any })}
                                    title="Załaduj zestaw"
                                >
                                    {name} <span style={{ color: '#666', fontSize: 10 }}>({(set as any[]).length})</span>
                                </span>
                                <button
                                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 2 }}
                                    onClick={() => {
                                        const newSaved = { ...tab.savedFilterSets };
                                        delete newSaved[name];
                                        onUpdate(tab.id, { savedFilterSets: newSaved });
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {Object.keys(tab.savedFilterSets || {}).length === 0 && (
                            <div style={{ color: '#888', fontStyle: 'italic', fontSize: 11 }}>{t('dataConfig.filtering.noSavedSets')}</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};
