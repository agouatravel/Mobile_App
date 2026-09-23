import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthField } from '@/components/account/auth-field';
import { useAuth } from '@/components/account/auth-provider';
import { BackButton } from '@/components/back-button';
import { PANEL_RADIUS, SIDE_PADDING } from '@/components/visas/metrics';
import { hasErrors, type FieldErrors } from '@/constants/auth';
import {
  EMPTY_BOOKING,
  bookingTotal,
  makeBookingReference,
  validateBooking,
  type BookingInput,
} from '@/constants/booking';
import { formatPhone, SUPPORT_PHONE } from '@/constants/contact';
import { formatPrice } from '@/constants/currency';
import { ALL_VISAS, type VisaCountry } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

// Request a visa for one country.
//
// The form follows signup-form.tsx: local state, a pure validator from
// constants/, and AuthField for every input. AuthField is reused rather than
// copied — its name says "auth" because that is where it was first needed, but
// it is a labelled text input with an error line and nothing about it is
// specific to signing in. A near-copy here would drift from it the first time
// either was touched.
export default function VisaBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key?: string }>();
  const { account } = useAuth();

  const visa = ALL_VISAS.find((entry) => entry.key === key);

  // Prefilled from the session where there is one, and editable either way:
  // the traveller is not always the account holder, and the passport name is
  // what the application needs.
  const [input, setInput] = useState<BookingInput>(() => ({
    ...EMPTY_BOOKING,
    fullName: account ? `${account.firstName} ${account.lastName}`.trim() : '',
    email: account?.email ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors<BookingInput>>({});
  // Holding the reference is what marks the request as sent — there is no
  // network call to be in flight, so there is no separate "busy" state to keep.
  const [reference, setReference] = useState<string | null>(null);

  const set = <K extends keyof BookingInput>(field: K) => (value: BookingInput[K]) =>
    setInput((current) => ({ ...current, [field]: value }));

  const call = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
  };

  function submit() {
    const found = validateBooking(input);
    setErrors(found);
    if (hasErrors(found)) return;
    setReference(makeBookingReference());
  }

  if (!visa) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>That visa is no longer listed.</Text>
        <Pressable
          onPress={() => router.replace('/visas')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>Back to visas</Text>
        </Pressable>
      </View>
    );
  }

  if (reference) {
    return <Confirmation visa={visa} reference={reference} onCall={call} />;
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        // `padding` on iOS and `height` on Android is the pairing that behaves
        // for a form inside a scroller — the same combination login.tsx uses.
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Outside the scroller, so it holds its place while the form moves
            under it — and so a keyboard pushing the fields up cannot take the
            way out of the screen with them. */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <BackButton />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Book this visa
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
            paddingBottom: insets.bottom + 24,
          }}>
          <VisaSummary visa={visa} travellers={input.travellers} />

          <View style={styles.form}>
            <AuthField
              label="Traveller's full name"
              icon="person-outline"
              placeholder="As printed in the passport"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={input.fullName}
              error={errors.fullName}
              onChangeText={set('fullName')}
            />

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
              onChangeText={set('email')}
            />

            <AuthField
              label="Contact number"
              icon="call-outline"
              placeholder="+966 5X XXX XXXX"
              autoCapitalize="none"
              autoComplete="tel"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              value={input.phone}
              error={errors.phone}
              onChangeText={set('phone')}
            />

            <View style={styles.row}>
              <View style={styles.rowWide}>
                <AuthField
                  label="Travel date"
                  icon="calendar-outline"
                  placeholder="DD/MM/YYYY"
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                  value={input.travelDate}
                  error={errors.travelDate}
                  onChangeText={set('travelDate')}
                />
              </View>

              <View style={styles.rowNarrow}>
                <AuthField
                  label="Travellers"
                  icon="people-outline"
                  placeholder="1"
                  keyboardType="number-pad"
                  value={input.travellers}
                  error={errors.travellers}
                  onChangeText={set('travellers')}
                />
              </View>
            </View>

            <AuthField
              label="Anything else? (optional)"
              icon="chatbubble-ellipses-outline"
              placeholder="Dates flexible, group booking…"
              autoCapitalize="sentences"
              value={input.notes}
              error={undefined}
              onChangeText={set('notes')}
            />
          </View>

          <Pressable
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel="Submit booking request"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryLabel}>Submit request</Text>
            <Ionicons name="arrow-forward" size={17} color={Colors.primaryForeground} />
          </Pressable>

          <Text style={styles.disclaimer}>
            Submitting does not charge you. The desk confirms the price and the
            documents on the call.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// The flag, the country and what the request comes to, above the fields.
//
// The total recomputes as the traveller count is typed, so the number beside
// the submit button is the one the form is actually asking for rather than the
// per-person price it started from.
function VisaSummary({ visa, travellers }: { visa: VisaCountry; travellers: string }) {
  const total = bookingTotal(visa.from, travellers);
  const count = Number(travellers.trim());
  const many = Number.isInteger(count) && count > 1;

  return (
    <View style={styles.summary}>
      <View style={styles.summaryFlag}>
        <Image
          source={visa.flag}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryName} numberOfLines={1}>
          {visa.name}
        </Text>
        <Text style={styles.summaryMeta} numberOfLines={1}>
          {visa.region} · {visa.processingDays} days
        </Text>
      </View>

      <View style={styles.summaryPrice}>
        <Text style={styles.summaryTotal}>{formatPrice(total)}</Text>
        <Text style={styles.summaryUnit}>
          {many ? `${count} × ${formatPrice(visa.from)}` : 'per person'}
        </Text>
      </View>
    </View>
  );
}

// What the form becomes once it validates.
//
// A state of this screen rather than a route of its own: a confirmation you can
// navigate back into is a confirmation you can see for a request that was never
// made, and this one is the only record of the reference.
function Confirmation({
  visa,
  reference,
  onCall,
}: {
  visa: VisaCountry;
  reference: string;
  onCall: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.confirmation,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.tick}>
        <Ionicons name="checkmark" size={34} color={Colors.primaryForeground} />
      </View>

      <Text style={styles.confirmTitle}>Request received</Text>
      <Text style={styles.confirmDetail}>
        Your {visa.name} request is with our visa desk. They will call to confirm
        the price and the documents within one working day.
      </Text>

      <View style={styles.referenceCard}>
        <Text style={styles.referenceLabel}>Your reference</Text>
        {/* Selectable because the whole point of it is being read back, and on a
            phone that means copying it rather than writing it down. */}
        <Text style={styles.reference} selectable>
          {reference}
        </Text>
      </View>

      <Pressable
        onPress={onCall}
        accessibilityRole="button"
        accessibilityLabel={`Call the visa desk on ${formatPhone(SUPPORT_PHONE)}`}
        style={({ pressed }) => [styles.primary, styles.confirmAction, pressed && styles.pressed]}>
        <Ionicons name="call" size={17} color={Colors.primaryForeground} />
        <Text style={styles.primaryLabel}>Call the desk now</Text>
      </Pressable>

      {/* `replace`, not `back`: back would return to the form that has just been
          submitted, which would only offer to submit it again. */}
      <Pressable
        onPress={() => router.replace('/visas')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <Text style={styles.secondaryLabel}>Back to visas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  summary: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: 14,
  },
  summaryFlag: {
    width: 46,
    height: 46 / 1.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Glass.fill,
    overflow: 'hidden',
  },
  summaryCopy: {
    flex: 1,
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onLight,
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textMuted,
  },
  summaryPrice: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
  },
  summaryUnit: {
    marginTop: 1,
    fontSize: 11,
    color: Colors.textMuted,
  },
  form: {
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  // The date needs room for DD/MM/YYYY; the count never needs more than two
  // digits, so the split is weighted rather than even.
  rowWide: {
    flex: 2,
  },
  rowNarrow: {
    flex: 1,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
  },
  primaryLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  disclaimer: {
    marginTop: 14,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  confirmation: {
    alignItems: 'center',
    paddingHorizontal: SIDE_PADDING,
  },
  tick: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  confirmTitle: {
    marginTop: 20,
    fontSize: 23,
    fontWeight: '800',
    color: Colors.onLight,
  },
  confirmDetail: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  referenceCard: {
    marginTop: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 18,
  },
  referenceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  reference: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.onLight,
  },
  confirmAction: {
    marginTop: 26,
    alignSelf: 'stretch',
  },
  secondary: {
    marginTop: 12,
    height: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: `${Colors.secondary}55`,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: SIDE_PADDING,
  },
  missingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
