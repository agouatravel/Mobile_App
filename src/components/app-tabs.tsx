import { Tabs } from 'expo-router';
import { Easing } from 'react-native';

import { BottomTabBar } from '@/components/bottom-tab-bar';
import { TAB_ITEMS } from '@/constants/nav';

export default function AppTabs() {
  return (
    <Tabs
      // Every screen in the app is a sibling in this one navigator — detail
      // screens included — so there is no card stack to pop and `back()` has
      // to be resolved by the tab router itself. Its default, 'firstRoute',
      // gives a two-entry history of [routes[0], current], which means back
      // always landed on Home no matter where you came from. 'history' makes
      // the router record each route as it is focused, so back returns to the
      // screen you were actually on.
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        // Tabs default to 'none', which is why switching used to be a hard
        // cut. 'shift' cross-fades and slides the outgoing screen a little
        // towards the tab you came from, so the movement agrees with the pill
        // travelling the same way along the bar.
        animation: 'shift',
        // Short and eased-out rather than the default: a tab switch is a jump
        // between siblings, not a push, and anything slower starts to feel
        // like the app is thinking about it.
        transitionSpec: {
          animation: 'timing',
          config: { duration: 220, easing: Easing.out(Easing.cubic) },
        },
      }}
      tabBar={(props) => <BottomTabBar {...props} />}>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
      {/* Detail screens. `href: null` keeps them out of the bar; they are
          still tab siblings rather than pushed screens, which is why the
          backBehavior above is doing the work. */}
      <Tabs.Screen name="assistant" options={{ href: null }} />
      <Tabs.Screen name="destinations" options={{ href: null }} />
      <Tabs.Screen name="visas" options={{ href: null }} />
      <Tabs.Screen name="visa-list" options={{ href: null }} />
      <Tabs.Screen name="visa" options={{ href: null }} />
      <Tabs.Screen name="visa-booking" options={{ href: null }} />
      <Tabs.Screen name="package" options={{ href: null }} />
      <Tabs.Screen name="place" options={{ href: null }} />
      <Tabs.Screen name="offer" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="signup" options={{ href: null }} />
      <Tabs.Screen name="forgot-password" options={{ href: null }} />
    </Tabs>
  );
}
