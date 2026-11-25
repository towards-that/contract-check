"use client";

import { Check, FileText, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    title: "Reading the document",
    detail: "Extracting text and mapping the structure",
  },
  {
    title: "Identifying obligations",
    detail: "Who has to do what, by when, and at what cost",
  },
  {
    title: "Hunting for red flags",
    detail: "One-sided terms, loopholes and missing protections",
  },
  {
    title: "Scoring the risk",
    detail: "Weighing financial exposure, lock-in and exit options",
  },
  {
    title: "Writing your summary",
    detail: "Turning the legalese into plain English",
  },
];

const SKELETON_LINES = [
  [92, 100, 96, 64],
  [100, 88, 94, 70, 42],
  [96, 100, 52],
  [88, 100, 94, 60],
];

export function AnalyzingView({
  fileName,
  onCancel,
}: {
  fileName: string;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const clock = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, STAGES.length - 1));
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden">
      <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-glow absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-6 lg:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-forest shadow-sm backdrop-blur-sm">
            <span className="animate-pulse-soft size-1.5 rounded-full bg-forest" />
            Analysis in progress
          </span>
          <h1 className="mt-5 font-display text-[42px] leading-[1.02] tracking-[-0.01em] text-ink sm:text-[52px]">
            Reading the{" "}
            <span className="italic text-forest">fine print.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-soft">
            Gemini is working through every clause. This usually takes 20–60
            seconds; unusually long contracts can take a little longer.
          </p>
        </div>

        <div className="mt-9 overflow-hidden rounded-[22px] border border-line bg-cream p-1.5 shadow-float">
          <div className="rounded-[17px] border border-line/80 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-forest-soft text-forest">
                  <FileText className="size-3.5" aria-hidden="true" />
                </span>
                <span className="truncate text-[12.5px] font-medium text-ink">
                  {fileName}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">
                {elapsedLabel}
              </span>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-[170px_1fr] sm:p-6">
              <div
                className="relative hidden min-h-[210px] overflow-hidden rounded-lg border border-line bg-paper/70 p-4 sm:block"
                aria-hidden="true"
              >
                <div className="mb-4 h-2 w-16 rounded-full bg-ink/15" />
                <div className="space-y-3">
                  {SKELETON_LINES.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-1.5">
                      {group.map((width, lineIndex) => (
                        <div
                          key={lineIndex}
                          className={cn(
                            "h-1.5 rounded-full",
                            groupIndex === 2 && lineIndex === 1
                              ? "bg-[#f3b3a8]"
                              : "bg-ink/10",
                          )}
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="animate-scan absolute inset-x-0 h-10 border-b border-forest/50 bg-gradient-to-b from-transparent via-forest/10 to-forest/15" />
              </div>

              <div>
                <p className="eyebrow">Working through it</p>
                <ol className="mt-3 space-y-3">
                  {STAGES.map((item, index) => {
                    const done = index < stage;
                    const active = index === stage;
                    return (
                      <li key={item.title} className="flex gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                            done
                              ? "border-forest bg-forest text-cream"
                              : active
                                ? "border-forest/30 bg-forest-soft text-forest"
                                : "border-line bg-paper text-ink-faint",
                          )}
                        >
                          {done ? (
                            <Check
                              className="size-2.5"
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                          ) : active ? (
                            <Loader2
                              className="size-3 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="size-1 rounded-full bg-current" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-[12.5px] font-medium leading-5",
                              done || active ? "text-ink" : "text-ink-faint",
                            )}
                          >
                            {item.title}
                          </p>
                          <p
                            className={cn(
                              "text-[11px] leading-4",
                              active ? "text-ink-soft" : "text-ink-faint/80",
                            )}
                          >
                            {item.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className="h-full rounded-full bg-forest transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.round(((stage + 1) / STAGES.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <p className="text-[11px] text-ink-faint" aria-live="polite">
            {STAGES[stage].title}…
          </p>
          <span className="h-3 w-px bg-line-strong/70" aria-hidden="true" />
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/80 px-3 py-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white hover:text-ink"
          >
            <X className="size-3" aria-hidden="true" />
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
