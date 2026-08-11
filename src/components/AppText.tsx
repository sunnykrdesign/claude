/**
 * The only text primitive in the app. Every size, family, colour and line
 * height comes from the tokens, so there is nowhere to accidentally introduce
 * a thirteenth type size.
 *
 * Font scaling is left on everywhere: Dynamic Type is a requirement, not a
 * setting we opt out of.
 */

import { ReactNode } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

export type TextVariant =
  /** Headwords. Serif, tight, one per screen. */
  | 'display'
  /** Section and screen headings. */
  | 'title'
  /** Definitions and prose. */
  | 'body'
  /** List rows, secondary prose. */
  | 'small'
  /** Metadata under a row. */
  | 'caption'
  /** All-caps section labels above a block. */
  | 'label';

export type TextTone = 'default' | 'muted' | 'faint' | 'accent' | 'onAccent' | 'positive';

type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Bumps a sans variant to medium or semibold. Ignored for `display`. */
  weight?: 'regular' | 'medium' | 'semibold';
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  variant = 'body',
  tone = 'default',
  weight = 'regular',
  style,
  ...rest
}: Props) {
  const { color, type } = useTheme();

  const tones: Record<TextTone, string> = {
    default: color.text,
    muted: color.textMuted,
    faint: color.textFaint,
    accent: color.accent,
    onAccent: color.onAccent,
    positive: color.positive,
  };

  const families = {
    regular: type.family.body,
    medium: type.family.bodyMedium,
    semibold: type.family.bodySemi,
  };

  const base: Record<TextVariant, TextStyle> = {
    display: {
      fontFamily: type.family.display,
      fontSize: type.size.display,
      lineHeight: type.lineHeight.display,
      letterSpacing: type.tracking.display,
    },
    title: {
      fontFamily: type.family.bodySemi,
      fontSize: type.size.title,
      lineHeight: type.lineHeight.title,
      letterSpacing: type.tracking.title,
    },
    body: {
      fontFamily: families[weight],
      fontSize: type.size.body,
      lineHeight: type.lineHeight.body,
    },
    small: {
      fontFamily: families[weight],
      fontSize: type.size.small,
      lineHeight: type.lineHeight.small,
    },
    caption: {
      fontFamily: families[weight],
      fontSize: type.size.caption,
      lineHeight: type.lineHeight.caption,
    },
    label: {
      fontFamily: type.family.bodySemi,
      fontSize: type.size.caption,
      lineHeight: type.lineHeight.caption,
      letterSpacing: type.tracking.label,
      textTransform: 'uppercase',
    },
  };

  return <Text {...rest} style={[base[variant], { color: tones[tone] }, style]} />;
}

/**
 * The headword. Serif at display size, and it shrinks rather than wraps to
 * three lines when a term is long.
 */
export function Headword({ children, style, ...rest }: Props) {
  return (
    <AppText
      variant="display"
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      numberOfLines={3}
      style={style}
      accessibilityRole="header"
      {...rest}
    >
      {children}
    </AppText>
  );
}
