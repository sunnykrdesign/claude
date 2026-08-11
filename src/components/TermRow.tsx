/**
 * A term in a list: headword, one-line definition, category.
 *
 * Density is deliberate — scanning should beat tapping, so the row shows
 * enough to answer an easy lookup without opening anything.
 *
 * This is also where the app's one list animation lives: rows settle in with a
 * short staggered rise the first time a result set renders. It is capped to the
 * first few rows, and skipped entirely under reduce-motion.
 */

import { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { CategoryChip } from './Chip';
import { MIN_TARGET, motion } from '../theme/tokens';
import { useLargeText, useReducedMotion, useTheme } from '../theme/useTheme';
import type { TermSummary } from '../types/term';

type Props = {
  term: TermSummary;
  onPress: (termId: string) => void;
  /** Position in the current result set, used for the entrance stagger. */
  entranceIndex?: number;
  /** Hides the category chip where the surrounding list already groups by it. */
  showCategory?: boolean;
  saved?: boolean;
  /** Rendered at the trailing edge — a box number in revision, for instance. */
  trailing?: string;
  /**
   * Exposes a destructive action to assistive technology. Swipe-to-remove is
   * invisible to a screen reader, so anywhere a row can be swiped away it also
   * gets a rotor action.
   */
  onRemove?: () => void;
  removeLabel?: string;
};

function useSettleIn(entranceIndex: number | undefined): Animated.AnimatedProps<object> {
  const reduced = useReducedMotion();
  const animate = !reduced && entranceIndex != null && entranceIndex < motion.maxStaggered;
  const progress = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.base,
      delay: (entranceIndex ?? 0) * motion.stagger,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [animate, entranceIndex, progress]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
      },
    ],
  };
}

function TermRowBase({
  term,
  onPress,
  entranceIndex,
  showCategory = true,
  saved = false,
  trailing,
  onRemove,
  removeLabel = 'Remove',
}: Props) {
  const { color, space } = useTheme();
  const largeText = useLargeText();
  const entrance = useSettleIn(entranceIndex);

  const label = [
    term.term,
    term.shortDef,
    showCategory ? term.categories.join(', ') : null,
    saved ? 'Saved' : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Animated.View style={entrance}>
      <Pressable
        onPress={() => onPress(term.id)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens the full definition"
        accessibilityActions={onRemove ? [{ name: 'remove', label: removeLabel }] : undefined}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'remove') onRemove?.();
        }}
        style={({ pressed }) => ({
          minHeight: MIN_TARGET,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
          backgroundColor: pressed ? color.surfaceMuted : 'transparent',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: space.md,
        })}
      >
        <View style={{ flex: 1, gap: space.xs }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: space.sm,
              flexWrap: 'wrap',
            }}
          >
            <AppText variant="body" weight="semibold" style={{ flexShrink: 1 }}>
              {term.term}
            </AppText>
            {saved ? (
              /* Text, not a colour or an icon alone. */
              <AppText variant="caption" tone="accent" weight="medium">
                Saved
              </AppText>
            ) : null}
          </View>

          <AppText variant="small" tone="muted" numberOfLines={largeText ? undefined : 2}>
            {term.shortDef}
          </AppText>

          {showCategory && term.categories[0] ? (
            <CategoryChip category={term.categories[0]} style={{ marginTop: space.xxs }} />
          ) : null}
        </View>

        {trailing ? (
          <AppText variant="caption" tone="faint" style={{ paddingTop: space.xxs }}>
            {trailing}
          </AppText>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export const TermRow = memo(TermRowBase);
