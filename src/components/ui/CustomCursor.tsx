"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const handleOut = () => setVisible(false);
    const handleDown = () => setIsMouseDown(true);
    const handleUp = () => setIsMouseDown(false);
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      setIsTextInput(
        target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "CODE" ||
          target.isContentEditable,
      );

      const isInteractiveTag = ["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT", "SUMMARY"].includes(
        target.tagName,
      );
      const isCursorPointer = target.closest(".cursor-pointer") !== null;
      const isLink = target.closest("a") !== null;
      const isRoleButton = target.closest("[role='button']") !== null;
      setIsHovering(isInteractiveTag || isCursorPointer || isLink || isRoleButton);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleOut);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleHover);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleOut);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleHover);
    };
  }, []);

  const dotWidth = isTextInput ? 2 : isHovering ? (isMouseDown ? 5 : 10) : isMouseDown ? 3 : 4;
  const dotHeight = isTextInput ? 20 : dotWidth;
  const glowSize = isHovering ? (isMouseDown ? 14 : 18) : 0;

  return (
    <div className="hidden sm:block">
      <div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.15s ease-out",
        }}
      >
        <div
          className="bg-accent transition-all duration-150 ease-out"
          style={{
            width: dotWidth,
            height: dotHeight,
            borderRadius: isTextInput ? 2 : "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          opacity: isHovering ? 0.14 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <div
          className="bg-accent rounded-full blur-lg transition-all duration-300 ease-out"
          style={{
            width: glowSize,
            height: glowSize,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}
