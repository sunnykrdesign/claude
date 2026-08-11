/**
 * Empty states are invitations, not apologies. Every one of them offers the
 * next action rather than just reporting that there is nothing here.
 */

import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Action = {
  label: string;
  onPress: () => void;
};

type Props = {
  title: string;
  body?: string;
  action?: Action;
  secondaryAction?: Action;
  children?: ReactNode;
};

export function EmptyState({ title, body, action, secondaryAction, children }: Props) {
  const { space, measure } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: space.lg,
        paddingVertical: space.xxl,
        gap: space.md,
        maxWidth: measure.text,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" tone="muted">
          {body}
        </AppText>
      ) : null}
      {children}
      {action || secondaryAction ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.xs }}>
          {action ? <Button label={action.label} onPress={action.onPress} /> : null}
          {secondaryAction ? (
            <Button label={secondaryAction.label} onPress={secondaryAction.onPress} variant="quiet" />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'quiet' | 'danger';
  /** Announced in place of the label when the label alone is ambiguous. */
  accessibilityLabel?: string;
};

/** The app's only button. Three intents, all reading from tokens. */
export function Button({ label, onPress, variant = 'primary', accessibilityLabel }: ButtonProps) {
  const { color, radius, space } = useTheme();

  const styles = {
    primary: { background: color.accent, pressed: color.accentPressed, text: color.onAccent, border: color.accent },
    quiet: { background: color.surface, pressed: color.surfaceMuted, text: color.text, border: color.border },
    danger: { background: color.surface, pressed: color.surfaceMuted, text: color.caution, border: color.border },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => ({
        minHeight: MIN_TARGET,
        justifyContent: 'center',
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: styles.border,
        backgroundColor: pressed ? styles.pressed : styles.background,
      })}
    >
      <AppText variant="small" weight="semibold" style={{ color: styles.text, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
