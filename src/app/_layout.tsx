import * as NavigationBar from 'expo-navigation-bar';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { AuthProvider } from '@/components/account/auth-provider';
import AppTabs from '@/components/app-tabs';
import { AiTransitionProvider } from '@/components/ai/ai-transition';
import { AuroraBackground } from '@/components/aurora-background';
import { Backdrop, Colors } from '@/constants/theme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/src/global.css';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Uniwind } from 'uniwind';

// Safety net if any layout gap ever exposes the native root window: match the
// backdrop's base so a gap blends in instead of flashing a pale band.
SystemUI.setBackgroundColorAsync(Backdrop.base);

// The navigator paints its own surfaces from this, and React Navigation's
// defaults are not ours: `background` is rgb(242,242,242), a cool grey, and
// `card` is pure white. Neither is the app's warm #F7F7F5, so anywhere a scene
// did not cover — the moment of a push, a screen still mounting — showed one
// of them. That is the white behind the assistant transition.
//
// Light only, and not switched on the device's colour scheme. The app has one
// theme; handing the navigator `DarkTheme` on a dark-mode phone gave it black
// surfaces to paint behind screens that are all near-white.
const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Backdrop.base,
    card: Colors.surface,
    border: Colors.divider,
    text: Colors.foreground,
    primary: Colors.primary,
  },
};

export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // Edge-to-edge is enforced by default on this SDK (Android 15+), so the
    // nav bar background is always transparent already — only button/icon
    // contrast is configurable now. 'light' = dark icons, which is what the
    // light backdrop needs.
    NavigationBar.setStyle('light');
  }, []);

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider mode="light">
          <ThemeProvider value={NAV_THEME}>
            {/* Above the tabs, so the session outlives any one screen — the
                Account tab unmounts as you move between tabs. */}
            <AuthProvider>
              {/* Above the navigator, because the wash it draws has to outlive
                  the push it is covering: anything a screen renders is
                  unmounted the moment the assistant becomes the active route,
                  and the transition would be cut off halfway. */}
              <AiTransitionProvider>
                <View style={{ flex: 1 }}>
                  <AuroraBackground />
                  <AppTabs />
                </View>
              </AiTransitionProvider>
            </AuthProvider>
          </ThemeProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
