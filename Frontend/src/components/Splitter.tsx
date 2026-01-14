import React, { useRef } from "react";

interface Props {
  onResize: (deltaPercent: number) => void;
}

export const Splitter: React.FC<Props> = ({ onResize }) => {
  const startY = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startY.current = e.clientY;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY.current;
      onResize(delta);
      startY.current = ev.clientY;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className="splitter"
      onMouseDown={onMouseDown}
      style={{ height: "4px", cursor: "row-resize", background: "#444", flexShrink: 0 }}
    />
  );
};
