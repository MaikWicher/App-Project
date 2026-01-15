import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type { VisualizationTab } from "../../../types/visualization";
import type { ElementDefinition } from "cytoscape";

interface Props {
  tab: VisualizationTab;
}

export const GraphView: React.FC<Props> = ({ tab }) => {
  const elements: ElementDefinition[] = [
    // węzły
    { data: { id: "a", label: "A" } },
    { data: { id: "b", label: "B" } },
    { data: { id: "c", label: "C" } },

    // krawędzie
    { data: { source: "a", target: "b", label: "A → B" } },
    { data: { source: "b", target: "c", label: "B → C" } },
    { data: { source: "a", target: "c", label: "A → C" } }
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <CytoscapeComponent
        elements={elements}
        layout={{ name: "cose" }}
        style={{ width: "100%", height: "100%" }}
        stylesheet={[
          {
            selector: "node",
            style: {
              label: "data(label)",
              backgroundColor: "#007acc",
              color: "#fff",
              textValign: "center",
              textHalign: "center",
              fontSize: "12px",
              width: "40px",
              height: "40px"
            }
          },
          {
            selector: "edge",
            style: {
              label: "data(label)",
              width: 2,
              lineColor: "#999",
              targetArrowColor: "#999",
              targetArrowShape: "triangle",
              curveStyle: "bezier",
              fontSize: "10px",
              textBackgroundOpacity: 1,
              textBackgroundColor: "#fff",
              textBackgroundPadding: "2px"
            }
          }
        ]}
        userZoomingEnabled
        userPanningEnabled
        boxSelectionEnabled
      />
    </div>
  );
};
