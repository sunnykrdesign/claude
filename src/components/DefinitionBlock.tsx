/**
 * The inset blocks on a term page: Example, Commonly confused with, Sources.
 *
 * Each block is a labelled region so a screen reader can jump between them,
 * and the accent rule at the leading edge is paired with a text label — the
 * colour is never doing the work on its own.
 */

import { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

type Props = {
  label: string;
  children: ReactNode;
  /** `quote` renders the body in italic serif — used for the example. */
  emphasis?: 'plain' | 'quote';
};

export function DefinitionBlock({ label, children, emphasis = 'plain' }: Props) {
  const { color, radius, space, measure, type } = useTheme();

  return (
    <View
      style={{
        backgroundColor: color.surfaceInset,
        borderRadius: radius.md,
        borderLeftWidth: 3,
        borderLeftColor: color.accentBorder,
        padding: space.base,
        gap: space.sm,
        maxWidth: measure.text,
      }}
    >
      <AppText variant="label" tone="faint">
        {label}
      </AppText>
      {typeof children === 'string' ? (
        <AppText
          variant="body"
          style={
            emphasis === 'quote'
              ? { fontFamily: type.family.displayItalic, fontSize: type.size.body }
              : undefined
          }
        >
          {children}
        </AppText>
      ) : (
        children
      )}
    </View>
  );
}

/** A plain labelled section, for content that should not read as inset. */
export function Section({
  label,
  children,
  trailing,
}: {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  const { space } = useTheme();

  return (
    <View style={{ gap: space.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}
      >
        <AppText variant="label" tone="faint" accessibilityRole="header">
          {label}
        </AppText>
        {trailing}
      </View>
      {children}
    </View>
  );
}
