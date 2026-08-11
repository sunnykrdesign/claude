/**
 * The search field. Focused on launch, because the whole promise of the app is
 * that a lookup starts the moment it opens.
 */

import { forwardRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import { MIN_TARGET } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Announced count, e.g. "12 results". Kept in a live region. */
  resultSummary?: string;
};

export const SearchBar = forwardRef<TextInput, Props>(function SearchBar(
  { value, onChangeText, onSubmit, placeholder = 'Search terms', autoFocus = false, resultSummary },
  ref,
) {
  const { color, radius, space, type } = useTheme();

  return (
    <View style={{ paddingHorizontal: space.lg, gap: space.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: color.surface,
          borderColor: color.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: space.base,
          minHeight: MIN_TARGET + 4,
        }}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={color.textFaint}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          accessibilityLabel="Search terms"
          accessibilityHint="Results update as you type"
          style={{
            flex: 1,
            paddingVertical: space.md,
            color: color.text,
            fontFamily: type.family.body,
            fontSize: type.size.body,
          }}
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={12}
            style={({ pressed }) => ({
              minWidth: MIN_TARGET - 12,
              minHeight: MIN_TARGET - 12,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <AppText variant="small" tone="accent" weight="medium">
              Clear
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {/* Screen readers get the result count without moving focus off the field. */}
      <View accessibilityLiveRegion="polite" accessible={resultSummary != null}>
        {resultSummary ? (
          <AppText variant="caption" tone="faint">
            {resultSummary}
          </AppText>
        ) : null}
      </View>
    </View>
  );
});
