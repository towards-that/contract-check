import { NextRequest } from "next/server";
import {
  cleanText,
  DocumentError,
  extractDocument,
  getExtension,
  MAX_FILE_BYTES,
  MIN_CONTRACT_CHARS,
  prepareForModel,
} from "@/lib/document";
import { AiError, analyzeContract, getModelName } from "@/lib/gemini";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import type { AnalyzeResponse } from "@/lib/types";

export const maxDuration = 300;

const MAX_PASTED_CHARS = 400_000;

function errorResponse(
  message: string,
  status: number,
  hint?: string,
  extraHeaders?: HeadersInit,
) {
  return Response.json(
    { error: message, ...(hint ? { hint } : {}) },
    { status, headers: extraHeaders },
  );
}

function safeFileName(value: string): string {
  const cleaned = value
    .replace(/[\\/]/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 160);
  return cleaned || "contract.txt";
}

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return errorResponse(
      "No Gemini API key is configured.",
      500,
      "Add GEMINI_API_KEY to .env.local and restart the dev server. You can create a free key at aistudio.google.com/apikey.",
    );
  }

  const limit = checkRateLimit(
    clientKey(request, "analyze"),
    30,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    return errorResponse(
      "You've reached the analysis limit for this hour.",
      429,
      "Wait a little while before running another review.",
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse(
      "The upload could not be read.",
      400,
      "Try again with a PDF, DOCX, TXT or Markdown file under 15 MB.",
    );
  }

  const startedAt = Date.now();
  const fileValue = form.get("file");
  const pastedText = form.get("text");
  const pastedName = form.get("fileName");

  let fileName: string;
  let rawText: string;
  let pageCount: number | null = null;
  let fileType: string;

  try {
    if (fileValue instanceof File && fileValue.size > 0) {
      if (fileValue.size > MAX_FILE_BYTES) {
        return errorResponse(
          "That file is larger than 15 MB.",
          413,
          "Upload a smaller file, or paste the contract text instead.",
        );
      }

      fileName = safeFileName(fileValue.name);
      const extension = getExtension(fileName);
      if (!extension) {
        return errorResponse(
          "Unsupported file type.",
          415,
          "Upload a PDF, DOCX, TXT or Markdown file.",
        );
      }

      const buffer = Buffer.from(await fileValue.arrayBuffer());
      const extracted = await extractDocument(fileName, buffer);
      rawText = extracted.text;
      pageCount = extracted.pageCount;
      fileType = extension.toUpperCase();
    } else if (typeof pastedText === "string" && pastedText.trim()) {
      fileName = safeFileName(
        typeof pastedName === "string" && pastedName.trim()
          ? pastedName
          : "pasted-contract.txt",
      );
      rawText = cleanText(pastedText);

      if (rawText.length > MAX_PASTED_CHARS) {
        return errorResponse(
          "That pasted contract is too long.",
          413,
          `Keep it under ${MAX_PASTED_CHARS.toLocaleString("en-US")} characters, or upload the file instead.`,
        );
      }
      if (rawText.length < MIN_CONTRACT_CHARS) {
        return errorResponse(
          "That contract is too short to analyze.",
          422,
          "Paste the full agreement, including the clauses you're worried about.",
        );
      }

      fileType = "TEXT";
    } else {
      return errorResponse(
        "No contract was included.",
        400,
        "Choose a file or paste the contract text.",
      );
    }
  } catch (error) {
    if (error instanceof DocumentError) {
      return errorResponse(error.message, 422);
    }
    console.error("[fineprint/analyze] extraction failed", error);
    return errorResponse(
      "We couldn't extract text from that document.",
      422,
      "The file may be corrupted or password-protected. Try another export, or paste the text instead.",
    );
  }

  try {
    const prepared = prepareForModel(rawText);
    const analysis = await analyzeContract({
      contractText: prepared.text,
      fileName,
      signal: request.signal,
    });

    const payload: AnalyzeResponse = {
      analysis,
      meta: {
        fileName,
        fileType,
        pageCount,
        charCount: rawText.length,
        truncated: prepared.truncated,
        model: getModelName(),
        elapsedMs: Date.now() - startedAt,
      },
      documentText: rawText,
    };

    return Response.json(payload);
  } catch (error) {
    if (error instanceof AiError) {
      return errorResponse(error.message, error.status, error.hint);
    }
    console.error("[fineprint/analyze] unexpected failure", error);
    return errorResponse(
      "Something went wrong while analyzing the contract.",
      500,
      "Try again. If it keeps happening, check the server logs.",
    );
  }
}
