import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthFailure, AuthSwitchLink } from '@/components/account/auth-chrome';
import { AuthField } from '@/components/account/auth-field';
import { useAuth } from '@/components/account/auth-provider';
import { PrimaryButton } from '@/components/glass/primary-button';
import {
  PASSWORD_MIN,
  hasErrors,
  validateSignUp,
  type FieldErrors,
  type SignUpInput,
} from '@/constants/auth';
import { Colors } from '@/constants/theme';

const EMPTY_SIGN_UP: SignUpInput = { firstName: '', lastName: '', email: '', password: '' };

// The registering half of what used to be one tabbed panel.
//
// Email only, as on /login: no Google or Apple button and so no "or use your
// email" rule to separate them from. Registering is also the one place the app
// asks for a real name of its own, which a provider button would have handed
// back from somewhere else.
export function SignupForm() {
  const router = useRouter();
  const { signUp, busy } = useAuth();

  const [input, setInput] = useState(EMPTY_SIGN_UP);
  const [errors, setErrors] = useState<FieldErrors<SignUpInput>>({});
  const [failure, setFailure] = useState<string | null>(null);

  // `replace`, not `push`: a finished registration leaves you signed in, and
  // backing into the form you just completed would only offer to register the
  // same email again.
  function done() {
    router.replace('/account');
  }

  async function submit() {
    // Without this a second tap while the first is in flight fires a second
    // sign-up and lands two accounts on one email.
    if (busy) return;
    setFailure(null);

    const found = validateSignUp(input);
    setErrors(found);
    if (hasErrors(found)) return;

    const result = await signUp(input);
    if (result.ok) done();
    else setFailure(result.message);
  }

  return (
    <View>
      {/* Side by side because together they are one answer to one question,
          and stacked they push the password field off a small screen. */}
      <View style={styles.nameRow}>
        <View style={styles.nameCell}>
          <AuthField
            label="First name"
            icon="person-outline"
            placeholder="Sam"
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            value={input.firstName}
            error={errors.firstName}
            onChangeText={(firstName) => setInput((current) => ({ ...current, firstName }))}
          />
        </View>

        <View style={styles.nameCell}>
          <AuthField
            label="Last name"
            icon="person-outline"
            placeholder="Rivera"
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            value={input.lastName}
            error={errors.lastName}
            onChangeText={(lastName) => setInput((current) => ({ ...current, lastName }))}
          />
        </View>
      </View>

      <AuthField
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={input.email}
        error={errors.email}
        onChangeText={(email) => setInput((current) => ({ ...current, email }))}
      />

      <AuthField
        label="Password"
        icon="lock-closed-outline"
        placeholder={`At least ${PASSWORD_MIN} characters`}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
        secure
        value={input.password}
        error={errors.password}
        onChangeText={(password) => setInput((current) => ({ ...current, password }))}
      />

      {failure ? <AuthFailure message={failure} /> : null}

      <PrimaryButton
        label={busy ? 'Please wait…' : 'Create account'}
        onPress={submit}
        style={styles.submit}
      />

      <Text style={styles.legal}>
        Creating an account means you accept Agoua&apos;s booking terms.
      </Text>

      <AuthSwitchLink prompt="Already a member?" action="Log in" href="/login" />
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameCell: {
    flex: 1,
  },
  submit: {
    alignSelf: 'stretch',
  },
  legal: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.textMuted,
  },
});
