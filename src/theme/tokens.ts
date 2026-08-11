/**
 * Design tokens. Every component reads from here — no component defines a
 * colour, size, radius or duration of its own.
 *
 * The system is deliberately small:
 *   - one neutral ramp per scheme,
 *   - one accent (violet), used only for interactive elements and chips,
 *   - category tints derived from that accent's hue by rotation, so twelve
 *     categories read as one family rather than twelve unrelated colours,
 *   - a five-step type scale.
 */

export const ACCENT_HUE = 260;

/** Type scale. Everything textual picks one of these five sizes. */
export const type = {
  size: {
    caption: 13,
    small: 15,
    body: 17,
    title: 22,
    display: 34,
  },
  lineHeight: {
    caption: 18,
    small: 22,
    body: 27,
    title: 28,
    display: 40,
  },
  /** Tracking. Display serif is set tight; small caps-ish labels are opened up. */
  tracking: {
    display: -0.6,
    title: -0.3,
    body: 0,
    label: 0.6,
  },
  family: {
    /** Characterful serif — headwords only. */
    display: 'Fraunces_600SemiBold',
    displayItalic: 'Fraunces_600SemiBold_Italic',
    /** Legible sans — definitions, UI, everything else. */
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemi: 'Inter_600SemiBold',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
  },
} as const;

/** 4pt base spacing scale. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const motion = {
  duration: {
    fast: 140,
    base: 220,
    slow: 320,
  },
  /** Stagger between items in the one orchestrated list moment. */
  stagger: 26,
  /** Cap the stagger so a long list never feels like it is loading. */
  maxStaggered: 8,
} as const;

/** Minimum interactive target, per WCAG 2.2 target size (2.5.8) and HIG. */
export const MIN_TARGET = 44;

/** Definitions sit at roughly 60–70 characters; this caps measure on tablets. */
export const measure = {
  text: 560,
  card: 680,
} as const;

export type ColorScheme = 'light' | 'dark';

export type Palette = {
  /** Page background. */
  background: string;
  /** Raised surfaces: cards, rows, the search field. */
  surface: string;
  /** Recessed surfaces: pressed states, muted blocks. */
  surfaceMuted: string;
  /** The example / misuse blocks, which need to read as inset. */
  surfaceInset: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentPressed: string;
  accentSurface: string;
  accentBorder: string;
  /** Text that sits on top of `accent` as a fill. */
  onAccent: string;
  /** Non-decorative status colours. Always paired with text, never alone. */
  positive: string;
  caution: string;
  /** Scrims and dividers. */
  scrim: string;
};

const light: Palette = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EBECF0',
  surfaceInset: '#F2F2F6',
  border: '#E0E2E8',
  borderStrong: '#C4C8D2',
  text: '#14151A',
  textMuted: '#565B68',
  textFaint: '#6E7482',
  accent: '#5B3FB5',
  accentPressed: '#4A3196',
  accentSurface: '#EFEBFA',
  accentBorder: '#D8CFF2',
  onAccent: '#FFFFFF',
  positive: '#1F6B4A',
  caution: '#8A4B12',
  scrim: 'rgba(20, 21, 26, 0.42)',
};

const dark: Palette = {
  background: '#101116',
  surface: '#181A21',
  surfaceMuted: '#20222B',
  surfaceInset: '#1C1E26',
  border: '#2A2D38',
  borderStrong: '#3C4150',
  text: '#EEEFF3',
  textMuted: '#A5AAB8',
  textFaint: '#8B90A0',
  accent: '#B6A4F2',
  accentPressed: '#C7B9F6',
  accentSurface: '#211E33',
  accentBorder: '#3A3357',
  onAccent: '#16121F',
  positive: '#7BD1A6',
  caution: '#E3A96B',
  scrim: 'rgba(0, 0, 0, 0.62)',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

export type Tokens = {
  scheme: ColorScheme;
  color: Palette;
  type: typeof type;
  space: typeof space;
  radius: typeof radius;
  motion: typeof motion;
  measure: typeof measure;
};

export function tokensFor(scheme: ColorScheme): Tokens {
  return {
    scheme,
    color: palettes[scheme],
    type,
    space,
    radius,
    motion,
    measure,
  };
}
