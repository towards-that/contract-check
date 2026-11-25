import { NextRequest } from "next/server";
import { prepareForModel } from "@/lib/document";
import { AiError, askContract } from "@/lib/gemini";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import type { ChatMessage, ChatResponse } from "@/lib/types";

export const maxDuration = 120;

const MAX_DOCUMENT_CHARS = 400_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function errorResponse(message: string, status: number, hint?: string) {
  return Response.json(
    { error: message, ...(hint ? { hint } : {}) },
    { status },
  );
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is { role: string; content: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { role?: unknown }).role === "string" &&
        typeof (item as { content?: unknown }).content === "string",
    )
    .map((item) => ({
      role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: item.content.trim().slice(0, 6_000),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-12);
}

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return errorResponse(
      "No Gemini API key is configured.",
      500,
      "Add GEMINI_API_KEY to .env.local and restart the dev server.",
    );
  }

  const limit = checkRateLimit(clientKey(request, "chat"), 120, 60 * 60 * 1000);
  if (!limit.allowed) {
    return errorResponse(
      "You've reached the question limit for this hour.",
      429,
      "Wait a little while and try again.",
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(
      "That request is too large.",
      413,
      "Start a new analysis and try again.",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("The request could not be read.", 400);
  }

  const data =
    body !== null && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  const documentText =
    typeof data.documentText === "string" ? data.documentText.trim() : "";
  if (documentText.length < 100) {
    return errorResponse(
      "The contract text is missing.",
      400,
      "Start a new analysis and ask your question from there.",
    );
  }
  if (documentText.length > MAX_DOCUMENT_CHARS) {
    return errorResponse(
      "That contract is too large for follow-up questions.",
      413,
    );
  }

  const messages = parseMessages(data.messages);
  if (messages.length === 0) {
    return errorResponse("Ask a question about the contract.", 400);
  }

  const fileName =
    typeof data.fileName === "string" && data.fileName.trim()
      ? data.fileName.trim().slice(0, 160)
      : "contract";

  try {
    const prepared = prepareForModel(documentText);
    const reply = await askContract({
      contractText: prepared.text,
      fileName,
      messages,
      signal: request.signal,
    });

    const payload: ChatResponse = { reply };
    return Response.json(payload);
  } catch (error) {
    if (error instanceof AiError) {
      return errorResponse(error.message, error.status, error.hint);
    }
    console.error("[fineprint/chat] unexpected failure", error);
    return errorResponse(
      "Something went wrong while answering that question.",
      500,
      "Try again in a few seconds.",
    );
  }
}
