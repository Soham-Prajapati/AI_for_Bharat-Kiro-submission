/**
 * Bedrock Model IDs
 *
 * Single source of truth for all Bedrock model identifiers.
 * Primary: Amazon Nova (Converse API) — available without Marketplace subscription.
 * Claude models listed below require a valid AWS payment instrument.
 *
 * To swap a model globally, change it here — nowhere else.
 */

export const BEDROCK_MODELS = {
  // ── Amazon Nova (primary — works without Marketplace billing) ──────────
  // Nova Lite: best quality/cost for long-form content
  NOVA_LITE:  'us.amazon.nova-lite-v1:0',
  // Nova Micro: fastest for short-form captions
  NOVA_MICRO: 'us.amazon.nova-micro-v1:0',

  // ── Claude (requires valid AWS payment instrument) ─────────────────────
  // Claude 3.5 Sonnet v2 — MUST use cross-region inference profile prefix (us.*)
  SONNET_3_5: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  // Claude 3 Haiku — fast and cheap for short-form
  HAIKU_3:    'anthropic.claude-3-haiku-20240307-v1:0',
} as const;

/** Which model to use per platform */
export const PLATFORM_MODEL: Record<string, string> = {
  // Long-form, quality-critical → Nova Lite
  youtube:   BEDROCK_MODELS.NOVA_LITE,
  linkedin:  BEDROCK_MODELS.NOVA_LITE,
  blog:      BEDROCK_MODELS.NOVA_LITE,
  podcast:   BEDROCK_MODELS.NOVA_LITE,

  // Short-form, speed-critical → Nova Micro
  instagram: BEDROCK_MODELS.NOVA_MICRO,
  tiktok:    BEDROCK_MODELS.NOVA_MICRO,
  twitter:   BEDROCK_MODELS.NOVA_MICRO,
};
