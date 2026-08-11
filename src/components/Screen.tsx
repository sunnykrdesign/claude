/**
 * Screen chrome: safe-area padding, background, and a consistent header.
 */

import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type ScreenProps = {
  children: ReactNode;
  edges?: readonly Edge[];
};

export function Screen({ children, edges = ['top', 'left', 'right'] }: ScreenProps) {
  const { color } = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: color.background }}>
      {children}
    </SafeAreaView>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
};

export function ScreenHeader({ title, subtitle, action }: HeaderProps) {
  const { space } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: space.lg,
        paddingTop: space.md,
        paddingBottom: space.base,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: space.md,
      }}
    >
      <View style={{ flex: 1, gap: space.xxs }}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="faint">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel ?? action.label}
          hitSlop={10}
          style={({ pressed }) => ({
            minHeight: MIN_TARGET - 8,
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <AppText variant="small" tone="accent" weight="medium">
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A hairline used to separate list rows without drawing a heavy divider. */
export function Divider({ inset = false }: { inset?: boolean }) {
  const { color, space } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color.border,
        marginLeft: inset ? space.lg : 0,
      }}
    />
  );
}
