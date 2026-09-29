import { Platform } from 'react-native';

/**
 * URL query parameters for the WEB build only (used for demo/screenshot states like ?decoderSample=true).
 *
 * On Android/iOS, `window` exists but `window.location` is undefined, so reading
 * `window.location.search` throws and crashes the release app. Always go through this helper.
 */
export function getWebSearchParams(): URLSearchParams | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return null;
  return new URLSearchParams(window.location.search);
}

/** Convenience: one web query parameter, or null on native. */
export function getWebParam(name: string): string | null {
  return getWebSearchParams()?.get(name) ?? null;
}
