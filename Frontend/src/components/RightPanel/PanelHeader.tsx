import React from "react";

export const PanelHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="panel-header">
    <h3>{title}</h3>
  </div>
);
