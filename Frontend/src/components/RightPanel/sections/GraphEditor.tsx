import React, { useEffect } from "react";
import type { VisualizationTab, GraphConfig } from "../../../types/visualization";
import { useTranslation } from "react-i18next";

const LAYOUTS = [
  { value: "grid", label: "Grid" },
  { value: "circle", label: "Circle" },
  { value: "breadthfirst", label: "Breadth-first" },
  { value: "dagre", label: "Dagre" },
  { value: "cose", label: "Cose (Physics)" },
];

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const GraphEditor: React.FC<Props> = ({ tab, onUpdate }) => {
  const { t } = useTranslation();
  const config = tab.content as GraphConfig | null;

  useEffect(() => {
    if (!config) {
      onUpdate(tab.id, {
        content: {
          layout: 'cose',
          isDirected: false,
          nodes: [
            { data: { id: "a", label: "A" } },
            { data: { id: "b", label: "B" } },
          ],
          edges: [
            { data: { id: "e-init-1", source: "a", target: "b", label: "A → B" } }
          ]
        }
      });
    } else {
      // Repair Mode: Ensure all elements have IDs
      let changed = false;
      const newNodes = config.nodes.map(n => {
        if (!n.data.id) {
          changed = true;
          return { ...n, data: { ...n.data, id: "n-" + crypto.randomUUID().slice(0, 4) } };
        }
        return n;
      });
      const newEdges = config.edges.map(e => {
        if (!e.data.id) {
          changed = true;
          return { ...e, data: { ...e.data, id: "e-" + crypto.randomUUID().slice(0, 4) } };
        }
        return e;
      });

      if (changed) {
        onUpdate(tab.id, { content: { ...config, nodes: newNodes, edges: newEdges } });
      }
    }
  }, [config, tab.id, onUpdate]);

  if (!config) {
    return <div className="panel-section">{t('graphEditor.initializing')}</div>;
  }

  const updateConfig = (changes: Partial<GraphConfig>) => {
    onUpdate(tab.id, { content: { ...config, ...changes } });
  };

  const addNode = () => {
    const newId = crypto.randomUUID().slice(0, 4);
    updateConfig({
      nodes: [...config.nodes, { data: { id: newId, label: `Node ${newId}` } }]
    });
  };

  const addEdge = () => {
    if (config.nodes.length < 2) return;
    const source = config.nodes[Math.floor(Math.random() * config.nodes.length)].data.id;
    const target = config.nodes[Math.floor(Math.random() * config.nodes.length)].data.id;
    if (source === target) return;

    const edgeId = `e-${source}-${target}-${crypto.randomUUID().slice(0, 4)}`;
    updateConfig({
      edges: [...config.edges, { data: { id: edgeId, source, target, label: "" } }]
    });
  };

  return (
    <section className="panel-section">
      <h4>🧠 {t('graphEditor.title')}</h4>

      <label>
        Layout
        <select
          value={config.layout}
          onChange={(e) => updateConfig({ layout: e.target.value as any })}
        >
          {LAYOUTS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.isDirected}
          onChange={(e) => updateConfig({ isDirected: e.target.checked })}
        />
        {t('graphEditor.directed')}
      </label>

      {/* Nodes and Edges Section */}
      <div style={{ marginTop: "10px", marginBottom: "10px", borderBottom: "1px solid #444", paddingBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>{t('graphEditor.nodes')} ({config.nodes.length})</span>
          <button onClick={addNode} style={{ fontSize: "10px", padding: "2px 5px" }}>+ {t('graphEditor.add')}</button>
        </div>
        <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #444", padding: "5px", marginBottom: "10px" }}>
          {config.nodes.map((node, idx) => {
            const isSelected = tab.selectedElementId === node.data.id;
            return (
              <div
                key={node.data.id}
                onClick={() => onUpdate(tab.id, { selectedElementId: node.data.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "2px",
                  background: isSelected ? "#444" : "#2a2a2a",
                  border: isSelected ? "1px solid #007bff" : "1px solid transparent",
                  padding: "2px 4px",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input
                      value={node.data.label}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newNodes = [...config.nodes];
                        newNodes[idx] = { ...node, data: { ...node.data, label: e.target.value } };
                        updateConfig({ nodes: newNodes });
                      }}
                      style={{ width: "70%", fontSize: "11px", padding: "2px", background: "#333", border: "1px solid #555", color: "white" }}
                      placeholder={t('graphEditor.label')}
                    />
                    <input
                      type="number"
                      value={node.data.value || 0}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newNodes = [...config.nodes];
                        newNodes[idx] = { ...node, data: { ...node.data, value: parseFloat(e.target.value) || 0 } };
                        updateConfig({ nodes: newNodes });
                      }}
                      style={{ width: "30%", fontSize: "11px", padding: "2px", background: "#333", border: "1px solid #555", color: "#aaa" }}
                      placeholder={t('graphEditor.value')}
                      title={t('graphEditor.nodeValue')}
                    />
                  </div>
                </div>
                <span style={{ fontSize: "9px", color: "#666", minWidth: "20px", textAlign: "right" }}>{node.data.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newNodes = config.nodes.filter(n => n.data.id !== node.data.id);
                    const newEdges = config.edges.filter(e => e.data.source !== node.data.id && e.data.target !== node.data.id);
                    updateConfig({ nodes: newNodes, edges: newEdges });
                    if (isSelected) onUpdate(tab.id, { selectedElementId: undefined });
                  }}
                  style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "10px" }}
                  title="Usuń"
                >🗑️</button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>{t('graphEditor.edges')} ({config.edges.length})</span>
          <button onClick={addEdge} style={{ fontSize: "10px", padding: "2px 5px" }}>+ {t('graphEditor.add')}</button>
        </div>
        <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #444", padding: "5px" }}>
          {config.edges.map((edge, idx) => {
            const isSelected = tab.selectedElementId === edge.data.id;
            return (
              <div
                key={edge.data.id || idx}
                onClick={() => {
                  if (edge.data.id) onUpdate(tab.id, { selectedElementId: edge.data.id });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "2px",
                  background: isSelected ? "#444" : "#2a2a2a",
                  border: isSelected ? "1px solid #007bff" : "1px solid transparent",
                  padding: "2px 4px",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "9px", color: "#888", marginBottom: "1px" }}>
                    <select
                      value={edge.data.source}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newEdges = [...config.edges];
                        newEdges[idx] = { ...edge, data: { ...edge.data, source: e.target.value } };
                        updateConfig({ edges: newEdges });
                      }}
                      style={{ background: "#222", border: "none", color: "#aaa", fontSize: "9px", maxWidth: "45px" }}
                    >
                      {config.nodes.map(n => <option key={n.data.id} value={n.data.id}>{n.data.label}</option>)}
                    </select>
                    <span>→</span>
                    <select
                      value={edge.data.target}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newEdges = [...config.edges];
                        newEdges[idx] = { ...edge, data: { ...edge.data, target: e.target.value } };
                        updateConfig({ edges: newEdges });
                      }}
                      style={{ background: "#222", border: "none", color: "#aaa", fontSize: "9px", maxWidth: "45px" }}
                    >
                      {config.nodes.map(n => <option key={n.data.id} value={n.data.id}>{n.data.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <input
                      value={edge.data.label || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newEdges = [...config.edges];
                        newEdges[idx] = { ...edge, data: { ...edge.data, label: e.target.value } };
                        updateConfig({ edges: newEdges });
                      }}
                      style={{ width: "70%", fontSize: "11px", padding: "2px", background: "#333", border: "1px solid #555", color: "white" }}
                      placeholder={t('graphEditor.descr')}
                    />
                    <input
                      type="number"
                      value={edge.data.value || 0}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newEdges = [...config.edges];
                        newEdges[idx] = { ...edge, data: { ...edge.data, value: parseFloat(e.target.value) || 0 } };
                        updateConfig({ edges: newEdges });
                      }}
                      style={{ width: "30%", fontSize: "11px", padding: "2px", background: "#333", border: "1px solid #555", color: "#aaa" }}
                      placeholder={t('graphEditor.edgeWeight')}
                      title={t('graphEditor.edgeWeightTitle')}
                    />
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newEdges = config.edges.filter((_, i) => i !== idx);
                    updateConfig({ edges: newEdges });
                    if (isSelected) onUpdate(tab.id, { selectedElementId: undefined });
                  }}
                  style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "10px", alignSelf: "center" }}
                  title="Usuń"
                >🗑️</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styling Section */}
      <div style={{ marginTop: "10px", borderTop: "1px solid #444", paddingTop: "10px" }}>
        {(() => {
          const selectedNode = config.nodes.find(n => n.data.id === tab.selectedElementId);
          const selectedEdge = config.edges.find(e => e.data.id === tab.selectedElementId);
          const isSelectionActive = !!selectedNode || !!selectedEdge;

          const currentNodeColor = selectedNode?.data.style?.color || config.style?.nodeColor || "#007acc";
          const currentEdgeColor = selectedEdge?.data.style?.color || config.style?.edgeColor || "#888888";
          const currentNodeSize = selectedNode?.data.style?.size || config.style?.nodeSize || 1;
          const currentEdgeWidth = selectedEdge?.data.style?.width || config.style?.edgeWidth || 1;

          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h4>🎨 {t('graphEditor.styling')} {isSelectionActive ? `(${t('graphEditor.selection')})` : `(${t('graphEditor.global')})`}</h4>
                {isSelectionActive && (
                  <button
                    onClick={() => onUpdate(tab.id, { selectedElementId: undefined })}
                    style={{ fontSize: '9px', cursor: 'pointer', border: '1px solid #555', background: '#333', color: '#eee', padding: '2px 5px' }}
                  >
                    {t('graphEditor.cancelSelection')}
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "11px", opacity: selectedEdge && !selectedNode ? 0.5 : 1 }}>
                  {t('graphEditor.nodeColor')}
                  <input
                    type="color"
                    disabled={!!(selectedEdge && !selectedNode)}
                    value={currentNodeColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (selectedNode) {
                        const newNodes = config.nodes.map(n =>
                          n.data.id === selectedNode.data.id
                            ? { ...n, data: { ...n.data, style: { ...n.data.style, color: val } } }
                            : n
                        );
                        updateConfig({ nodes: newNodes });
                      } else if (!selectedEdge) {
                        updateConfig({ style: { ...(config.style || {}), nodeColor: val } });
                      }
                    }}
                    style={{ width: "100%", height: "25px", border: "none", marginTop: "2px" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "11px", opacity: selectedNode && !selectedEdge ? 0.5 : 1 }}>
                  {t('graphEditor.edgeColor')}
                  <input
                    type="color"
                    disabled={!!(selectedNode && !selectedEdge)}
                    value={currentEdgeColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (selectedEdge) {
                        const newEdges = config.edges.map(edge =>
                          edge.data.id === selectedEdge.data.id
                            ? { ...edge, data: { ...edge.data, style: { ...edge.data.style, color: val } } }
                            : edge
                        );
                        updateConfig({ edges: newEdges });
                      } else if (!selectedNode) {
                        updateConfig({ style: { ...(config.style || {}), edgeColor: val } });
                      }
                    }}
                    style={{ width: "100%", height: "25px", border: "none", marginTop: "2px" }}
                  />
                </label>
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "11px", opacity: selectedEdge && !selectedNode ? 0.5 : 1 }}>
                  {t('graphEditor.nodeSize')} (x{currentNodeSize})
                  <input
                    type="range"
                    min="0.5" max="2" step="0.1"
                    disabled={!!(selectedEdge && !selectedNode)}
                    value={currentNodeSize}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (selectedNode) {
                        const newNodes = config.nodes.map(n =>
                          n.data.id === selectedNode.data.id
                            ? { ...n, data: { ...n.data, style: { ...n.data.style, size: val } } }
                            : n
                        );
                        updateConfig({ nodes: newNodes });
                      } else if (!selectedEdge) {
                        updateConfig({ style: { ...(config.style || {}), nodeSize: val } });
                      }
                    }}
                    style={{ width: "100%", accentColor: "#007acc" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "11px", marginTop: "5px", opacity: selectedNode && !selectedEdge ? 0.5 : 1 }}>
                  {t('graphEditor.edgeWidth')} (x{currentEdgeWidth})
                  <input
                    type="range"
                    min="0.5" max="3" step="0.1"
                    disabled={!!(selectedNode && !selectedEdge)}
                    value={currentEdgeWidth}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (selectedEdge) {
                        const newEdges = config.edges.map(edge =>
                          edge.data.id === selectedEdge.data.id
                            ? { ...edge, data: { ...edge.data, style: { ...edge.data.style, width: val } } }
                            : edge
                        );
                        updateConfig({ edges: newEdges });
                      } else if (!selectedNode) {
                        updateConfig({ style: { ...(config.style || {}), edgeWidth: val } });
                      }
                    }}
                    style={{ width: "100%", accentColor: "#888" }}
                  />
                </label>
              </div>
              {!isSelectionActive && (
                <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => updateConfig({ style: { nodeColor: "#007acc", edgeColor: "#888888", nodeSize: 1, edgeWidth: 1 } })}
                    style={{ flex: 1, fontSize: "9px", padding: "3px", background: "#333", color: "white", border: "1px solid #555" }}
                  >Standard</button>
                  <button
                    onClick={() => updateConfig({ style: { nodeColor: "#ff00ff", edgeColor: "#00ffff", nodeSize: 1.2, edgeWidth: 1.5 } })}
                    style={{ flex: 1, fontSize: "9px", padding: "3px", background: "#220022", color: "#ff00ff", border: "1px solid #ff00ff" }}
                  >Neon</button>
                  <button
                    onClick={() => updateConfig({ style: { nodeColor: "#d32f2f", edgeColor: "#333333", nodeSize: 0.8, edgeWidth: 0.8 } })}
                    style={{ flex: 1, fontSize: "9px", padding: "3px", background: "#333", color: "#d32f2f", border: "1px solid #d32f2f" }}
                  >Minimal</button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      <div className="stats" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
        Nodes: {config.nodes.length} | Edges: {config.edges.length}
      </div>

      {/* Statistics Section */}
      <div style={{ marginTop: "10px", borderTop: "1px solid #444", paddingTop: "10px" }}>
        <h4>📊 {t('graphEditor.stats')}</h4>
        <div style={{ fontSize: "11px", color: "#ccc", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
          <div style={{ background: "#2a2a2a", padding: "5px", borderRadius: "4px" }}>
            <div style={{ color: "#888", fontSize: "10px" }}>{t('graphEditor.nodes')}</div>
            <div style={{ fontWeight: "bold" }}>{config.nodes.length}</div>
          </div>
          <div style={{ background: "#2a2a2a", padding: "5px", borderRadius: "4px" }}>
            <div style={{ color: "#888", fontSize: "10px" }}>{t('graphEditor.edges')}</div>
            <div style={{ fontWeight: "bold" }}>{config.edges.length}</div>
          </div>
          <div style={{ background: "#2a2a2a", padding: "5px", borderRadius: "4px" }}>
            <div style={{ color: "#888", fontSize: "10px" }}>{t('graphEditor.avgValue')}</div>
            <div style={{ fontWeight: "bold" }}>
              {config.nodes.length > 0
                ? (config.nodes.reduce((acc, n) => acc + (n.data.value || 0), 0) / config.nodes.length).toFixed(2)
                : "0.00"}
            </div>
          </div>
          <div style={{ background: "#2a2a2a", padding: "5px", borderRadius: "4px" }}>
            <div style={{ color: "#888", fontSize: "10px" }}>{t('graphEditor.avgWeight')}</div>
            <div style={{ fontWeight: "bold" }}>
              {config.edges.length > 0
                ? (config.edges.reduce((acc, e) => acc + (e.data.value || 0), 0) / config.edges.length).toFixed(2)
                : "0.00"}
            </div>
          </div>
        </div>
      </div>

      {/* Filtering Section */}
      <div style={{ marginTop: "10px", borderTop: "1px solid #444", paddingTop: "10px" }}>
        <h4>🌪️ {t('graphEditor.filtering')}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
            {t('graphEditor.minNodeVal')}: {config.filter?.minNodeValue || 0}
            <input
              type="range"
              min="0" max="20" step="1"
              value={config.filter?.minNodeValue || 0}
              onChange={(e) => updateConfig({ filter: { ...(config.filter || {}), minNodeValue: parseFloat(e.target.value) } })}
              style={{ width: "100%", accentColor: "#007acc" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
            {t('graphEditor.minEdgeVal')}: {config.filter?.minEdgeValue || 0}
            <input
              type="range"
              min="0" max="10" step="1"
              value={config.filter?.minEdgeValue || 0}
              onChange={(e) => updateConfig({ filter: { ...(config.filter || {}), minEdgeValue: parseFloat(e.target.value) } })}
              style={{ width: "100%", accentColor: "#888" }}
            />
          </label>
        </div>
      </div>

      {/* Dijkstra Section */}
      <div style={{ marginTop: "10px", borderTop: "1px solid #444", paddingTop: "10px" }}>
        <h4>🔍 {t('graphEditor.dijkstra')}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <select id="startNode" style={{ flex: 1, background: "#333", color: "white", border: "1px solid #555" }}>
              <option value="">{t('graphEditor.start')}</option>
              {config.nodes.map(n => <option key={n.data.id} value={n.data.id}>{n.data.label}</option>)}
            </select>
            <select id="endNode" style={{ flex: 1, background: "#333", color: "white", border: "1px solid #555" }}>
              <option value="">{t('graphEditor.end')}</option>
              {config.nodes.map(n => <option key={n.data.id} value={n.data.id}>{n.data.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => {
              const startId = (document.getElementById('startNode') as HTMLSelectElement).value;
              const endId = (document.getElementById('endNode') as HTMLSelectElement).value;

              if (!startId || !endId) return;

              // Reset previous path
              let newNodes = config.nodes.map(n => ({ ...n, data: { ...n.data, isInPath: false } }));
              let newEdges = config.edges.map(e => ({ ...e, data: { ...e.data, isInPath: false } }));

              // Dijkstra
              const distances: Record<string, number> = {};
              const previous: Record<string, string | null> = {};
              const queue: string[] = [];

              config.nodes.forEach(n => {
                distances[n.data.id] = Infinity;
                previous[n.data.id] = null;
                queue.push(n.data.id);
              });
              const startNode = config.nodes.find(n => n.data.id === startId);
              distances[startId] = startNode?.data.value || 0;

              while (queue.length > 0) {
                // Sort queue by distance
                queue.sort((a, b) => distances[a] - distances[b]);
                const u = queue.shift();
                if (!u || distances[u] === Infinity) break;
                if (u === endId) break;

                // Neighbors
                const neighbors: Array<{ target: string; value: number; id: string }> = [];

                // Outgoing edges
                config.edges.filter(e => e.data.source === u).forEach(e => {
                  neighbors.push({ target: e.data.target, value: e.data.value || 0, id: e.data.id });
                });

                // Incoming edges (if undirected)
                if (!config.isDirected) {
                  config.edges.filter(e => e.data.target === u).forEach(e => {
                    neighbors.push({ target: e.data.source, value: e.data.value || 0, id: e.data.id });
                  });
                }

                for (const edge of neighbors) {
                  const v = edge.target;
                  if (queue.includes(v)) {
                    const targetNode = config.nodes.find(n => n.data.id === v);
                    const targetValue = targetNode?.data.value || 0;
                    const alt = distances[u] + edge.value + targetValue; // Cost = Edge Weight + Node Weight
                    if (alt < distances[v]) {
                      distances[v] = alt;
                      previous[v] = u;
                    }
                  }
                }
              }

              // Reconstruct path
              const path: string[] = [];
              let u: string | null = endId;
              if (previous[u] || u === startId) {
                while (u) {
                  path.unshift(u);
                  u = previous[u];
                }
              }

              if (path[0] === startId) {
                // Mark path
                newNodes = newNodes.map(n =>
                  path.includes(n.data.id) ? { ...n, data: { ...n.data, isInPath: true } } : n
                );
                // Mark edges
                for (let i = 0; i < path.length - 1; i++) {
                  const s = path[i];
                  const t = path[i + 1];
                  const edge = newEdges.find(e => e.data.source === s && e.data.target === t);
                  if (edge) {
                    edge.data.isInPath = true;
                  }
                }

                alert(t('graphEditor.pathFound', { cost: distances[endId] }));
                updateConfig({ nodes: newNodes, edges: newEdges });
              } else {
                alert(t('graphEditor.noPath'));
              }
            }}
            style={{ background: "#4caf50", color: "white", border: "none", padding: "5px", cursor: "pointer" }}
          >
            {t('graphEditor.calculate')}
          </button>
        </div>
      </div>
    </section>
  );
};

