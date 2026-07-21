import { featuredProjects, profile } from "@portfolio/config";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const azureChatUrl = process.env.AZURE_OPENAI_CHAT_COMPLETIONS_URL;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
}

function uniqueTerms(text: string) {
  return Array.from(
    new Set(
      normalize(text)
        .split(/\s+/)
        .filter((term) => term.length > 2),
    ),
  );
}

function generationBody(messages: ChatMessage[], stream = false) {
  return {
    messages,
    max_completion_tokens: Number(
      process.env.AZURE_OPENAI_MAX_COMPLETION_TOKENS || 2500,
    ),
    reasoning_effort: process.env.AZURE_OPENAI_REASONING_EFFORT || "low",
    stream,
  };
}

function readContent(content: unknown) {
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : (part as { text?: string; content?: string })?.text ||
            (part as { text?: string; content?: string })?.content ||
            "",
      )
      .join("\n");
  }

  return typeof content === "string" ? content : "";
}

function extractDeltaText(payload: unknown) {
  const choice = (
    payload as { choices?: Array<{ delta?: { content?: unknown } }> }
  )?.choices?.[0];
  return readContent(choice?.delta?.content);
}

export const portfolioChunks = [
  `Profile: ${profile.name}. ${profile.title}. Location: ${profile.location}. Summary: ${profile.summary}`,
  `Focus: ${profile.focus.join(", ")}`,
  ...profile.expertise.map(
    (group) => `${group.area}: ${group.skills.join(", ")}`,
  ),
  ...profile.experience.map(
    (item) =>
      `${item.period} | ${item.role} | ${item.organization}: ${item.summary}`,
  ),
  ...profile.highlights.map((highlight) => `Highlight: ${highlight}`),
  ...featuredProjects.map(
    (project) =>
      `Project: ${project.name}. ${project.summary}. Stack: ${project.stack.join(", ")}`,
  ),
];

export function retrievePortfolioContext(input: string, limit = 8) {
  const terms = uniqueTerms(input);
  const ranked = portfolioChunks
    .map((chunk) => {
      const source = normalize(chunk);
      const score = terms.reduce(
        (total, term) => total + (source.includes(term) ? 1 : 0),
        0,
      );
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked.filter((item) => item.score > 0).slice(0, limit);
  return (selected.length > 0 ? selected : ranked.slice(0, limit)).map(
    (item) => item.chunk,
  );
}

export async function generatePortfolioText(messages: ChatMessage[]) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiKey || !azureChatUrl) {
    throw new Error("AI generation is not configured.");
  }

  const response = await fetch(azureChatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(generationBody(messages)),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `AI generation request failed: ${response.status} ${detail}`,
    );
  }

  const payload = await response.json();
  const choice = payload?.choices?.[0];
  const text = readContent(choice?.message?.content);

  if (text.trim().length === 0) {
    throw new Error(
      `AI generation returned no visible text. Finish reason: ${choice?.finish_reason || "unknown"}.`,
    );
  }

  return text.trim();
}

export async function streamPortfolioText(messages: ChatMessage[]) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!apiKey || !azureChatUrl) {
    throw new Error("AI generation is not configured.");
  }

  const response = await fetch(azureChatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(generationBody(messages, true)),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `AI generation request failed: ${response.status} ${detail}`,
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed.startsWith("data:")) {
              continue;
            }

            const data = trimmed.slice(5).trim();

            if (!data || data === "[DONE]") {
              continue;
            }

            try {
              const text = extractDeltaText(JSON.parse(data));

              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // Ignore malformed stream frames and continue reading.
            }
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      }

      controller.close();
    },
  });
}
