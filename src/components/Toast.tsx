/**
 * Toasts. Buttons name their outcome and the toast confirms it: "Save term" →
 * "Saved."
 *
 * The message is also announced to screen readers, because a visual toast that
 * fades after two seconds is invisible to anyone not looking at the screen.
 */

import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { AppText } from './AppText';
import { motion } from '../theme/tokens';
import { useReducedMotion, useTheme } from '../theme/useTheme';

const VISIBLE_MS = 2000;

type ToastState = {
  message: string | null;
  /** Increments on every show, so repeating the same message re-triggers it. */
  nonce: number;
  show: (message: string) => void;
  dismiss: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  nonce: 0,
  show(message) {
    set((state) => ({ message, nonce: state.nonce + 1 }));
    AccessibilityInfo.announceForAccessibility(message);
  },
  dismiss() {
    set({ message: null });
  },
}));

export function ToastHost({ bottomOffset = 0 }: { bottomOffset?: number }) {
  const { message, nonce, dismiss } = useToast();
  const { color, radius, space } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    if (reduced) {
      opacity.setValue(1);
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }).start();
    }

    const timer = setTimeout(() => {
      if (reduced) {
        opacity.setValue(0);
        dismiss();
        return;
      }
      Animated.timing(opacity, {
        toValue: 0,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) dismiss();
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
    // `nonce` is the trigger: the same message shown twice must restart the timer.
  }, [message, nonce, dismiss, opacity, reduced]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        left: space.lg,
        right: space.lg,
        bottom: insets.bottom + bottomOffset + space.base,
        opacity,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: color.text,
          borderRadius: radius.pill,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
        }}
      >
        <AppText variant="small" weight="medium" style={{ color: color.background }}>
          {message}
        </AppText>
      </View>
    </Animated.View>
  );
}
