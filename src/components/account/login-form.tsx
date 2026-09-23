import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthFailure, AuthSwitchLink } from '@/components/account/auth-chrome';
import { AuthField } from '@/components/account/auth-field';
import { useAuth } from '@/components/account/auth-provider';
import { PrimaryButton } from '@/components/glass/primary-button';
import {
  hasErrors,
  validateSignIn,
  type FieldErrors,
  type SignInInput,
} from '@/constants/auth';
import { Colors } from '@/constants/theme';

const EMPTY_SIGN_IN: SignInInput = { identifier: '', password: '' };

// The returning half of what used to be one tabbed panel. It knows about
// signing in and nothing else — no mode, no second set of fields, no switch to
// keep in sync.
//
// Email only, matching /signup: no Google or Apple button, and so no "or use
// your email" rule to separate them from. `signInWithProvider` is still on the
// auth context and provider accounts still render their badge on /account —
// there is simply no longer a button anywhere that starts one.
export function LoginForm() {
  const router = useRouter();
  const { signIn, busy } = useAuth();

  const [input, setInput] = useState(EMPTY_SIGN_IN);
  const [errors, setErrors] = useState<FieldErrors<SignInInput>>({});
  const [failure, setFailure] = useState<string | null>(null);

  // `replace`, not `push`: signing in leaves you on Account, and backing into
  // the form you just completed would only offer to sign you in again.
  function done() {
    router.replace('/account');
  }

  async function submit() {
    // The button stays mounted and pressable while the request is in flight,
    // so without this a second tap fires a second attempt.
    if (busy) return;
    setFailure(null);

    const found = validateSignIn(input);
    setErrors(found);
    if (hasErrors(found)) return;

    const result = await signIn(input);
    if (result.ok) done();
    else setFailure(result.message);
  }

  return (
    <View>
      <AuthField
        label="Email or member ID"
        icon="person-outline"
        placeholder="you@example.com or AG-7K2M4"
        autoCapitalize="none"
        autoComplete="username"
        textContentType="username"
        value={input.identifier}
        error={errors.identifier}
        onChangeText={(identifier) => setInput((current) => ({ ...current, identifier }))}
      />

      <AuthField
        label="Password"
        icon="lock-closed-outline"
        placeholder="Your password"
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={submit}
        secure
        value={input.password}
        error={errors.password}
        onChangeText={(password) => setInput((current) => ({ ...current, password }))}
      />

      {failure ? <AuthFailure message={failure} /> : null}

      <PrimaryButton
        label={busy ? 'Please wait…' : 'Log in'}
        onPress={submit}
        style={styles.submit}
      />

      <Pressable
        onPress={() => router.push('/forgot-password')}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Forgot your password"
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}>
        <Text style={styles.forgotText}>Forgot your password?</Text>
      </Pressable>

      <AuthSwitchLink prompt="New here?" action="Create an account" href="/signup" />
    </View>
  );
}

const styles = StyleSheet.create({
  submit: {
    alignSelf: 'stretch',
  },
  forgot: {
    marginTop: 16,
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  pressed: {
    opacity: 0.75,
  },
});
