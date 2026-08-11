/**
 * Build-time configuration.
 *
 * `EXPO_PUBLIC_*` variables are inlined by Metro, so these resolve at bundle
 * time and need no native config. Copy `.env.example` to `.env` to override.
 */

/**
 * Where to look for newer content. Leave unset and the app simply never checks
 * — it is fully usable on the bundled corpus alone.
 */
export const CONTENT_MANIFEST_URL =
  process.env.EXPO_PUBLIC_CONTENT_MANIFEST_URL?.trim() || null;

/** How long the launch-time content check is allowed to take before we drop it. */
export const CONTENT_FETCH_TIMEOUT_MS = 8000;

/** Guards against a bad manifest pointing at something enormous. */
export const CONTENT_MAX_BYTES = 8 * 1024 * 1024;
