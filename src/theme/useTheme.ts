/**
 * Theme access. No context provider — the scheme is derived from the system
 * setting plus the user's stored override, and both sources are hooks, so any
 * component calling `useTheme()` re-renders when either changes.
 */

import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme, useWindowDimensions } from 'react-native';

import { ColorScheme, Tokens, tokensFor } from './tokens';
import { useSettings } from '../store/settings';

export function useColorSchemeResolved(): ColorScheme {
  const system = useColorScheme();
  const preference = useSettings((state) => state.themePreference);
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
}

export function useTheme(): Tokens {
  const scheme = useColorSchemeResolved();
  return useMemo(() => tokensFor(scheme), [scheme]);
}

/**
 * Honours the OS "reduce motion" setting. Every animation in the app checks
 * this and falls back to an instant state change.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

/**
 * True once the user has pushed text well past the default size. Components
 * use it to drop truncation and switch tight rows to stacked layouts, which is
 * what keeps the app usable at 200% Dynamic Type.
 */
export function useLargeText(): boolean {
  const { fontScale } = useWindowDimensions();
  return fontScale >= 1.35;
}
