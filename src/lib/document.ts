import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import {
  MAX_MODEL_CHARS,
  MIN_CONTRACT_CHARS,
  SUPPORTED_EXTENSIONS,
  type SupportedExtension,
} from "./constants";

export { MAX_FILE_BYTES, MAX_MODEL_CHARS, MIN_CONTRACT_CHARS } from "./constants";

export interface ExtractedDocument {
  text: string;
  extension: SupportedExtension;
  pageCount: number | null;
}

export class DocumentError extends Error {}

export function getExtension(fileName: string): SupportedExtension | null {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  if (!match) return null;
  const extension = match[1].toLowerCase();
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)
    ? (extension as SupportedExtension)
    : null;
}

export function cleanText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function prepareForModel(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_MODEL_CHARS) {
    return { text, truncated: false };
  }

  const headLength = Math.floor(MAX_MODEL_CHARS * 0.72);
  const tailLength = MAX_MODEL_CHARS - headLength;
  const omitted = text.length - headLength - tailLength;

  return {
    text:
      text.slice(0, headLength) +
      `\n\n[... ${omitted.toLocaleString("en-US")} characters from the middle of the document were omitted because the file is unusually long ...]\n\n` +
      text.slice(-tailLength),
    truncated: true,
  };
}

export async function extractDocument(
  fileName: string,
  buffer: Buffer,
): Promise<ExtractedDocument> {
  const extension = getExtension(fileName);
  if (!extension) {
    throw new DocumentError(
      "Unsupported file type. Upload a PDF, DOCX, TXT or Markdown file.",
    );
  }

  let text = "";
  let pageCount: number | null = null;

  try {
    if (extension === "pdf") {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const extracted = await extractText(pdf, { mergePages: true });
      text = extracted.text;
      pageCount = extracted.totalPages;
    } else if (extension === "docx") {
      const extracted = await mammoth.extractRawText({ buffer });
      text = extracted.value;
    } else {
      text = new TextDecoder("utf-8").decode(buffer);
    }
  } catch {
    throw new DocumentError(
      extension === "pdf"
        ? "We couldn't read this PDF. It may be corrupted or password-protected. Try exporting it again, or paste the text instead."
        : "We couldn't read this document. It may be corrupted. Try another file or paste the text instead.",
    );
  }

  text = cleanText(text);

  if (text.length < MIN_CONTRACT_CHARS) {
    throw new DocumentError(
      extension === "pdf"
        ? "This PDF appears to contain no selectable text — it may be a scan. Try a text-based PDF, or paste the contract text instead."
        : "This document is too short to analyze. Add the full contract text and try again.",
    );
  }

  return { text, extension, pageCount };
}
