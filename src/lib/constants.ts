export const DEFAULT_MODEL = "gemini-3.8-flash";
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_MODEL_CHARS = 150_000;
export const MIN_CONTRACT_CHARS = 200;
export const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "md"] as const;
export const ACCEPTED_FILE_TYPES =
  ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function getModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}
