"use client";

import { AlertCircle, ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Analysis, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's the biggest risk for me?",
  "What happens if I cancel early?",
  "Which clauses should I negotiate first?",
  "Can they change the price or terms?",
];

export function ChatPanel({
  documentText,
  fileName,
  analysis,
}: {
  documentText: string;
  fileName: string;
  analysis: Analysis;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    message: string;
    hint?: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: messages.length > 0 ? "smooth" : "auto",
      });
    }
  }, [messages, loading]);

  const send = async (raw: string) => {
    const content = raw.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          fileName,
          messages: nextMessages,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string; hint?: string }
        | null;

      if (!response.ok || !data?.reply) {
        throw {
          message: data?.error ?? "That question couldn't be answered.",
          hint: data?.hint,
        };
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (caught) {
      const typed = caught as { message?: string; hint?: string };
      setError({
        message:
          typed?.message ??
          "Couldn't reach the analysis service. Check your connection and try again.",
        hint: typed?.hint,
      });
      setMessages((current) => current.slice(0, -1));
      setInput(content);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <aside
      id="chat"
      className="flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-line bg-cream shadow-card lg:sticky lg:top-20"
    >
      <div className="flex items-center gap-2.5 border-b border-line bg-white px-4 py-3.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-forest text-cream">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-ink">
            Ask about this contract
          </p>
          <p className="truncate text-[10px] text-ink-faint">
            Answers grounded in your document
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="thin-scrollbar max-h-[min(52vh,440px)] min-h-[260px] overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {messages.length === 0 && !loading ? (
          <div>
            <div className="rounded-xl border border-forest/15 bg-forest-soft/60 p-3.5">
              <p className="text-[12px] leading-relaxed text-ink-soft">
                I&apos;ve read{" "}
                <span className="font-medium text-ink">{fileName}</span>. Ask
                about a specific clause, a number, or what happens if things go
                wrong — I&apos;ll point to the relevant language.
              </p>
            </div>
            <p className="eyebrow mt-4">Try asking</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-left text-[11.5px] leading-snug text-ink-soft transition-colors hover:border-forest/30 hover:bg-forest-soft/30 hover:text-forest"
                >
                  {question}
                </button>
              ))}
            </div>

            {analysis.redFlags[0] ? (
              <button
                type="button"
                onClick={() =>
                  send(
                    `Explain this clause in plain English and tell me how to negotiate it: "${analysis.redFlags[0].title}"`,
                  )
                }
                className="mt-3 flex w-full items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fefce8] px-3 py-2 text-left text-[11px] leading-snug text-[#8a6100] transition-colors hover:border-[#f5c94a]"
              >
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#d99b00]" />
                Discuss the top finding: {analysis.redFlags[0].title}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-br-md bg-forest px-3.5 py-2.5 text-[12.5px] leading-relaxed text-cream">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-ink text-[12px] font-display text-cream">
                    §
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="prose-chat">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-forest underline"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ),
            )}

            {loading ? (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-ink text-[12px] font-display text-cream">
                  §
                </span>
                <div className="flex items-center gap-1 rounded-2xl bg-white px-3.5 py-3 shadow-sm">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="typing-dot size-1.5 rounded-full bg-forest"
                    />
                  ))}
                  <span className="sr-only">Thinking</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-t border-line bg-white p-3">
        {error ? (
          <div
            role="alert"
            className="mb-2 flex items-start gap-2 rounded-lg border border-[#fecdca] bg-[#fef3f2] px-2.5 py-2 text-[11px] leading-snug text-[#b42318]"
          >
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium">{error.message}</span>
              {error.hint ? (
                <span className="mt-0.5 block text-[#912018]/80">
                  {error.hint}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <div className="rounded-xl border border-line bg-paper/40 transition-colors focus-within:border-forest/40 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 2000))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder="Ask about a clause, a fee, or what happens if…"
              aria-label="Question about the contract"
              className="w-full resize-none bg-transparent px-3 pt-2.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint/80 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="pl-1 text-[9.5px] text-ink-faint">
                Enter to send · Shift+Enter for a new line
              </span>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send question"
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg bg-forest text-cream transition-all",
                  "hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink-faint",
                )}
              >
                <ArrowUp className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>

        <p className="mt-2 text-center text-[9.5px] leading-snug text-ink-faint">
          AI answers can be wrong. Verify against the contract.
        </p>
      </div>
    </aside>
  );
}
