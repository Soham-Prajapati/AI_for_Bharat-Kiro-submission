/**
 * Bedrock Model IDs
 *
 * Single source of truth for all Claude model identifiers.
 * Uses cross-region inference profiles (us.*) which automatically
 * route to the best available region within the US geography,
 * providing higher throughput and availability than single-region IDs.
 *
 * To swap a model globally, change it here — nowhere else.
 */

export const BEDROCK_MODELS = {
  // Claude 3.5 Sonnet v2 — MUST use cross-region inference profile prefix (us.*)
  // Direct model ID is not supported for on-demand throughput on this model.
  SONNET_3_5: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',

  // Use Haiku for fast, cheap, or simple tasks (like short social captions)
  HAIKU_3: 'anthropic.claude-3-haiku-20240307-v1:0',
} as const;

/** Which model to use per platform */
export const PLATFORM_MODEL: Record<string, string> = {
  // Long-form, quality-critical → Sonnet
  youtube:   BEDROCK_MODELS.SONNET_3_5,
  linkedin:  BEDROCK_MODELS.SONNET_3_5,
  blog:      BEDROCK_MODELS.SONNET_3_5,
  podcast:   BEDROCK_MODELS.SONNET_3_5,

  // Short-form, speed-critical → Haiku
  instagram: BEDROCK_MODELS.HAIKU_3,
  tiktok:    BEDROCK_MODELS.HAIKU_3,
  twitter:   BEDROCK_MODELS.HAIKU_3,
};
