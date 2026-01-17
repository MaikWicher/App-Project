import React, { useState, useRef } from "react";

interface Props {
    children: React.ReactNode;
}

export const ZoomWrapper: React.FC<Props> = ({ children }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        // Prevent page scroll when zooming inside the component
        // Note: For this to work perfectly with passive events in some browsers, 
        // a ref-based non-passive listener might be needed, but React's synthetic event 
        // usually allows preventDefault() if not passive.

        const zoomSensitivity = 0.003;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.1, scale + delta), 5); // Expanded limits and sensitivity

        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (containerRef.current) containerRef.current.style.cursor = "grab";
    };

    return (
        <div
            ref={containerRef}
            style={{
                overflow: "hidden",
                width: "100%",
                height: "100%",
                cursor: "grab",
                position: "relative",
                background: "#1e1e1e"
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: "center center",
                    transition: isDragging.current ? "none" : "transform 0.1s ease-out",
                    width: "100%",
                    height: "100%"
                }}
            >
                {children}
            </div>
            <div style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                pointerEvents: "none"
            }}>
                Zoom: {Math.round(scale * 100)}%
            </div>
        </div>
    );
};
