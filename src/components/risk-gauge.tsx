"use client";

import { useEffect, useState } from "react";
import type { RiskLevel } from "@/lib/types";
import { RISK } from "@/lib/utils";

const RADIUS = 82;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RiskGauge({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  const meta = RISK[level];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOffset(CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, score)) / 100));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[184px]">
        <svg
          viewBox="0 0 200 200"
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#e9e3d8"
            strokeWidth="10"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={meta.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="gauge-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="font-display text-[62px] leading-none tracking-[-0.02em] text-ink">
              {score}
            </span>
            <span className="ml-1 text-[11px] font-medium text-ink-faint">
              /100
            </span>
          </div>
          <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Risk score
          </span>
        </div>
      </div>

      <span
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
        style={{
          color: meta.color,
          backgroundColor: meta.soft,
          borderColor: `${meta.color}33`,
        }}
      >
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        {meta.label}
      </span>
    </div>
  );
}
