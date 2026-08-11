/**
 * Chips.
 *
 * `CategoryChip` is a label tinted from its category's derived hue.
 * `TermChip` is the tappable related-term chip — the app's main way of moving
 * sideways through the network of terms.
 *
 * Both keep a 44pt touch target via hitSlop rather than by growing the pill,
 * so a row of chips stays visually light while remaining easy to hit.
 */

import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { categoryTint } from '../theme/categories';
import { useTheme } from '../theme/useTheme';
import { MIN_TARGET } from '../theme/tokens';

const HIT_SLOP = { top: 8, bottom: 8, left: 6, right: 6 };

type CategoryChipProps = {
  category: string;
  /** Smaller variant for list rows, where the chip is metadata not a control. */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

export function CategoryChip({ category, size = 'sm', style }: CategoryChipProps) {
  const { scheme, radius, space } = useTheme();
  const tint = categoryTint(category, scheme);

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: tint.surface,
          borderColor: tint.border,
          borderWidth: 1,
          borderRadius: radius.pill,
          paddingHorizontal: size === 'md' ? space.md : space.sm,
          paddingVertical: size === 'md' ? space.xs + 1 : space.xxs + 1,
        },
        style,
      ]}
    >
      {/* The label carries the meaning; the tint is decoration on top of it. */}
      <AppText variant="caption" weight="medium" style={{ color: tint.text }}>
        {category}
      </AppText>
    </View>
  );
}

type TermChipProps = {
  label: string;
  onPress: () => void;
  /** Read out after the label, e.g. "Related term". */
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export function TermChip({ label, onPress, hint, style }: TermChipProps) {
  const { color, radius, space } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint ?? 'Opens this term'}
      style={({ pressed }) => [
        {
          minHeight: MIN_TARGET - 8,
          justifyContent: 'center',
          backgroundColor: pressed ? color.accentBorder : color.accentSurface,
          borderColor: color.accentBorder,
          borderWidth: 1,
          borderRadius: radius.pill,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
        },
        style,
      ]}
    >
      <AppText variant="small" weight="medium" tone="accent">
        {label}
      </AppText>
    </Pressable>
  );
}

type ToggleChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Optional trailing count, e.g. the number of terms in a category. */
  count?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * A filter chip. Selection is carried by fill, border weight and the
 * accessibility state — never by colour alone.
 */
export function ToggleChip({ label, selected, onPress, count, style }: ToggleChipProps) {
  const { color, radius, space } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count == null ? label : `${label}, ${count} terms`}
      style={({ pressed }) => [
        {
          minHeight: MIN_TARGET - 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: selected
            ? color.accent
            : pressed
              ? color.surfaceMuted
              : color.surface,
          borderColor: selected ? color.accent : color.border,
          borderWidth: selected ? 2 : 1,
          borderRadius: radius.pill,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
        },
        style,
      ]}
    >
      <AppText variant="small" weight={selected ? 'semibold' : 'regular'} tone={selected ? 'onAccent' : 'default'}>
        {label}
      </AppText>
      {count != null ? (
        <AppText variant="caption" tone={selected ? 'onAccent' : 'faint'}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}
