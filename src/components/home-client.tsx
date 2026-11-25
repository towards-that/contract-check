"use client";

import { useRef, useState } from "react";
import type { AnalyzeResponse } from "@/lib/types";
import { AnalysisView } from "./analysis-view";
import { AnalyzingView } from "./analyzing-view";
import { Landing } from "./landing";
import { SiteHeader } from "./site-header";
import type { AnalyzePayload, UiError } from "./upload-card";

type Phase = "landing" | "analyzing" | "result";

export function HomeClient({
  hasApiKey,
  model,
}: {
  hasApiKey: boolean;
  model: string;
}) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);
  const [pendingFileName, setPendingFileName] = useState("Your contract");
  const abortRef = useRef<AbortController | null>(null);

  const goHome = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("landing");
    setResult(null);
    setError(null);
    window.scrollTo(0, 0);
  };

  const analyze = async (payload: AnalyzePayload) => {
    setError(null);
    setPendingFileName(payload.fileName || "Your contract");
    setPhase("analyzing");
    window.scrollTo(0, 0);

    const controller = new AbortController();
    abortRef.current = controller;

    const form = new FormData();
    if (payload.file) {
      form.append("file", payload.file);
    } else if (payload.text) {
      form.append("text", payload.text);
      form.append("fileName", payload.fileName);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as
        | AnalyzeResponse
        | { error?: string; hint?: string }
        | null;

      if (
        !response.ok ||
        !data ||
        !("analysis" in data) ||
        !("meta" in data) ||
        typeof data.documentText !== "string"
      ) {
        const failure = (data ?? {}) as { error?: string; hint?: string };
        throw {
          message:
            failure.error ??
            "The analysis couldn't be completed. Please try again.",
          hint: failure.hint,
        };
      }

      setResult(data);
      setPhase("result");
      window.scrollTo(0, 0);
    } catch (caught) {
      if ((caught as { name?: string } | null)?.name === "AbortError") {
        setPhase("landing");
        return;
      }

      const failure = caught as { message?: string; hint?: string } | null;
      setError({
        message:
          failure?.message ??
          "Something went wrong while analyzing the contract. Try again.",
        hint: failure?.hint,
      });
      setResult(null);
      setPhase("landing");
      window.scrollTo(0, 0);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("landing");
    window.scrollTo(0, 0);
  };

  return (
    <>
      <SiteHeader
        onHome={goHome}
        variant={phase === "landing" ? "landing" : "result"}
        model={model}
      />

      {phase === "landing" ? (
        <Landing
          hasApiKey={hasApiKey}
          model={model}
          error={error}
          onAnalyze={(payload) => void analyze(payload)}
          onDismissError={() => setError(null)}
        />
      ) : null}

      {phase === "analyzing" ? (
        <AnalyzingView fileName={pendingFileName} onCancel={cancel} />
      ) : null}

      {phase === "result" && result ? (
        <AnalysisView result={result} onNewReview={goHome} />
      ) : null}
    </>
  );
}
