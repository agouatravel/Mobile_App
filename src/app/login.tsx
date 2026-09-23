import { Redirect } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHero } from '@/components/account/auth-hero';
import { useAuth } from '@/components/account/auth-provider';
import { LoginForm } from '@/components/account/login-form';
import { BackButton } from '@/components/back-button';

const SIDE_PADDING = 20;

// A returning traveller: the fingerprint, one field pair, a suitcase already
// packed. The artwork is the page's whole identity, which is why there is no
// "Welcome" header above it and no tab strip under it saying in words what the
// picture already says.
const ART = require('@/assets/images/illustration/login.png');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();

  // Reachable directly — the Account tab sends you here, and so does the back
  // button out of the reset flow — so it has to hold its own against arriving
  // with a session already open.
  if (account) return <Redirect href="/account" />;

  return (
    <View style={styles.screen}>
      {/* Without this the password field sits under the keyboard on a small
          phone. `padding` on iOS and `height` on Android is the pairing that
          behaves for a form inside a scroller. */}
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: SIDE_PADDING,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* The bottom bar is hidden on this screen, so this is the only
              way out of it. */}
          <View style={styles.back}>
            <BackButton />
          </View>

          <AuthHero
            source={ART}
            title="Welcome back"
            subtitle="Sign in to pick up where you left off — your bookings, saved trips and member offers."
          />

          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // `flex-start` so the button keeps its own 40pt width instead of being
  // stretched across the column by the default `align-items: stretch`.
  back: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});
