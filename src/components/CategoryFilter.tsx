/**
 * Horizontal filter strip used by Browse and Revise.
 *
 * The row is a tab list to assistive technology, and an "All" chip is always
 * first so clearing a filter is one tap rather than a hunt for the selected one.
 */

import { ScrollView, View } from 'react-native';

import { ToggleChip } from './Chip';
import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

type Props<T extends string> = {
  /** Section label read before the options. */
  label: string;
  options: readonly T[];
  selected: T | null;
  onChange: (value: T | null) => void;
  counts?: Record<string, number>;
  /** Text for the clear-filter chip. */
  allLabel?: string;
  /** Hides options with no terms behind them. */
  hideEmpty?: boolean;
};

export function CategoryFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
  counts,
  allLabel = 'All',
  hideEmpty = false,
}: Props<T>) {
  const { space } = useTheme();

  const visible =
    hideEmpty && counts ? options.filter((option) => (counts[option] ?? 0) > 0) : options;

  return (
    <View accessibilityRole="tablist" style={{ gap: space.sm }}>
      <AppText variant="label" tone="faint" style={{ paddingHorizontal: space.lg }}>
        {label}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          gap: space.sm,
          paddingBottom: space.xs,
        }}
      >
        <ToggleChip label={allLabel} selected={selected == null} onPress={() => onChange(null)} />
        {visible.map((option) => (
          <ToggleChip
            key={option}
            label={option}
            count={counts?.[option]}
            selected={selected === option}
            onPress={() => onChange(selected === option ? null : option)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
