"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  FileSearch,
  FileText,
  KeyRound,
  LockKeyhole,
  X,
} from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import {
  MAX_FILE_BYTES,
  MIN_CONTRACT_CHARS,
  SUPPORTED_EXTENSIONS,
} from "@/lib/constants";
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_NAME } from "@/lib/sample-contract";
import { cn, formatBytes } from "@/lib/utils";

export interface AnalyzePayload {
  file?: File;
  text?: string;
  fileName: string;
}

export interface UiError {
  message: string;
  hint?: string;
}

const ACCEPT =
  ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

function isSupportedFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    !!extension &&
    (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)
  );
}

export function UploadCard({
  hasApiKey,
  model,
  serverError,
  onAnalyze,
  onDismissError,
}: {
  hasApiKey: boolean;
  model: string;
  serverError: UiError | null;
  onAnalyze: (payload: AnalyzePayload) => void;
  onDismissError: () => void;
}) {
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    setLocalError(null);

    if (!isSupportedFile(candidate)) {
      setLocalError("That file type isn't supported. Use a PDF, DOCX, TXT or Markdown file.");
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setLocalError("That file is over 15 MB. Try a smaller file, or paste the text instead.");
      return;
    }
    if (candidate.size === 0) {
      setLocalError("That file is empty.");
      return;
    }

    setFile(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const canAnalyzeFile = hasApiKey && !!file;
  const canAnalyzeText = hasApiKey && text.trim().length >= MIN_CONTRACT_CHARS;
  const canAnalyze = mode === "file" ? canAnalyzeFile : canAnalyzeText;

  const submit = () => {
    setLocalError(null);
    if (mode === "file" && file) {
      onAnalyze({ file, fileName: file.name });
    } else if (mode === "paste" && text.trim()) {
      onAnalyze({
        text: text.trim(),
        fileName: "pasted-contract.txt",
      });
    }
  };

  return (
    <div
      id="upload"
      className="relative scroll-mt-24 rounded-[26px] border border-line bg-cream p-2 shadow-float"
    >
      <div className="rounded-[19px] border border-line/80 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">New review</p>
            <h2 className="mt-1.5 font-display text-[27px] leading-none text-ink">
              Upload your contract
            </h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest/15 bg-forest-soft px-2.5 py-1 text-[11px] font-medium text-forest">
            <LockKeyhole className="size-3" aria-hidden="true" />
            Private
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Input method"
          className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-paper p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "file"}
            onClick={() => {
              setMode("file");
              setLocalError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
              mode === "file"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            Upload file
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "paste"}
            onClick={() => {
              setMode("paste");
              setLocalError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
              mode === "paste"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            Paste text
          </button>
        </div>

        {mode === "file" ? (
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border border-dashed p-1 transition-colors",
              dragActive
                ? "border-forest bg-forest-soft/60"
                : "border-line-strong/80 bg-paper/40",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => {
                acceptFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {file ? (
              <div className="flex min-h-[176px] flex-col items-center justify-center gap-4 px-4 py-6 text-center">
                <div className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-sm">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-forest-soft text-forest">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {file.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-faint">
                      {formatBytes(file.size)}
                      <span aria-hidden="true">·</span>
                      <CheckCircle2
                        className="size-3 text-forest"
                        aria-hidden="true"
                      />
                      Ready to review
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setLocalError(null);
                    }}
                    aria-label="Remove selected file"
                    className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-paper hover:text-ink"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-medium text-forest underline decoration-forest/30 underline-offset-2 transition-colors hover:decoration-forest"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-[176px] w-full flex-col items-center justify-center gap-3 rounded-lg px-5 py-7 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full border border-line bg-white text-forest shadow-sm">
                  <CloudUpload className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-ink">
                  Drop your contract here, or{" "}
                  <span className="text-forest underline decoration-forest/30 underline-offset-2">
                    browse files
                  </span>
                </span>
                <span className="text-xs text-ink-faint">
                  PDF, DOCX, TXT or MD · up to 15 MB
                </span>
              </button>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setLocalError(null);
              }}
              rows={8}
              spellCheck={false}
              placeholder="Paste the full contract text here. Include the clauses, schedules and fine print — the more complete the document, the better the review."
              className="min-h-[176px] w-full resize-y rounded-xl border border-line bg-paper/30 p-4 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint/80 focus:border-forest/40 focus:bg-white focus:outline-none"
              aria-label="Contract text"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-ink-faint">
              <span>
                {text.trim().length < MIN_CONTRACT_CHARS
                  ? `At least ${MIN_CONTRACT_CHARS} characters needed`
                  : "Looks good"}
              </span>
              <span>{text.trim().length.toLocaleString("en-US")} characters</span>
            </div>
          </div>
        )}

        {localError ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-3.5 py-3 text-[12px] leading-relaxed text-[#b42318]"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{localError}</span>
          </div>
        ) : null}

        {serverError ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#fecdca] bg-[#fef3f2] px-3.5 py-3 text-[12px] leading-relaxed text-[#b42318]"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="flex-1">
              <span className="block font-medium">{serverError.message}</span>
              {serverError.hint ? (
                <span className="mt-1 block text-[#912018]/85">
                  {serverError.hint}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss error"
              className="rounded-md p-0.5 text-[#b42318]/70 transition-colors hover:text-[#b42318]"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {!hasApiKey ? (
          <div className="mt-4 rounded-xl border border-[#fde68a] bg-[#fefce8] p-3.5 text-[12px] leading-relaxed text-[#8a6100]">
            <div className="flex items-start gap-2.5">
              <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold">Add your Gemini API key to start</p>
                <p className="mt-1 text-[#8a6100]/90">
                  Create a file called{" "}
                  <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-[11px]">
                    .env.local
                  </code>{" "}
                  in the project root, add the line below, then restart the dev
                  server.
                </p>
                <code className="mt-2 block overflow-x-auto rounded-md border border-[#fde68a] bg-white/70 px-2 py-1.5 font-mono text-[11px]">
                  GEMINI_API_KEY=your_key_here
                </code>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-medium underline decoration-[#8a6100]/30 underline-offset-2 hover:decoration-[#8a6100]"
                >
                  Get a free key from Google AI Studio →
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={!canAnalyze}
          title={
            !hasApiKey
              ? "Add GEMINI_API_KEY to .env.local first"
              : undefined
          }
          className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-cream shadow-lift transition-all hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink-faint disabled:shadow-none"
        >
          Review this contract
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
            aria-hidden="true"
          />
        </button>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled={!hasApiKey}
          onClick={() =>
            onAnalyze({
              text: SAMPLE_CONTRACT,
              fileName: SAMPLE_CONTRACT_NAME,
            })
          }
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileSearch className="size-4" aria-hidden="true" />
          No document handy? Try a sample contract
          <ArrowRight
            className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-ink-faint">
          <LockKeyhole className="size-3" aria-hidden="true" />
          Analyzed by {model}. FinePrint doesn&apos;t store your document.
        </p>
      </div>
    </div>
  );
}
