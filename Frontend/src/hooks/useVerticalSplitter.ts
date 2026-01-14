import { useState, useRef } from "react";

export const useVerticalSplitter = (initialPercent = 0.6) => {
  const [percent, setPercent] = useState(initialPercent);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startPercent = percent;

    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const delta = ev.clientY - startY;
      const newPercent = Math.min(0.9, Math.max(0.1, startPercent + delta / rect.height));
      setPercent(newPercent);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return { percent, startDrag, containerRef };
};
