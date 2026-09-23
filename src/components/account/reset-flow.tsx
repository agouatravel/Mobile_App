import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField } from '@/components/account/auth-field';
import { useAuth } from '@/components/account/auth-provider';
import { CodeInput } from '@/components/account/code-input';
import { BackButton } from '@/components/back-button';
import { PrimaryButton } from '@/components/glass/primary-button';
import {
  CODE_LENGTH,
  PASSWORD_MIN,
  hasErrors,
  maskEmail,
  validateCode,
  validateNewPassword,
  validateResetRequest,
  type FieldErrors,
  type NewPasswordInput,
} from '@/constants/auth';
import { Colors, Glass } from '@/constants/theme';

// email → code → password. Held as one screen with three faces rather than
// three routes: every screen in this app is a sibling in the tab navigator
// with no card stack behind it, so three routes would have to carry the email
// and the reset's progress through URL params — where a half-finished reset
// becomes a link someone can jump into sideways.
type Step = 'email' | 'code' | 'password';

const STEPS: Step[] = ['email', 'code', 'password'];

// Long enough that "resend" is not the first thing tried when a mail app is
// slow to sync, short enough not to strand someone whose code truly never came.
const RESEND_SECONDS = 30;

const EMPTY_PASSWORD: NewPasswordInput = { password: '', confirm: '' };

export function ResetFlow({ onExit, onDone }: { onExit: () => void; onDone: () => void }) {
  const { requestPasswordReset, verifyResetCode, resetPassword, busy } = useAuth();

  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [passwords, setPasswords] = useState(EMPTY_PASSWORD);

  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors<NewPasswordInput>>({});
  const [failure, setFailure] = useState<string | null>(null);

  const [resendIn, setResendIn] = useState(0);
  // What the mock would have emailed. Null in every case a real backend would
  // also have nothing to show, and gone entirely once a real one is wired in.
  const [devCode, setDevCode] = useState<string | null>(null);

  // A chain of timeouts rather than an interval: each tick schedules the next,
  // so leaving the screen mid-countdown cancels the only one outstanding.
  useEffect(() => {
    if (resendIn <= 0) return;

    const tick = setTimeout(() => setResendIn((current) => current - 1), 1000);
    return () => clearTimeout(tick);
  }, [resendIn]);

  function back() {
    setFailure(null);

    if (step === 'password') {
      setStep('code');
      return;
    }

    if (step === 'code') {
      setStep('email');
      return;
    }

    onExit();
  }

  async function sendCode() {
    if (busy) return;
    setFailure(null);

    const errors = validateResetRequest({ email });
    setEmailError(errors.email);
    if (hasErrors(errors)) return;

    const result = await requestPasswordReset(email);

    setDevCode(result.devCode);
    setResendIn(RESEND_SECONDS);
    setCode('');
    setCodeError(undefined);
    setStep('code');
  }

  async function resend() {
    if (busy || resendIn > 0) return;

    const result = await requestPasswordReset(email);
    setDevCode(result.devCode);
    setResendIn(RESEND_SECONDS);
    setCode('');
    setCodeError(undefined);
    setFailure(null);
  }

  async function verify(entered = code) {
    if (busy) return;
    setFailure(null);

    const error = validateCode(entered);
    setCodeError(error);
    if (error) return;

    const result = await verifyResetCode(email, entered);
    if (!result.ok) {
      setFailure(result.message);
      return;
    }

    setPasswords(EMPTY_PASSWORD);
    setPasswordErrors({});
    setStep('password');
  }

  async function save() {
    if (busy) return;
    setFailure(null);

    const errors = validateNewPassword(passwords);
    setPasswordErrors(errors);
    if (hasErrors(errors)) return;

    const result = await resetPassword(email, passwords.password);
    if (!result.ok) {
      // The ticket is gone in every case this fails, so there is nothing left
      // to retry on this step — send them back to the start of the flow.
      setFailure(result.message);
      setStep('email');
      setCode('');
      return;
    }

    onDone();
  }

  return (
    <View style={styles.flow}>
      {/* Stays at the top while everything below it centres. A back button
          that floats to the middle of the screen with the content is not
          where anyone reaches for one. */}
      <View style={styles.header}>
        {/* Its own handler, not the shared default: inside the flow back
            means the previous step, and only on the first one does it mean
            leaving the screen. */}
        <BackButton onPress={back} label={step === 'email' ? 'Go back' : 'Back a step'} />

        <StepDots step={step} />
      </View>

      <View style={styles.centre}>
        <StepArt step={step} />

        <Text style={styles.title}>
          {step === 'email' ? 'Forgot your password?' : null}
          {step === 'code' ? 'Check your email' : null}
          {step === 'password' ? 'Choose a new password' : null}
        </Text>

        <Text style={styles.blurb}>
          {step === 'email'
            ? 'Enter the email on your Agoua account and we will send you a code to reset it.'
            : null}
          {step === 'code' ? `We sent a ${CODE_LENGTH}-digit code to ${maskEmail(email.trim())}.` : null}
          {step === 'password' ? 'Your code checks out. Pick something you have not used here before.' : null}
        </Text>

        {failure ? (
          <View accessibilityLiveRegion="polite" style={styles.failure}>
            <Ionicons name="alert-circle-outline" size={15} color={Colors.primary} />
            <Text style={styles.failureText}>{failure}</Text>
          </View>
        ) : null}

        {step === 'email' ? (
          <>
            <AuthField
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={sendCode}
              value={email}
              error={emailError}
              onChangeText={setEmail}
            />

            <PrimaryButton
              label={busy ? 'Sending…' : 'Send code'}
              onPress={sendCode}
              style={styles.submit}
            />

            <Pressable
              onPress={onExit}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to log in"
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
              <Text style={styles.linkText}>Remembered it? Log in</Text>
            </Pressable>
          </>
        ) : null}

        {step === 'code' ? (
          <>
            <View style={styles.codeWrap}>
              <CodeInput
                value={code}
                length={CODE_LENGTH}
                error={codeError}
                onChangeText={(next) => {
                  setCode(next);
                  // Both messages describe the code that was just changed, so
                  // they go with it rather than sitting there being wrong while
                  // a correct code is typed underneath.
                  setCodeError(undefined);
                  setFailure(null);
                }}
                // Checked on the last digit rather than waiting for the button:
                // there is nothing else to fill in, so the tap only exists for
                // anyone whose code arrived by autofill.
                onComplete={verify}
              />
            </View>

            {devCode ? (
              <View style={styles.devHint}>
                <Ionicons name="construct-outline" size={14} color={Colors.secondary} />
                <Text style={styles.devHintText}>
                  No mail is actually sent yet — your code is {devCode}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              label={busy ? 'Checking…' : 'Verify code'}
              onPress={() => verify()}
              style={styles.submit}
            />

            <Pressable
              onPress={resend}
              disabled={busy || resendIn > 0}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Send a new code"
              accessibilityState={{ disabled: busy || resendIn > 0 }}
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
              <Text style={[styles.linkText, resendIn > 0 && styles.linkTextMuted]}>
                {resendIn > 0 ? `Send a new code in ${resendIn}s` : 'Send a new code'}
              </Text>
            </Pressable>
          </>
        ) : null}

        {step === 'password' ? (
          <>
            <AuthField
              label="New password"
              icon="lock-closed-outline"
              placeholder={`At least ${PASSWORD_MIN} characters`}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secure
              value={passwords.password}
              error={passwordErrors.password}
              onChangeText={(password) => setPasswords((current) => ({ ...current, password }))}
            />

            <AuthField
              label="Confirm new password"
              icon="lock-closed-outline"
              placeholder="Type it again"
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={save}
              secure
              value={passwords.confirm}
              error={passwordErrors.confirm}
              onChangeText={(confirm) => setPasswords((current) => ({ ...current, confirm }))}
            />

            <PrimaryButton
              label={busy ? 'Saving…' : 'Save new password'}
              onPress={save}
              style={styles.submit}
            />

            <Text style={styles.legal}>
              Saving signs you in on this device. Anywhere else stays signed in until you log out
              there.
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

// The flow's one piece of artwork, carried across all three steps. It is what
// this screen looks like — giving each step a picture of its own would make one
// flow read as three unrelated places.
const ART = require('@/assets/images/illustration/forget.png');

// Roomy on the opening step, trimmed once there are fields to keep clear of the
// keyboard: step three carries two of them, and at the full height the save
// button lands under the keyboard on a small phone.
const ART_HEIGHT = 265;
const ART_HEIGHT_COMPACT = 190;

function StepArt({ step }: { step: Step }) {
  return (
    <Image
      source={ART}
      // `contain`, so the heights above are a budget rather than a crop — the
      // artwork keeps its own proportions inside one at any screen width.
      contentFit="contain"
      // Decoration: the heading under it already says what step this is, and
      // there is nothing in the picture that a caption would add.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.art, { height: step === 'email' ? ART_HEIGHT : ART_HEIGHT_COMPACT }]}
    />
  );
}

// Position in the flow, as three bars rather than numbers: the steps are not
// worth naming twice — the heading above already says where you are — and a
// filled bar reads as progress at a glance.
function StepDots({ step }: { step: Step }) {
  const index = STEPS.indexOf(step);

  return (
    <View
      style={styles.dots}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}>
      {STEPS.map((name, position) => (
        <View key={name} style={[styles.dot, position <= index && styles.dotDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flow: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  // Holds the artwork and the step itself, centred in whatever the header
  // leaves. The fields stay full width inside it — a centred column of inputs
  // narrower than the button under them looks like a mistake — so only the
  // artwork and the type are actually centred.
  centre: {
    flex: 1,
    justifyContent: 'center',
  },
  // Full width with `contain` doing the centring, rather than a measured box:
  // the artwork has a transparent margin of its own, so a tight frame around
  // it would not look any tighter.
  art: {
    width: '100%',
    marginBottom: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 22,
    height: 5,
    borderRadius: 999,
    backgroundColor: Glass.fill,
  },
  dotDone: {
    backgroundColor: Colors.primary,
  },
  title: {
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 33,
    color: Colors.onLight,
  },
  // Held short of the full width: centred prose running edge to edge gives the
  // eye no consistent left margin to return to on the second line.
  blurb: {
    alignSelf: 'center',
    maxWidth: 320,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  failure: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Glass.fill,
  },
  failureText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.onLight,
  },
  codeWrap: {
    marginBottom: 4,
  },
  // Marked as scaffolding rather than styled as a normal hint, so it is
  // obvious this line goes away with the mock behind it.
  devHint: {
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Glass.secondaryBorder,
  },
  devHintText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  submit: {
    alignSelf: 'stretch',
  },
  link: {
    marginTop: 16,
    alignSelf: 'center',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  linkTextMuted: {
    color: Colors.textMuted,
  },
  legal: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
});
