/**
 * Navigation: a bottom tab bar for the four places you can be, and a stack
 * above it for term pages, sessions and settings.
 *
 * Any term is at most two taps from launch — search is already focused, and a
 * result opens the term.
 */

import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import { BrowseIcon, ReviseIcon, SavedIcon, SearchIcon } from './TabIcon';
import type { RootStackParamList, TabParamList } from './types';
import { BrowseScreen } from '../screens/BrowseScreen';
import { ConnectionsScreen } from '../screens/ConnectionsScreen';
import { ReviseScreen } from '../screens/ReviseScreen';
import { ReviseSessionScreen } from '../screens/ReviseSessionScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TermScreen } from '../screens/TermScreen';
import { useTheme } from '../theme/useTheme';
import { type } from '../theme/tokens';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { color, scheme, space } = useTheme();

  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: color.accent,
    tabBarInactiveTintColor: color.textFaint,
    tabBarStyle: {
      backgroundColor: color.surface,
      borderTopColor: color.border,
      // Let the label grow with Dynamic Type instead of clipping it.
      height: undefined,
      paddingTop: space.sm,
    },
    tabBarLabelStyle: {
      fontFamily: type.family.bodyMedium,
      fontSize: type.size.caption,
    },
    tabBarItemStyle: { paddingVertical: space.xs },
  };

  return (
    <Tab.Navigator screenOptions={screenOptions} backBehavior="history">
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: (props) => <SearchIcon {...props} />,
          tabBarAccessibilityLabel: 'Search terms',
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarIcon: (props) => <BrowseIcon {...props} />,
          tabBarAccessibilityLabel: 'Browse A to Z',
        }}
      />
      <Tab.Screen
        name="Revise"
        component={ReviseScreen}
        options={{
          tabBarIcon: (props) => <ReviseIcon {...props} />,
          tabBarAccessibilityLabel: 'Revise with flashcards',
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: (props) => <SavedIcon {...props} background={color.surface} />,
          tabBarAccessibilityLabel: 'Saved terms',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { color, scheme } = useTheme();

  const navigationTheme: Theme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: color.accent,
        background: color.background,
        card: color.surface,
        text: color.text,
        border: color.border,
      },
    };
  }, [scheme, color]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.background },
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="Term"
          component={TermScreen}
          options={{
            headerShown: true,
            title: '',
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: { backgroundColor: color.background },
            headerTintColor: color.accent,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Connections"
          component={ConnectionsScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="ReviseSession"
          component={ReviseSessionScreen}
          options={{ presentation: 'card', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
