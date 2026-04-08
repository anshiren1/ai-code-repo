"use client";

import type { PointerEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type FlightDPadProps = {
  show: boolean;
  variant: "vertical" | "horizontal" | "4way";
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  className?: string;
};

const padBtn =
  "flex min-h-11 min-w-11 touch-none select-none items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground shadow-sm backdrop-blur-md active:bg-white/20";

export function FlightDPad({
  show,
  variant,
  onUp,
  onDown,
  onLeft,
  onRight,
  className,
}: FlightDPadProps) {
  if (!show) return null;

  const fire = (fn?: () => void) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fn?.();
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-3 shadow-lg backdrop-blur-md",
        className
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {variant === "vertical" && (
        <>
          <button
            type="button"
            className={padBtn}
            aria-label="Steer up"
            onPointerDown={fire(onUp)}
          >
            <ChevronUp className="h-7 w-7" />
          </button>
          <button
            type="button"
            className={padBtn}
            aria-label="Steer down"
            onPointerDown={fire(onDown)}
          >
            <ChevronDown className="h-7 w-7" />
          </button>
        </>
      )}

      {variant === "horizontal" && (
        <div className="flex gap-2">
          <button
            type="button"
            className={padBtn}
            aria-label="Nudge left"
            onPointerDown={fire(onLeft)}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            className={padBtn}
            aria-label="Nudge right"
            onPointerDown={fire(onRight)}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}

      {variant === "4way" && (
        <>
          <button
            type="button"
            className={padBtn}
            aria-label="Move up"
            onPointerDown={fire(onUp)}
          >
            <ChevronUp className="h-7 w-7" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className={padBtn}
              aria-label="Move left"
              onPointerDown={fire(onLeft)}
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              className={padBtn}
              aria-label="Move right"
              onPointerDown={fire(onRight)}
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
          <button
            type="button"
            className={padBtn}
            aria-label="Move down"
            onPointerDown={fire(onDown)}
          >
            <ChevronDown className="h-7 w-7" />
          </button>
        </>
      )}
    </div>
  );
}
