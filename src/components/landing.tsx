import {
  ArrowRight,
  Check,
  FileText,
  LockKeyhole,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "./logo";
import {
  UploadCard,
  type AnalyzePayload,
  type UiError,
} from "./upload-card";

const CONTRACT_TYPES = [
  "Freelance agreements",
  "Leases",
  "SaaS terms",
  "NDAs",
  "Employment offers",
  "Loan documents",
];

const FEATURES = [
  {
    number: "01",
    icon: FileText,
    title: "The deal, in plain English",
    body: "What you're actually agreeing to, who owes what, when it renews, and how you get out. No more scanning for the one sentence that matters.",
  },
  {
    number: "02",
    icon: ShieldAlert,
    title: "Red flags and loopholes",
    body: "One-sided, ambiguous or unusual clauses — quoted word-for-word, rated by severity, and paired with the specific ask that improves them.",
  },
  {
    number: "03",
    icon: MessageSquareText,
    title: "Answers, not jargon",
    body: "Ask follow-up questions about your contract and get answers grounded in its actual text, with the relevant clause cited.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Upload the document",
    body: "Drop in a PDF or Word file, or paste the text. Up to 15 MB and around 150,000 characters.",
  },
  {
    number: "02",
    title: "Every clause gets read",
    body: "Gemini maps the obligations, pulls out risky language, checks for missing protections, and scores your exposure.",
  },
  {
    number: "03",
    title: "Know your next move",
    body: "Review the findings, copy the summary or download the report, then ask questions about anything that's still unclear.",
  },
];

const PRIVACY_POINTS = [
  {
    title: "No account, no database",
    body: "Your analysis lives in this browser tab. FinePrint doesn't save your document or create a profile.",
  },
  {
    title: "Processed in memory",
    body: "Files are parsed on the server just long enough to extract the text, then discarded.",
  },
  {
    title: "One API, clearly disclosed",
    body: "The contract text is sent to Google's Gemini API to generate the analysis, under Google's API terms.",
  },
];

export function Landing({
  hasApiKey,
  model,
  error,
  onAnalyze,
  onDismissError,
}: {
  hasApiKey: boolean;
  model: string;
  error: UiError | null;
  onAnalyze: (payload: AnalyzePayload) => void;
  onDismissError: () => void;
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line/70">
        <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="hero-glow absolute inset-0 -z-10" aria-hidden="true" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/75 px-3 py-1.5 text-[11px] font-medium text-forest shadow-sm backdrop-blur-sm">
              <span className="animate-pulse-soft size-1.5 rounded-full bg-forest" />
              AI contract review, grounded in the text
            </span>

            <h1 className="mt-6 font-display text-[52px] leading-[0.94] tracking-[-0.015em] text-ink sm:text-[66px] lg:text-[76px]">
              Know what
              <br />
              you&apos;re{" "}
              <span className="italic text-forest">signing.</span>
            </h1>

            <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Contracts are written to protect the other side. Upload yours and
              get a plain-English summary, a 0–100 risk score, and every clause
              worth pushing back on — before you put your name on it.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[12.5px] text-ink-soft">
              {["No sign-up", "Nothing stored", "Takes about a minute"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <span className="flex size-4 items-center justify-center rounded-full bg-forest-soft text-forest">
                      <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="mt-10 hidden max-w-md items-start gap-3 border-l-2 border-line-strong/70 pl-4 lg:flex">
              <p className="font-display text-[17px] italic leading-snug text-ink-soft">
                “We may modify these Terms at any time in our sole discretion.”
              </p>
            </div>
            <p className="mt-2 hidden text-[10px] uppercase tracking-[0.14em] text-ink-faint lg:block">
              The kind of language FinePrint catches
            </p>
          </div>

          <div
            className="animate-rise lg:justify-self-end"
            style={{ animationDelay: "120ms" }}
          >
            <UploadCard
              hasApiKey={hasApiKey}
              model={model}
              serverError={error}
              onAnalyze={onAnalyze}
              onDismissError={onDismissError}
            />
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-ink-faint">
              <LockKeyhole className="size-3" aria-hidden="true" />
              Not legal advice. For high-stakes deals, talk to a lawyer.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-line/70 bg-cream/50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-2 px-5 py-4 sm:px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Built for
          </span>
          {CONTRACT_TYPES.map((type) => (
            <span
              key={type}
              className="text-[11.5px] font-medium text-ink-soft"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <section
        id="what-you-get"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow">What you get</p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[38px] leading-[1.02] text-ink sm:text-[46px]">
              The important parts,{" "}
              <span className="italic text-forest">surfaced.</span>
            </h2>
          </div>
          <p className="max-w-[48ch] text-sm leading-relaxed text-ink-soft lg:justify-self-end">
            Not a generic chatbot summary. Every finding is tied to the actual
            language in your document, so you can check it, quote it, and push
            back on it.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.number}
                className="group relative rounded-2xl border border-line bg-cream/60 p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-white hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-forest/10 bg-forest-soft text-forest">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="font-display text-[15px] italic text-ink-faint">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {feature.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-ink text-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(55% 60% at 15% 0%, rgba(63,156,114,0.35), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/45">
                How it works
              </p>
              <h2 className="mt-3 font-display text-[38px] leading-[1.02] text-cream sm:text-[46px]">
                Three steps.{" "}
                <span className="italic text-[#9ccfb7]">No legalese.</span>
              </h2>
            </div>
            <a
              href="#upload"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-white"
            >
              Review a contract
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className={
                  index > 0
                    ? "border-t border-cream/15 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
                    : "sm:pr-6"
                }
              >
                <span className="font-display text-[30px] italic leading-none text-[#9ccfb7]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-cream/60">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-6 lg:py-24"
      >
        <div className="grid gap-10 rounded-[26px] border border-line bg-cream p-7 shadow-card sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:p-12">
          <div>
            <span className="flex size-11 items-center justify-center rounded-xl border border-forest/10 bg-forest-soft text-forest">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-6">Privacy</p>
            <h2 className="mt-2 font-display text-[34px] leading-[1.03] text-ink sm:text-[40px]">
              Your contract isn&apos;t{" "}
              <span className="italic text-forest">our product.</span>
            </h2>
            <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-ink-soft">
              Legal documents are sensitive. FinePrint is built to leave as
              little trace as possible: no login, no saved reviews, no training
              on your files.
            </p>
          </div>

          <ul className="flex flex-col justify-center divide-y divide-line">
            {PRIVACY_POINTS.map((point) => (
              <li key={point.title} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-forest-soft text-forest">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    {point.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-[30ch] text-[11.5px] leading-relaxed text-ink-faint">
              Read the fine print, without reading the fine print.
            </p>
          </div>
          <p className="max-w-[52ch] text-[11px] leading-relaxed text-ink-faint">
            FinePrint provides general information about documents and is not a
            law firm or a substitute for legal advice. AI can make mistakes —
            verify important clauses against the original contract and consult
            a qualified lawyer for high-stakes matters.
          </p>
        </div>
        <div className="mt-7 flex flex-col gap-2 border-t border-line/80 pt-5 text-[10.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 FinePrint</span>
          <span>Built with Next.js and Google Gemini</span>
        </div>
      </div>
    </footer>
  );
}
