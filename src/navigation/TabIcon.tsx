/**
 * Tab marks, drawn from plain views rather than pulled from an icon set.
 *
 * Four small abstract shapes keep the tab bar in the same restrained system as
 * everything else, and add no dependency. Every tab still carries its label —
 * the shape is never the only way to tell them apart.
 */

import { View } from 'react-native';

type Props = { color: string; focused: boolean };

const SIZE = 22;

export function SearchIcon({ color, focused }: Props) {
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: focused ? 2.2 : 1.6,
          borderColor: color,
          marginBottom: 3,
          marginRight: 3,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 7,
          height: focused ? 2.2 : 1.6,
          borderRadius: 2,
          backgroundColor: color,
          bottom: 3,
          right: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function BrowseIcon({ color, focused }: Props) {
  const bar = (width: number) => ({
    width,
    height: focused ? 2.4 : 1.8,
    borderRadius: 2,
    backgroundColor: color,
  });

  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', gap: 4 }}>
      <View style={bar(18)} />
      <View style={bar(12)} />
      <View style={bar(15)} />
    </View>
  );
}

export function ReviseIcon({ color, focused }: Props) {
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 13,
          height: 16,
          borderRadius: 3,
          borderWidth: focused ? 2.2 : 1.6,
          borderColor: color,
          transform: [{ rotate: '-8deg' }],
          left: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 13,
          height: 16,
          borderRadius: 3,
          borderWidth: focused ? 2.2 : 1.6,
          borderColor: color,
          transform: [{ rotate: '8deg' }],
          right: 2,
        }}
      />
    </View>
  );
}

export function SavedIcon({ color, focused, background }: Props & { background: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 14,
          height: 17,
          borderRadius: 3,
          borderWidth: focused ? 2.2 : 1.6,
          borderColor: color,
          backgroundColor: focused ? color : 'transparent',
          overflow: 'hidden',
        }}
      />
      {/* The notch: a rotated square in the bar's own colour, cutting the base. */}
      <View
        style={{
          position: 'absolute',
          width: 9,
          height: 9,
          backgroundColor: background,
          bottom: 0.5,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
