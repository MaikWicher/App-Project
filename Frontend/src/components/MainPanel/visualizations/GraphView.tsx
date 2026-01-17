import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import type { VisualizationTab, GraphConfig } from "../../../types/visualization";
import { FaCompress } from "react-icons/fa"; // Added FaCompress for Fit

Cytoscape.use(dagre);

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const GraphView: React.FC<Props> = ({ tab, onUpdate }) => {
  const config = tab.content as GraphConfig;

  if (!config) return <div>Błąd konfiguracji grafu</div>;

  // Pass all elements to Cytoscape, logic for hiding is in the stylesheet
  const elements = React.useMemo(() => [
    ...config.nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        value: n.data.value || 0,
        displayLabel: n.data.value ? `${n.data.label} (${n.data.value})` : n.data.label
      }
    })),
    ...config.edges.map(e => ({
      ...e,
      data: {
        ...e.data,
        value: e.data.value || 0,
        displayLabel: e.data.value ? `${e.data.label || ''} [${e.data.value}]` : (e.data.label || '')
      }
    }))
  ], [config.nodes, config.edges]);

  const layout = React.useMemo(() => ({ name: config.layout, animate: true }), [config.layout]);

  /* Apply global styles from config */
  const nodeColor = config.style?.nodeColor || "#007acc";
  const edgeColor = config.style?.edgeColor || "#888888";
  const sizeMult = config.style?.nodeSize || 1;
  const widthMult = config.style?.edgeWidth || 1;

  // Filter thresholds
  const minNodeVal = config.filter?.minNodeValue || 0;
  const minEdgeVal = config.filter?.minEdgeValue || 0;

  const stylesheet = React.useMemo(() => [
    {
      selector: "node",
      style: {
        // Filter logic: Hide if below threshold
        display: (ele: any) => (ele.data('value') || 0) < minNodeVal ? 'none' : 'element',

        label: "data(displayLabel)",
        "background-color": (ele: any) => {
          if (ele.data('isInPath')) return '#4caf50';
          const specific = ele.data('style')?.color;
          return specific || nodeColor;
        },
        color: "#fff",
        "text-valign": "center",
        "text-halign": "center",
        "font-size": "12px",
        "font-weight": "bold",
        width: (ele: any) => {
          const val = ele.data('value') || 0;
          // Dynamic size multiplier: Specific > Global
          const specificSize = ele.data('style')?.size;
          const mult = specificSize !== undefined ? specificSize : sizeMult;
          // Map value 0-20 to 40-80 base size * multiplier
          const normalized = Math.max(0, Math.min(20, val)) / 20;
          const baseSize = 40 + (normalized * 40);
          return baseSize * mult;
        },
        height: (ele: any) => {
          const val = ele.data('value') || 0;
          const specificSize = ele.data('style')?.size;
          const mult = specificSize !== undefined ? specificSize : sizeMult;
          const normalized = Math.max(0, Math.min(20, val)) / 20;
          const baseSize = 40 + (normalized * 40);
          return baseSize * mult;
        },
        "text-outline-color": "#000",
        "text-outline-width": 1,
        "border-width": (ele: any) => ele.data('isInPath') ? 4 : 1,
        "border-color": (ele: any) => ele.data('isInPath') ? "#fff" : "#fff"
      }
    },
    {
      selector: "edge",
      style: {
        // Filter logic: Hide if below threshold
        display: (ele: any) => (ele.data('value') || 0) < minEdgeVal ? 'none' : 'element',

        label: "data(displayLabel)",
        width: (ele: any) => {
          if (ele.data('isInPath')) return 6 * widthMult;
          const val = ele.data('value') || 0;
          const specificWidth = ele.data('style')?.width;
          const mult = specificWidth !== undefined ? specificWidth : widthMult;
          // Map value 0-10 to 2-8 base width * multiplier
          const normalized = Math.max(0, Math.min(10, val)) / 10;
          const baseWidth = 2 + (normalized * 6);
          return baseWidth * mult;
        },
        "line-color": (ele: any) => {
          if (ele.data('isInPath')) return '#4caf50';
          const specific = ele.data('style')?.color;
          return specific || edgeColor;
        },
        "target-arrow-color": (ele: any) => {
          if (ele.data('isInPath')) return '#4caf50';
          const specific = ele.data('style')?.color;
          return specific || edgeColor;
        },
        "target-arrow-shape": config.isDirected ? "triangle" : "none",
        "curve-style": "bezier",
        "font-size": "10px",
        "text-background-opacity": 0.8,
        "text-background-color": "#222",
        "text-background-padding": "2px",
        color: "#ccc",
        "z-index": (ele: any) => ele.data('isInPath') ? 99 : 1
      }
    },
    {
      selector: ":selected",
      style: {
        "border-width": 4,
        "border-color": "#FFD700", // Gold border for selection
        // Do not override background-color so user can see color changes live
        // "background-color": "#FF8C00", 

        // For edges, use overlay to show selection without hiding line color
        "overlay-color": "#FFD700",
        "overlay-padding": 5,
        "overlay-opacity": 0.3,

        // Do not override line color
        // "line-color": "#FFD700",
        // "target-arrow-color": "#FFD700",

        "text-outline-color": "#FF8C00",
        "text-outline-width": 2
      }
    }
  ] as any, [config.isDirected, config.style, minNodeVal, minEdgeVal]);

  const [zoomLevel, setZoomLevel] = React.useState(100);
  const cyRef = React.useRef<Cytoscape.Core | null>(null);

  const handleCy = React.useCallback((cy: Cytoscape.Core) => {
    cyRef.current = cy;
    cy.off("viewport"); // 'viewport' covers zoom and pan
    cy.on("viewport", () => {
      setZoomLevel(Math.round(cy.zoom() * 100));
    });

    // Handle Selection tapping
    cy.off("tap");
    cy.on("tap", (evt) => {
      const target = evt.target;
      if (target === cy) {
        // Clicked background -> Deselect
        onUpdate(tab.id, { selectedElementId: undefined });
      } else {
        // Clicked element -> Select
        const id = target.id();
        onUpdate(tab.id, { selectedElementId: id });
      }
    });
  }, [tab.id, onUpdate]);

  // Force style update when stylesheet changes to ensure reactivity
  React.useEffect(() => {
    if (cyRef.current) {
      // Reset and apply new stylesheet
      cyRef.current.style().clear();
      cyRef.current.style(stylesheet);
    }
  }, [stylesheet]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <CytoscapeComponent
        elements={elements}
        layout={layout}
        style={{ width: "100%", height: "100%" }}
        cy={handleCy}
        stylesheet={stylesheet}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        boxSelectionEnabled={true}
        minZoom={0.1}
        maxZoom={5}
        // Performance optimizations for large graphs
        textureOnViewport={true}
        hideEdgesOnViewport={true}
        pixelRatio={1}
      />
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, display: "flex", gap: "5px" }}>
        <div style={{ background: "rgba(0,0,0,0.7)", color: "white", padding: "5px 10px", borderRadius: "5px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
          <span>🔍 {Math.round(zoomLevel)}%</span>
          <button
            onClick={() => {
              if (cyRef.current) {
                cyRef.current.fit();
                setZoomLevel(cyRef.current.zoom() * 100);
              }
            }}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Dopasuj widok (Fit)"
          >
            <FaCompress />
          </button>
        </div>
      </div>
    </div>
  );
};
