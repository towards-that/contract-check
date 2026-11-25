export type Severity = "low" | "medium" | "high" | "critical";

export type RiskLevel = Severity;

export interface RedFlag {
  title: string;
  severity: Severity;
  category: string;
  /** Section or clause reference, when the document provides one. */
  section: string;
  /** Verbatim excerpt from the contract. */
  quote: string;
  explanation: string;
  impact: string;
  recommendation: string;
}

export interface MissingProtection {
  title: string;
  importance: Severity;
  explanation: string;
}

export interface KeyTerm {
  term: string;
  value: string;
  section: string;
}

export interface Obligation {
  party: string;
  obligation: string;
  section: string;
}

export interface Analysis {
  contractType: string;
  parties: string[];
  effectiveDate: string;
  governingLaw: string;
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  summary: string;
  keyObligations: Obligation[];
  redFlags: RedFlag[];
  missingProtections: MissingProtection[];
  keyTerms: KeyTerm[];
  negotiationTips: string[];
}

export interface AnalysisMeta {
  fileName: string;
  fileType: string;
  pageCount: number | null;
  charCount: number;
  truncated: boolean;
  model: string;
  elapsedMs: number;
}

export interface AnalyzeResponse {
  analysis: Analysis;
  meta: AnalysisMeta;
  /** Extracted contract text, kept in the browser so follow-up questions work. */
  documentText: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}
