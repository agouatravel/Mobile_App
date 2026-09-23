import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PANEL_RADIUS } from '@/components/visas/metrics';
import { formatPhone, SUPPORT_PHONE } from '@/constants/contact';
import { VISA_PROMO } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

// The two blocks that close the screen. They live in one file because they are
// one idea between them — the screen has finished explaining itself and is now
// asking you to get in touch.

// "Need Help?" — the desk, and two ways to reach it.
//
// The reference sets the title, the number and the button on a single line. At
// 350pt of usable width that leaves the number about 120pt, which it does not
// fit into, so the number gets its own row here. It is the better target for
// it anyway: a phone number is something you tap, and a tap target inline
// between two other elements is one most people will not find.
export function VisaHelp({ onCall }: { onCall: () => void }) {
  return (
    <View style={styles.helpCard}>
      <View style={styles.helpTop}>
        <View style={styles.helpCopy}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpDetail}>Our visa experts are ready to assist you</Text>
        </View>

        <Pressable
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel="Chat now with a visa expert"
          style={({ pressed }) => [styles.chat, pressed && styles.pressed]}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.primary} />
          <Text style={styles.chatLabel}>Chat Now</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onCall}
        accessibilityRole="button"
        // The formatted number reads as digits to a screen reader either way,
        // but the label says what pressing it does.
        accessibilityLabel={`Call the visa desk on ${formatPhone(SUPPORT_PHONE)}`}
        style={({ pressed }) => [styles.phoneRow, pressed && styles.pressed]}>
        <Ionicons name="call" size={15} color={Colors.secondary} />
        <Text style={styles.phone}>{formatPhone(SUPPORT_PHONE)}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

// The offer banner at the foot of the screen.
//
// The reference draws this in green. Green is not one of the app's colours and
// this is the loudest thing on the screen, so it takes the brand's own lit
// orange instead — the same gradient the compact CTAs use. That makes the
// button inside it the problem: a filled CTA on a filled banner has nothing to
// separate it. It inverts, white on the blue, which is the same trick the
// bottom bar's active tab plays for the same reason.
export function VisaPromo({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.promo}>
      <View style={styles.promoCopy}>
        <Text style={styles.promoKicker}>{VISA_PROMO.kicker}</Text>
        <Text style={styles.promoHeadline}>GET {VISA_PROMO.discount}% OFF</Text>
        <Text style={styles.promoDetail}>{VISA_PROMO.detail}</Text>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${VISA_PROMO.cta}. Opens Offers`}
        style={({ pressed }) => [styles.promoCta, pressed && styles.pressed]}>
        <Text style={styles.promoCtaLabel}>{VISA_PROMO.cta}</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  helpCard: {
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helpTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  helpDetail: {
    marginTop: 2,
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  // Outlined rather than filled: the solid orange fill is spoken for by the
  // banner directly below this card, and two loud oranges stacked would leave
  // neither reading as the more important one.
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.primary}55`,
    backgroundColor: `${Colors.primary}0F`,
  },
  chatLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  phoneRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phone: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onLight,
  },
  promo: {
    marginTop: 14,
    borderRadius: PANEL_RADIUS,
    padding: 16,
    // The banner is one of the few filled blue surfaces in the app — it is an
    // offer, and it has to interrupt. It was a gradient and carried no fill of
    // its own; flat now, with the CTA inside it inverting to white.
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoCopy: {
    flex: 1,
  },
  promoKicker: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primaryForeground,
    opacity: 0.9,
  },
  promoHeadline: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  promoDetail: {
    marginTop: 2,
    fontSize: 11.5,
    color: Colors.primaryForeground,
    opacity: 0.9,
  },
  promoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  promoCtaLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
