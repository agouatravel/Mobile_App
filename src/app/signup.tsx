import { Redirect } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHero } from '@/components/account/auth-hero';
import { useAuth } from '@/components/account/auth-provider';
import { SignupForm } from '@/components/account/signup-form';
import { BackButton } from '@/components/back-button';

const SIDE_PADDING = 20;

// A departure: passport, boarding pass, a plane already climbing. Deliberately
// a different scene from the login page's — the two used to be one form behind
// a switch, and the artwork is what makes them feel like two places now.
const ART = require('@/assets/images/illustration/register.png');

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();

  if (account) return <Redirect href="/account" />;

  return (
    <View style={styles.screen}>
      {/* Four fields deep, so this matters more here than anywhere else in the
          app: without it the password field and the button below it both sit
          under the keyboard. */}
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

          {/* Larger than the login page's. With no provider buttons above the
              fields any more, this page opens straight onto a plain form —
              the artwork is what is left to carry it. */}
          <AuthHero
            size="large"
            source={ART}
            title="Start your journey"
            subtitle="One account for your bookings, saved trips and member-only offers."
          />

          <SignupForm />
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
