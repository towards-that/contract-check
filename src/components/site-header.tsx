import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "./logo";

export function SiteHeader({
  onHome,
  variant,
  model,
}: {
  onHome: () => void;
  variant: "landing" | "result";
  model: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          aria-label="FinePrint home"
          className="rounded-md"
        >
          <Logo />
        </button>

        {variant === "landing" ? (
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-ink-soft md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#what-you-get" className="transition-colors hover:text-ink">
              What you get
            </a>
            <a href="#privacy" className="transition-colors hover:text-ink">
              Privacy
            </a>
          </nav>
        ) : (
          <span className="hidden text-[13px] text-ink-faint sm:inline">
            {model} · AI contract review
          </span>
        )}

        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-cream/70 px-3 py-1.5 text-[11px] font-medium text-ink-soft sm:inline-flex">
            <Sparkles className="size-3 text-forest" aria-hidden="true" />
            Powered by Gemini
          </span>

          {variant === "landing" ? (
            <a
              href="#upload"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Review a contract
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onHome}
              className="rounded-full border border-line bg-cream px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-white"
            >
              New review
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
