"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Info,
  Quote,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  AnalyzeResponse,
  MissingProtection,
  RedFlag,
  Severity,
} from "@/lib/types";
import {
  cn,
  formatCount,
  RISK,
  SEVERITY,
  SEVERITY_ORDER,
} from "@/lib/utils";
import { ChatPanel } from "./chat-panel";
import { Logo } from "./logo";
import { RiskGauge } from "./risk-gauge";

type TabKey = "flags" | "gaps" | "terms" | "duties";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function flagKey(flag: RedFlag): string {
  return `${flag.title}::${flag.section}`;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY[severity];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em]",
        style.badge,
      )}
    >
      <span className={cn("size-1 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "forest";
}) {
  if (!value) return null;
  return (
    <div className="grid gap-0.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-3">
      <span
        className={cn(
          "pt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
          tone === "forest" ? "text-forest" : "text-ink-faint",
        )}
      >
        {label}
      </span>
      <p className="text-[12.5px] leading-relaxed text-ink-soft">{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: "check" | "shield";
  title: string;
  body: string;
}) {
  const Icon = icon === "check" ? ShieldCheck : ShieldAlert;
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-paper/40 px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-forest-soft text-forest">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-[40ch] text-[12px] leading-relaxed text-ink-soft">
        {body}
      </p>
    </div>
  );
}

export function AnalysisView({
  result,
  onNewReview,
}: {
  result: AnalyzeResponse;
  onNewReview: () => void;
}) {
  const { analysis, meta } = result;
  const [tab, setTab] = useState<TabKey>("flags");
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [copied, setCopied] = useState(false);
  const [openFlags, setOpenFlags] = useState<Set<string>>(() => {
    const first = analysis.redFlags[0];
    return new Set(first ? [flagKey(first)] : []);
  });

  const orderedFlags = useMemo(
    () =>
      analysis.redFlags
        .map((flag, index) => ({ flag, index }))
        .sort(
          (a, b) =>
            SEVERITY_ORDER[a.flag.severity] - SEVERITY_ORDER[b.flag.severity],
        ),
    [analysis.redFlags],
  );

  const counts = useMemo(() => {
    const next: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const { flag } of orderedFlags) next[flag.severity] += 1;
    return next;
  }, [orderedFlags]);

  const visibleFlags =
    filter === "all"
      ? orderedFlags
      : orderedFlags.filter(({ flag }) => flag.severity === filter);

  const summaryParagraphs = analysis.summary
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const metaItems = [
    { label: "Agreement", value: analysis.contractType },
    {
      label: "Parties",
      value: analysis.parties.length
        ? analysis.parties.join(" · ")
        : "Not stated",
    },
    { label: "Effective date", value: analysis.effectiveDate },
    { label: "Governing law", value: analysis.governingLaw },
  ];

  const tabs: Array<{
    key: TabKey;
    label: string;
    shortLabel: string;
    count: number;
  }> = [
    {
      key: "flags",
      label: "Red flags",
      shortLabel: "Flags",
      count: analysis.redFlags.length,
    },
    {
      key: "gaps",
      label: "Missing protections",
      shortLabel: "Gaps",
      count: analysis.missingProtections.length,
    },
    {
      key: "terms",
      label: "Key terms",
      shortLabel: "Terms",
      count: analysis.keyTerms.length,
    },
    {
      key: "duties",
      label: "Obligations",
      shortLabel: "Duties",
      count: analysis.keyObligations.length,
    },
  ];

  const buildReportText = () => {
    const lines: string[] = [
      `${analysis.contractType} — ${analysis.riskScore}/100 (${RISK[analysis.riskLevel].label})`,
      analysis.verdict,
      "",
      "SUMMARY",
      analysis.summary,
      "",
      "RED FLAGS",
      ...(orderedFlags.length
        ? orderedFlags.map(
            ({ flag }, index) =>
              `${index + 1}. [${SEVERITY[flag.severity].label}] ${flag.title}${
                flag.section !== "Not labeled" ? ` (${flag.section})` : ""
              }\n${flag.quote ? `“${flag.quote}”\n` : ""}${flag.explanation}\nWhy it matters: ${flag.impact}\nWhat to ask for: ${flag.recommendation}`,
          )
        : ["None found."]),
      "",
      "MISSING PROTECTIONS",
      ...(analysis.missingProtections.length
        ? analysis.missingProtections.map(
            (gap) => `- ${gap.title}: ${gap.explanation}`,
          )
        : ["None found."]),
      "",
      "KEY TERMS",
      ...analysis.keyTerms.map((term) => `- ${term.term}: ${term.value}`),
      "",
      "NEGOTIATION PRIORITIES",
      ...analysis.negotiationTips.map((tip, index) => `${index + 1}. ${tip}`),
      "",
      "Generated by FinePrint. Not legal advice.",
    ];
    return lines.join("\n").trim();
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      tool: "FinePrint",
      disclaimer:
        "Generated by an AI model. Not legal advice. Verify against the original contract.",
      ...result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meta.fileName.replace(/\.[^.]+$/, "")}-fineprint-report.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleFlag = (key: string) => {
    setOpenFlags((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const elapsedSeconds = Math.max(1, Math.round(meta.elapsedMs / 1000));

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onNewReview}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:text-forest"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              New review
            </button>
            <h1 className="mt-3 font-display text-[34px] leading-[1.04] tracking-[-0.01em] text-ink sm:text-[40px]">
              {analysis.contractType}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-ink-faint">
              <FileText className="size-3" aria-hidden="true" />
              <span className="max-w-[240px] truncate">{meta.fileName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {meta.pageCount
                  ? `${meta.pageCount} page${meta.pageCount === 1 ? "" : "s"}`
                  : `${formatCount(meta.charCount)} characters`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{elapsedSeconds}s</span>
              <span aria-hidden="true">·</span>
              <span>{meta.model}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#chat"
              className="mobile-ask items-center gap-1.5 rounded-full border border-forest bg-forest px-3 py-2 text-[11.5px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Ask AI
            </a>
            <button
              type="button"
              onClick={() => void copySummary()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-2 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white hover:text-ink"
            >
              {copied ? (
                <Check className="size-3.5 text-forest" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-2 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white hover:text-ink"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Download report
            </button>
          </div>
        </div>

        <section className="animate-rise mt-6 overflow-hidden rounded-[22px] border border-line bg-cream shadow-card">
          <div className="grid lg:grid-cols-[236px_minmax(0,1fr)]">
            <div className="flex items-center justify-center border-b border-line bg-white/60 p-6 lg:border-b-0 lg:border-r">
              <RiskGauge score={analysis.riskScore} level={analysis.riskLevel} />
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <p className="eyebrow">The verdict</p>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>
              <p className="mt-3 max-w-[54ch] font-display text-[25px] leading-[1.18] text-ink sm:text-[29px]">
                {analysis.verdict}
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-5 sm:grid-cols-2">
                {metaItems.map((item) => (
                  <div key={item.label}>
                    <dt className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink-faint">
                      {item.label}
                    </dt>
                    <dd className="mt-1 line-clamp-2 text-[12.5px] font-medium leading-snug text-ink">
                      {item.value || "Not stated"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {meta.truncated ? (
            <div className="flex items-start gap-2.5 border-t border-[#fde68a] bg-[#fefce8] px-5 py-3 text-[11px] leading-relaxed text-[#8a6100] sm:px-7">
              <AlertTriangle
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                This document was unusually long, so the middle section was
                skipped to stay within the review limit. For full coverage,
                review that section separately.
              </span>
            </div>
          ) : null}
        </section>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_352px]">
          <div className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
              <p className="eyebrow">The plain-English version</p>
              <h2 className="mt-1.5 font-display text-[24px] leading-none text-ink">
                What you&apos;re agreeing to
              </h2>
              <div className="mt-4 space-y-3">
                {summaryParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "whitespace-pre-line text-[13px] leading-[1.75] text-ink-soft",
                      index === 0 && "text-ink/90",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div
                role="tablist"
                aria-label="Analysis sections"
                className="flex gap-0.5 overflow-x-auto border-b border-line px-3 pt-2 sm:px-4"
              >
                {tabs.map((item) => {
                  const active = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(item.key)}
                      className={cn(
                        "relative shrink-0 rounded-t-md px-2 py-2.5 text-[11px] font-medium transition-colors sm:px-3 sm:text-[11.5px]",
                        active
                          ? "text-ink"
                          : "text-ink-soft hover:text-ink",
                      )}
                    >
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums sm:ml-1.5",
                          active
                            ? "bg-forest text-cream"
                            : "bg-paper-deep text-ink-faint",
                        )}
                      >
                        {item.count}
                      </span>
                      {active ? (
                        <span
                          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-forest"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div role="tabpanel" className="p-4 sm:p-5">
                {tab === "flags" ? (
                  analysis.redFlags.length === 0 ? (
                    <EmptyState
                      icon="check"
                      title="No material red flags found"
                      body="That's uncommon for a first draft, but not impossible. Still read the summary and key terms before signing."
                    />
                  ) : (
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFilter("all")}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition-colors",
                            filter === "all"
                              ? "border-ink bg-ink text-cream"
                              : "border-line bg-cream text-ink-soft hover:border-line-strong hover:text-ink",
                          )}
                        >
                          All
                          <span className="tabular-nums opacity-70">
                            {orderedFlags.length}
                          </span>
                        </button>
                        {SEVERITIES.filter((level) => counts[level] > 0).map(
                          (level) => {
                            const active = filter === level;
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() =>
                                  setFilter(active ? "all" : level)
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition-colors",
                                  active
                                    ? "border-ink bg-ink text-cream"
                                    : "border-line bg-cream text-ink-soft hover:border-line-strong hover:text-ink",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    SEVERITY[level].dot,
                                  )}
                                />
                                {SEVERITY[level].label}
                                <span className="tabular-nums opacity-70">
                                  {counts[level]}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {visibleFlags.map(({ flag, index }) => {
                          const key = flagKey(flag);
                          const open = openFlags.has(key);
                          return (
                            <article
                              key={`${index}-${key}`}
                              className={cn(
                                "overflow-hidden rounded-xl border",
                                SEVERITY[flag.severity].panel,
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => toggleFlag(key)}
                                aria-expanded={open}
                                className="flex w-full items-start gap-3 p-4 text-left"
                              >
                                <span
                                  className={cn(
                                    "mt-[6px] size-2 shrink-0 rounded-full",
                                    SEVERITY[flag.severity].dot,
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2">
                                    <span className="text-[13px] font-semibold leading-snug text-ink">
                                      {flag.title}
                                    </span>
                                    <SeverityBadge severity={flag.severity} />
                                  </span>
                                  <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-ink-faint">
                                    <span>{flag.category}</span>
                                    {flag.section &&
                                    flag.section !== "Not labeled" ? (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="font-mono">
                                          {flag.section}
                                        </span>
                                      </>
                                    ) : null}
                                  </span>
                                  {!open ? (
                                    <span className="mt-1.5 line-clamp-2 block text-[12px] leading-relaxed text-ink-soft">
                                      {flag.explanation}
                                    </span>
                                  ) : null}
                                </span>
                                <ChevronDown
                                  className={cn(
                                    "mt-0.5 size-4 shrink-0 text-ink-faint transition-transform",
                                    open && "rotate-180",
                                  )}
                                  aria-hidden="true"
                                />
                              </button>

                              {open ? (
                                <div className="px-4 pb-4 sm:pl-9">
                                  {flag.quote ? (
                                    <blockquote className="rounded-lg border border-line/80 bg-white/80 px-4 py-3">
                                      <p className="font-display text-[15px] italic leading-snug text-ink">
                                        “{flag.quote}”
                                      </p>
                                      <footer className="mt-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                                        <Quote
                                          className="size-2.5"
                                          aria-hidden="true"
                                        />
                                        {flag.section &&
                                        flag.section !== "Not labeled"
                                          ? flag.section
                                          : "From the document"}
                                      </footer>
                                    </blockquote>
                                  ) : null}

                                  <div className="mt-3.5 space-y-3">
                                    <Detail
                                      label="What it means"
                                      value={flag.explanation}
                                    />
                                    <Detail
                                      label="Why it matters"
                                      value={flag.impact}
                                    />
                                    <Detail
                                      label="What to ask for"
                                      value={flag.recommendation}
                                      tone="forest"
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : null}

                {tab === "gaps" ? (
                  analysis.missingProtections.length === 0 ? (
                    <EmptyState
                      icon="check"
                      title="No obvious protection gaps"
                      body="The agreement appears to cover the usual ground. Confirm the details with the other side before signing."
                    />
                  ) : (
                    <div>
                      <p className="mb-3 text-[12px] leading-relaxed text-ink-soft">
                        Missing protections aren&apos;t always dealbreakers, but
                        these are worth asking for before you sign.
                      </p>
                      <ul className="space-y-2.5">
                        {analysis.missingProtections.map(
                          (gap: MissingProtection, index: number) => (
                            <li
                              key={`${index}-${gap.title}`}
                              className="rounded-xl border border-line bg-paper/40 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-clay">
                                  <ShieldAlert
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                </span>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[12.5px] font-semibold text-ink">
                                      {gap.title}
                                    </p>
                                    <SeverityBadge
                                      severity={gap.importance}
                                    />
                                  </div>
                                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                                    {gap.explanation}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )
                ) : null}

                {tab === "terms" ? (
                  analysis.keyTerms.length === 0 ? (
                    <EmptyState
                      icon="shield"
                      title="No key terms extracted"
                      body="The model couldn't identify standard commercial terms. Re-run the analysis or check the document for a clear fee and term section."
                    />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-line">
                      <div className="hidden grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-4 border-b border-line bg-paper/70 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-faint sm:grid">
                        <span>Term</span>
                        <span>What it says</span>
                      </div>
                      <div className="divide-y divide-line">
                        {analysis.keyTerms.map((term, index) => (
                          <div
                            key={`${index}-${term.term}`}
                            className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-4"
                          >
                            <div>
                              <p className="text-[12px] font-semibold leading-snug text-ink">
                                {term.term}
                              </p>
                              {term.section &&
                              term.section !== "Not labeled" ? (
                                <p className="mt-0.5 font-mono text-[9px] text-ink-faint">
                                  {term.section}
                                </p>
                              ) : null}
                            </div>
                            <p className="text-[12.5px] leading-relaxed text-ink-soft">
                              {term.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : null}

                {tab === "duties" ? (
                  analysis.keyObligations.length === 0 &&
                  analysis.negotiationTips.length === 0 ? (
                    <EmptyState
                      icon="shield"
                      title="No obligations extracted"
                      body="The model couldn't map clear obligations. Re-run the analysis or read the operative clauses directly."
                    />
                  ) : (
                    <div className="space-y-7">
                      {analysis.keyObligations.length > 0 ? (
                        <section>
                          <p className="eyebrow">Who has to do what</p>
                          <ul className="mt-3 space-y-2.5">
                            {analysis.keyObligations.map(
                              (obligation, index) => (
                                <li
                                  key={`${index}-${obligation.obligation}`}
                                  className="rounded-xl border border-line bg-paper/40 p-4"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="rounded-full border border-forest/15 bg-forest-soft px-2 py-0.5 text-[10px] font-medium text-forest">
                                      {obligation.party}
                                    </span>
                                    {obligation.section &&
                                    obligation.section !== "Not labeled" ? (
                                      <span className="font-mono text-[9px] text-ink-faint">
                                        {obligation.section}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                                    {obligation.obligation}
                                  </p>
                                </li>
                              ),
                            )}
                          </ul>
                        </section>
                      ) : null}

                      {analysis.negotiationTips.length > 0 ? (
                        <section>
                          <p className="eyebrow">Negotiate these first</p>
                          <ol className="mt-3 space-y-2.5">
                            {analysis.negotiationTips.map((tip, index) => (
                              <li key={`${index}-${tip}`} className="flex gap-3">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-cream">
                                  {index + 1}
                                </span>
                                <p className="text-[12.5px] leading-relaxed text-ink-soft">
                                  {tip}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </section>
                      ) : null}
                    </div>
                  )
                ) : null}
              </div>
            </section>

            <div className="flex items-start gap-2 px-1 pb-1 text-[10px] leading-relaxed text-ink-faint">
              <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              <p>
                FinePrint is an AI reading aid, not a lawyer. Verify quoted
                language against the original document before acting on it.
              </p>
            </div>
          </div>

          <ChatPanel
            documentText={result.documentText}
            fileName={meta.fileName}
            analysis={analysis}
          />
        </div>

        <footer className="mt-10 flex flex-col gap-3 border-t border-line/80 pb-2 pt-5 text-[10.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="hidden sm:inline">Know what you&apos;re signing.</span>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <span>© 2026 FinePrint · AI analysis, not legal advice.</span>
            <span>Built with Next.js and Google Gemini</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
