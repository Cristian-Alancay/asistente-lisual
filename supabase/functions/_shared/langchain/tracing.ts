/**
 * LangSmith tracing configuration.
 *
 * LangChain JS auto-detects these env vars and enables tracing:
 * - LANGCHAIN_TRACING_V2=true
 * - LANGCHAIN_API_KEY=<your-langsmith-api-key>
 * - LANGCHAIN_PROJECT=<project-name>
 * - LANGCHAIN_ENDPOINT=https://api.smith.langchain.com (default)
 *
 * Set these in Supabase Dashboard > Edge Functions > Secrets.
 * No code changes needed — LangChain auto-instruments all LLM calls,
 * chain runs, and tool invocations.
 *
 * This module provides helpers for custom tracing metadata.
 */

export function isTracingEnabled(): boolean {
  return Deno.env.get("LANGCHAIN_TRACING_V2") === "true" &&
    Boolean(Deno.env.get("LANGCHAIN_API_KEY"));
}

export function getTracingMetadata(source: string) {
  return {
    metadata: {
      source,
      environment: Deno.env.get("ENVIRONMENT") ?? "production",
    },
    tags: [source],
  };
}
