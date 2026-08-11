/**
 * The revision card. Tap to flip: headword on the front, definition on the back.
 *
 * The flip is the app's second and last orchestrated moment. It is a real 3D
 * rotation with both faces mounted and back-face culling, so the text never
 * appears mirrored. Under reduce-motion the faces swap instantly instead.
 */

import { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText, Headword } from './AppText';
import { CategoryChip } from './Chip';
import { motion } from '../theme/tokens';
import { useReducedMotion, useTheme } from '../theme/useTheme';
import type { Term } from '../types/term';

type Props = {
  term: Term;
  flipped: boolean;
  onFlip: () => void;
  /** e.g. "3 of 12" — shown quietly at the top of the card. */
  position?: string;
  /** Leitner box, shown once a card has been reviewed before. */
  boxLabel?: string;
};

export function FlashCard({ term, flipped, onFlip, position, boxLabel }: Props) {
  const { color, radius, space, measure } = useTheme();
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(flipped ? 1 : 0)).current;

  useEffect(() => {
    const target = flipped ? 1 : 0;
    if (reduced) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: motion.duration.slow,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [flipped, progress, reduced]);

  const faces = useMemo(
    () => ({
      front: {
        transform: [
          { perspective: 1200 },
          {
            rotateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg'],
            }),
          },
        ],
      },
      back: {
        transform: [
          { perspective: 1200 },
          {
            rotateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['180deg', '360deg'],
            }),
          },
        ],
      },
    }),
    [progress],
  );

  const surface = {
    backgroundColor: color.surface,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: space.xl,
    // backfaceVisibility is not honoured on all Android builds; the absolute
    // stacking below means the hidden face is behind the visible one anyway.
    backfaceVisibility: 'hidden' as const,
  };

  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityLabel={
        flipped
          ? `${term.term}. ${term.longDef}`
          : `${term.term}. ${position ? `${position}. ` : ''}Definition hidden`
      }
      accessibilityHint={flipped ? 'Shows the term again' : 'Reveals the definition'}
      style={{ flex: 1, maxWidth: measure.card, width: '100%', alignSelf: 'center' }}
    >
      <View style={{ flex: 1 }}>
        {/* Front */}
        <Animated.View
          style={[
            surface,
            faces.front,
            { ...StyleSheetAbsolute, opacity: flipped && reduced ? 0 : 1 },
          ]}
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
        >
          <View style={{ flex: 1, justifyContent: 'center', gap: space.base }}>
            {position ? (
              <AppText variant="caption" tone="faint">
                {position}
              </AppText>
            ) : null}
            <Headword accessibilityRole={undefined}>{term.term}</Headword>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {term.categories.map((category) => (
                <CategoryChip key={category} category={category} />
              ))}
            </View>
          </View>
          <AppText variant="caption" tone="faint">
            Tap to reveal
          </AppText>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            surface,
            faces.back,
            { ...StyleSheetAbsolute, opacity: flipped || !reduced ? 1 : 0 },
          ]}
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
        >
          <ScrollView
            contentContainerStyle={{ gap: space.md, paddingBottom: space.sm }}
            showsVerticalScrollIndicator={false}
          >
            <AppText variant="title">{term.term}</AppText>
            <AppText variant="body" tone="muted">
              {term.shortDef}
            </AppText>
            <AppText variant="body">{term.longDef}</AppText>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: color.border,
                paddingTop: space.md,
                gap: space.xs,
              }}
            >
              <AppText variant="label" tone="faint">
                Example
              </AppText>
              <AppText variant="small" tone="muted">
                {term.example}
              </AppText>
            </View>
          </ScrollView>
          {boxLabel ? (
            <AppText variant="caption" tone="faint" style={{ paddingTop: space.sm }}>
              {boxLabel}
            </AppText>
          ) : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/**
 * Both faces occupy the same box. Extracted so the two style arrays stay
 * readable; `Platform` is referenced here to keep elevation off the faces,
 * which would otherwise paint a shadow through the flip on Android.
 */
const StyleSheetAbsolute = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  ...Platform.select({ android: { elevation: 0 }, default: {} }),
};
