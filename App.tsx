/**
 * App entry.
 *
 * The launch path is deliberately short: load fonts, open the database, seed
 * it from the bundled JSON if needed, and hand off to navigation with search
 * already focused. The content-update check happens after that, off the
 * critical path, and never blocks a keystroke.
 */

// Imported per weight rather than from the package root: the root index
// requires every weight, which drags ~12MB of unused fonts into the bundle.
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from './src/components/AppText';
import { Button } from './src/components/EmptyState';
import { ToastHost } from './src/components/Toast';
import { checkForContentUpdate } from './src/data/updates';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useLibrary } from './src/store/library';
import { useSettings } from './src/store/settings';
import { useColorSchemeResolved, useTheme } from './src/theme/useTheme';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const status = useLibrary((state) => state.status);
  const init = useLibrary((state) => state.init);
  const settingsHydrated = useSettings((state) => state.hydrated);
  const hydrate = useSettings((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
    void init();
  }, [hydrate, init]);

  // Content updates run once the dictionary is usable, never before it.
  useEffect(() => {
    if (status !== 'ready') return;
    void checkForContentUpdate(async () => {
      await useLibrary.getState().reloadIndex();
    });
  }, [status]);

  // A font that fails to load should not hold the app hostage; the system face
  // is a worse experience than Fraunces, but it is a far better one than a
  // permanent splash screen.
  const fontsSettled = fontsLoaded || fontError != null;
  const ready = fontsSettled && settingsHydrated && (status === 'ready' || status === 'error');

  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1 }} onLayout={onLayout} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
        <AppChrome />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

/** Split out so it sits inside the providers and can read the theme. */
function AppChrome() {
  const scheme = useColorSchemeResolved();
  const status = useLibrary((state) => state.status);

  if (status === 'error') return <StartupError />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
      <ToastHost bottomOffset={56} />
    </>
  );
}

function StartupError() {
  const { color, space } = useTheme();
  const error = useLibrary((state) => state.error);
  const init = useLibrary((state) => state.init);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.background,
        justifyContent: 'center',
        padding: space.xl,
        gap: space.base,
      }}
    >
      <AppText variant="title">The dictionary could not open</AppText>
      <AppText variant="body" tone="muted">
        {error ?? 'Something went wrong reading the local database.'}
      </AppText>
      <Button label="Try again" onPress={() => void init()} />
    </View>
  );
}
