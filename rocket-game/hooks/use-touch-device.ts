"use client";

import { useEffect, useState } from "react";

export function useTouchDevice(): boolean {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => {
      setTouch(
        mq.matches ||
          "ontouchstart" in window ||
          (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
      );
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touch;
}
