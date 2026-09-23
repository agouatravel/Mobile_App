import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PANEL_RADIUS, SIDE_PADDING } from '@/components/visas/metrics';
import { VisaFacts } from '@/components/visas/visa-facts';
import { VisaSteps } from '@/components/visas/visa-steps';
import { formatPrice } from '@/constants/currency';
import { SUPPORT_PHONE } from '@/constants/contact';
import { ALL_VISAS, VISA_DOCUMENTS } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

const FLAG_ASPECT = 1.5;

// The pinned bar's own height — button plus the padding above it — which is
// what the scroller has to clear so the last section is reachable.
const ACTION_BAR_HEIGHT = 52 + 12;

// One country's tourist visa: what it costs, how long it takes, what to bring,
// and the two things you can do about it.
export default function VisaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { key } = useLocalSearchParams<{ key?: string }>();

  const visa = ALL_VISAS.find((entry) => entry.key === key);
  const contentWidth = width - SIDE_PADDING * 2;

  const call = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
  };

  // Reachable by deep link and by a stale key, the same way package.tsx is, so
  // it has to say so rather than render a page of blanks.
  if (!visa) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>That visa is no longer listed.</Text>
        <Pressable
          onPress={() => router.replace('/visas')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.book, pressed && styles.pressed]}>
          <Text style={styles.bookLabel}>Back to visas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Outside the scroller rather than pinned over it, so it takes its own
          space at the top and the content below scrolls within what is left.
          Floating it would need a background to hide the content passing
          underneath, and an opaque band there would paint over the one part of
          the aurora backdrop that is actually coloured. */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <BackButton />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {visa.name}
        </Text>
        <Pressable
          onPress={call}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Call the visa desk"
          style={({ pressed }) => [styles.support, pressed && styles.pressed]}>
          <Ionicons name="headset-outline" size={19} color={Colors.secondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // Clears the pinned action bar below, so the last section can be
          // scrolled out from behind it.
          paddingBottom: ACTION_BAR_HEIGHT + insets.bottom + 24,
        }}>
        <View style={styles.section}>
          <View style={styles.hero}>
            {/* Decorative: the name is directly underneath. */}
            <View style={[styles.flag, { width: contentWidth - 28 }]}>
              <Image
                source={visa.flag}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
                accessible={false}
              />
            </View>

            <Text style={styles.name}>{visa.name}</Text>
            <Text style={styles.region}>{visa.region}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.fromLabel}>From</Text>
              <Text style={styles.price}>{formatPrice(visa.from)}</Text>
              <Text style={styles.perPerson}>per person</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <VisaFacts visa={visa} width={contentWidth} />
        </View>

        <Text style={styles.sectionHeading}>What you&apos;ll need</Text>
        <View style={styles.section}>
          <View style={styles.panel}>
            {VISA_DOCUMENTS.map((document) => (
              <View key={document} style={styles.documentRow}>
                <Ionicons name="checkmark-circle" size={17} color={Colors.secondary} />
                <Text style={styles.document}>{document}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionHeading}>How it works</Text>
        <View style={styles.section}>
          <VisaSteps />
        </View>
      </ScrollView>

      {/* Pinned rather than scrolled. These two are why the page exists, and a
          call button you have to reach the bottom to find is one nobody uses. */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={call}
          accessibilityRole="button"
          accessibilityLabel="Call the visa desk"
          style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
          <Ionicons name="call" size={17} color={Colors.secondary} />
          <Text style={styles.callLabel}>Call</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: '/visa-booking', params: { key: visa.key } })}
          accessibilityRole="button"
          accessibilityLabel={`Book ${visa.name}`}
          style={({ pressed }) => [styles.book, pressed && styles.pressed]}>
          <Text style={styles.bookLabel}>Book this visa</Text>
          <Ionicons name="arrow-forward" size={17} color={Colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
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
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  support: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: SIDE_PADDING,
  },
  hero: {
    alignItems: 'center',
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: 14,
  },
  flag: {
    aspectRatio: FLAG_ASPECT,
    borderRadius: PANEL_RADIUS - 8,
    // Japan, the UAE and the US all reach their edge in white, and so does the
    // card behind them.
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Glass.fill,
    overflow: 'hidden',
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onLight,
  },
  region: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textMuted,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  fromLabel: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.accent,
  },
  perPerson: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  sectionHeading: {
    marginTop: 24,
    paddingHorizontal: SIDE_PADDING,
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.onLight,
  },
  panel: {
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 11,
  },
  documentRow: {
    flexDirection: 'row',
    gap: 9,
  },
  document: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  // Sits over the scroller, carrying its own surface so the content passing
  // under it stays legible. It is the only bar on this screen now: detail
  // screens no longer show the tab bar, which is what this used to have to be
  // padded clear of.
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: `${Colors.secondary}55`,
    backgroundColor: `${Colors.secondary}0F`,
  },
  callLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
  },
  book: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
  },
  bookLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.primaryForeground,
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
