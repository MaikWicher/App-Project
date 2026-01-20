import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

interface Props {
    groupedData: Map<string, any[]>;
    groupByColumn: string;
}

export const GroupTreeVisualization: React.FC<Props> = ({ groupedData, groupByColumn }) => {
    const elements = React.useMemo(() => {
        const nodes: any[] = [];
        const edges: any[] = [];

        // Root Node
        nodes.push({ data: { id: 'root', label: `Total (${groupByColumn})` }, classes: 'root' });

        Array.from(groupedData.entries()).forEach(([groupKey, rows]) => {
            const groupId = `g-${groupKey}`;
            // Group Node
            nodes.push({ data: { id: groupId, label: `${groupKey} (${rows.length})` }, classes: 'group' });
            edges.push({ data: { source: 'root', target: groupId } });

            // Row Nodes (limit to avoid performance issues if too many?)
            // Let's show up to 10 rows per group to avoid explosion, or just summary?
            // User asked for "visualization of groups", maybe structure is enough.
            // Let's include rows but maybe simple.
            rows.forEach((row, idx) => {
                const rowId = `r-${groupKey}-${idx}`;
                const label = row['Nazwa'] || row['Name'] || row['ID'] || `Row ${idx + 1}`;
                nodes.push({ data: { id: rowId, label: String(label) }, classes: 'leaf' });
                edges.push({ data: { source: groupId, target: rowId } });
            });
        });

        return [...nodes, ...edges];
    }, [groupedData, groupByColumn]);

    const layout = {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 100,
        animate: true,
        animationDuration: 500
    };

    const stylesheet: any = [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#555',
                'color': '#fff',
                'font-size': 12,
                'width': 'label',
                'height': 'label',
                'padding': 10,
                'shape': 'round-rectangle'
            }
        },
        {
            selector: 'node.root',
            style: {
                'background-color': '#007acc',
                'font-size': 14,
                'font-weight': 'bold'
            }
        },
        {
            selector: 'node.group',
            style: {
                'background-color': '#2d2d30',
                'border-width': 2,
                'border-color': '#007acc'
            }
        },
        {
            selector: 'node.leaf',
            style: {
                'background-color': '#333',
                'font-size': 10,
                'shape': 'ellipse',
                'width': 20,
                'height': 20
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                'line-color': '#444',
                'target-arrow-color': '#444',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        }
    ];

    return (
        <div style={{ height: '100%', width: '100%', background: '#1e1e1e' }}>
            <CytoscapeComponent
                elements={elements}
                style={{ width: '100%', height: '100%' }}
                layout={layout}
                stylesheet={stylesheet}
                minZoom={0.5}
                maxZoom={2}
            />
        </div>
    );
};
