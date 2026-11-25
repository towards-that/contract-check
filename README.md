# FinePrint

**Know what you're signing.**

FinePrint is an AI contract-review app. Upload a PDF, DOCX, TXT or Markdown contract (or paste the text) and get:

- A plain-English summary of the deal
- A 0–100 risk score
- One-sided, ambiguous and unusual clauses, quoted verbatim and rated by severity
- Important protections that are missing
- Key commercial terms, obligations and negotiation priorities
- A follow-up chat grounded in the actual document

Built with Next.js 16, TypeScript, Tailwind CSS 4 and the Google Gemini API.

## Quick start

Requirements: Node.js 22+ and a Gemini API key.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 1. Add your Gemini key

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), then edit `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

Restart the dev server after changing `.env.local`. The key stays on the server and is never sent to the browser.

### 2. Try it

Upload a contract, or click **Try a sample contract** to analyze the bundled example. The sample is deliberately one-sided and should surface plenty of findings.

## Choosing a model

The default is `gemini-3.8-flash`, which is fast and inexpensive. To use another model, set:

```bash
GEMINI_MODEL=gemini-3.1-pro-preview
```

Model availability depends on your API key and region. If you see a "model not available" error, pick a model listed in [Google AI Studio](https://aistudio.google.com/) for your key, or try the `gemini-flash-latest` alias. For dense contracts, a Pro/stronger reasoning model generally produces deeper analysis; Flash is better for quick turnaround.

## How it works

```
Browser                  Next.js server                 Google Gemini
───────                  ──────────────                 ─────────────
Upload file  ──────────▶ /api/analyze
                         ├─ extract PDF/DOCX/text
                         ├─ trim to model limit
                         └─ structured-output call ───▶ analysis JSON
Report + chat ◀──────────  analysis + document text
Ask question ──────────▶ /api/chat ─────────────────────▶ grounded answer
```

- PDF text extraction uses [`unpdf`](https://github.com/unjs/unpdf); DOCX uses `mammoth`.
- The analysis call uses Gemini's structured JSON output with a fixed schema, then normalizes/validates the response before rendering.
- The extracted document text is returned to the browser once and kept in memory so chat requests can include it. It is not persisted server-side.
- With very long documents, the middle of the text is omitted to stay within the 150k-character review budget; the UI warns when this happens.
- In-memory rate limits apply (30 analyses/hour and 120 chat questions/hour per IP). These reset on server restart.

## Project structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # upload → extract → Gemini analysis
│   ├── api/chat/route.ts      # follow-up questions
│   ├── globals.css            # design tokens and base styles
│   ├── layout.tsx             # fonts + metadata
│   └── page.tsx               # entry page
├── components/
│   ├── home-client.tsx        # flow: landing → analyzing → report
│   ├── landing.tsx            # marketing page + upload
│   ├── upload-card.tsx        # drag/drop, paste, sample
│   ├── analyzing-view.tsx     # progress state
│   ├── analysis-view.tsx      # report, tabs, export
│   ├── chat-panel.tsx         # follow-up chat
│   ├── risk-gauge.tsx         # animated risk score
│   └── ...
└── lib/
    ├── constants.ts           # model + limits
    ├── document.ts            # PDF/DOCX/text extraction
    ├── gemini.ts              # Gemini calls, validation, error mapping
    ├── prompt.ts              # prompts + structured-output schema
    ├── rate-limit.ts          # simple per-IP limiter
    └── types.ts               # shared types
```

## Limits and behavior

| Limit | Value |
| --- | --- |
| Max upload | 15 MB |
| Accepted files | PDF, DOCX, TXT, MD |
| Min pasted text | 200 characters |
| Max model input | 150,000 characters |
| Max pasted text | 400,000 characters |
| Analysis request timeout | 300s |

Scanned image-only PDFs cannot be read because there is no OCR step. Export a text-based PDF or paste the text.

## Privacy

- No accounts, analytics or database.
- Uploaded files are parsed in memory and discarded after the request.
- The contract text is sent to Google's Gemini API to generate the analysis, subject to Google's API terms.
- The extracted text is returned to the browser so chat can work; it lives only in that tab.
- Closing/refreshing the tab clears the analysis.

## Deployment

This is a standard Next.js app and can be deployed to Vercel or any Node host.

- Set `GEMINI_API_KEY` in the hosting provider's environment variables.
- The analyze route declares `maxDuration = 300`; check that your hosting plan allows it.
- The per-IP rate limiter is per server instance. For multi-instance production use, replace `src/lib/rate-limit.ts` with a shared store (e.g. Redis) and add authentication before exposing it publicly.

## Disclaimer

FinePrint provides general information about documents. It is not a law firm and does not provide legal advice. AI models can miss or misstate clauses — verify important findings against the original contract and consult a qualified lawyer for high-stakes matters.
