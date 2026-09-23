import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassButton } from '@/components/glass/glass-button';
import { PrimaryButton } from '@/components/glass/primary-button';
import { FactStrip } from '@/components/tour/fact-strip';
import { InclusionList } from '@/components/tour/inclusion-list';
import { ItineraryTimeline } from '@/components/tour/itinerary-timeline';
import { TourTabs, type TourTab } from '@/components/tour/tour-tabs';
import { SUPPORT_PHONE, formatPhone } from '@/constants/contact';
import { formatPrice } from '@/constants/currency';
import { findOffer, type ResolvedOffer } from '@/constants/offers-data';
import { OPERATOR, TERMS_INTRO, TOUR_TERMS } from '@/constants/tours-data';
import { Colors, Glass } from '@/constants/theme';

// Matches the route artwork's own 3:2 proportions, so the hero shows the whole
// map rather than cropping the ends of the route off.
const HERO_ASPECT = 1.5; // width / height

// The dissolve has to happen *under* the artwork rather than across it. The
// route's southern half — Yanbu, Jeddah and the departure marker, four of the
// ten stops — sits in the bottom third of the map, which is exactly the band
// the fade used to eat. So the hero is the map's full height plus an empty
// tail, and the gradient only reaches FADE_EDGE up into the image: far enough
// to take the hard bottom line off it, not far enough to reach a marker.
const FADE_TAIL = 44;
const FADE_EDGE = 10;

const ROUND = 40;

export default function OfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { key } = useLocalSearchParams<{ key?: string }>();

  const [tab, setTab] = useState<TourTab>('Itinerary');

  const offer = findOffer(key);

  // Not guarded with canOpenURL: on iOS that needs the scheme declared in
  // LSApplicationQueriesSchemes, and on web it always answers true, so it
  // would add config without adding certainty. A failed dial rejects instead.
  const callSupport = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
  };

  // TODO: wire to the booking flow once it exists.
  const book = () => {};

  if (!offer) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>That tour is no longer available.</Text>
        <PrimaryButton label="Back to offers" onPress={() => router.back()} />
      </View>
    );
  }

  // Full artwork, then the tail it dissolves into.
  const mapHeight = Math.round(width / HERO_ASPECT);
  const heroHeight = mapHeight + FADE_TAIL;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.hero, { height: heroHeight }]}>
        {/* Masked rather than overlaid with a scrim: the app backdrop still
            has colour this far down the page, so fading the image to a flat
            colour would leave a pale halo where the two disagreed. Fading its
            alpha instead lets the real backdrop show through, and the image
            dissolves into the page rather than ending at an edge. */}
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              style={StyleSheet.absoluteFill}
              colors={['#000', '#000', 'transparent']}
              // Ends level with the foot of the map: past that there is
              // nothing left to fade, only the tail the page shows through.
              locations={[0, (mapHeight - FADE_EDGE) / heroHeight, mapHeight / heroHeight]}
            />
          }>
          {/* `contain` rather than `cover`, and pinned to the top rather than
              stretched over the tail: the container is deliberately taller
              than the artwork now, so anything that fills it would either crop
              the map or centre it away from the controls above. */}
          <Image
            source={offer.mapImage}
            style={[styles.heroImage, { height: mapHeight }]}
            contentFit="contain"
            transition={200}
          />
        </MaskedView>

        <View style={[styles.heroTopRow, { top: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={21} color={Colors.onLight} />
          </Pressable>

          {/* Calling is the low-commitment action, so it stays reachable from
              the top of the screen as well as from the buttons at the end. */}
          <Pressable
            onPress={callSupport}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Call reservations on ${formatPhone()}`}
            style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
            <Ionicons name="call" size={19} color={Colors.onLight} />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.operator}>
          {OPERATOR} · {offer.tagline}
        </Text>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{offer.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={Colors.primary} />
            <Text style={styles.ratingValue}>{offer.rating}</Text>
          </View>
        </View>

        <View style={styles.factWrap}>
          <FactStrip duration={offer.duration} route={offer.route} kind={offer.kind} />
        </View>

        <PriceCard offer={offer} onBook={book} />

        <Text style={styles.summary}>{offer.summary}</Text>

        <Text style={styles.sectionLabel}>Usually included</Text>
        <View style={styles.chips}>
          {offer.usuallyIncluded.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipLabel}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabsWrap}>
          <TourTabs value={tab} onChange={setTab} />
        </View>

        {tab === 'Itinerary' ? (
          <>
            <Text style={styles.panelTitle}>Day-by-day plan</Text>
            <Text style={styles.panelSubtitle}>Your route and activities</Text>
            <ItineraryTimeline days={offer.itinerary} />
          </>
        ) : null}

        {tab === 'Inclusions' ? (
          <>
            <Text style={styles.panelTitle}>Inclusions &amp; exclusions</Text>
            <Text style={styles.panelSubtitle}>What is covered and what is not</Text>
            <InclusionList title="Include" items={offer.inclusions} tone="include" />
            <InclusionList title="Exclude" items={offer.exclusions} tone="exclude" />

            {offer.perks.length > 0 ? (
              <View style={styles.perkBlock}>
                <Text style={styles.perkTitle}>Added by this offer</Text>
                {offer.perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <Ionicons name="gift" size={15} color={Colors.primary} />
                    <Text style={styles.perkText}>{perk}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {tab === 'Terms' ? (
          <>
            <Text style={styles.panelTitle}>Terms &amp; conditions</Text>
            <Text style={styles.panelSubtitle}>
              General booking and travel terms for packages with Agoua Travel
            </Text>
            <Text style={styles.termsIntro}>{TERMS_INTRO}</Text>

            <View style={styles.terms}>
              {TOUR_TERMS.map((term, index) => (
                <View key={term} style={styles.termRow}>
                  <Text style={styles.termNumber}>{index + 1}</Text>
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}
            </View>

            {offer.terms.length > 0 ? (
              <View style={styles.perkBlock}>
                <Text style={styles.perkTitle}>This offer</Text>
                {offer.terms.map((term) => (
                  <Text key={term} style={styles.offerTerm}>
                    • {term}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {/* Inline rather than pinned to the bottom of the window: the floating
            tab bar and its raised knob already occupy that strip, and a
            sticky bar there ends up half under the knob. */}
        <View style={styles.actions}>
          <GlassButton
            label="Call"
            onPress={callSupport}
            icon={<Ionicons name="call" size={17} color={Colors.secondary} />}
            style={styles.callButton}
          />
          <PrimaryButton label="Book now" onPress={book} style={styles.bookButton} />
        </View>

        <Text style={styles.callHint}>Reservations {formatPhone()} • 24/7</Text>
      </View>
    </ScrollView>
  );
}

// Carries the price and the primary CTA together near the top of the page, so
// booking does not depend on scrolling past a ten-day itinerary first. The
// pair at the foot of the screen stays for anyone who reads all the way down.
function PriceCard({ offer, onBook }: { offer: ResolvedOffer; onBook: () => void }) {
  return (
    <View style={styles.priceCard}>
      <View style={styles.priceTopRow}>
        <View style={styles.priceMain}>
          <Text style={styles.priceLabel}>Price</Text>
          <View style={styles.priceLine}>
            <Text style={styles.priceNow}>{formatPrice(offer.now)}</Text>
            <Text style={styles.priceWas}>{formatPrice(offer.was)}</Text>
          </View>
          <Text style={styles.pricePer}>per person</Text>
        </View>

        <CompactBookButton onPress={onBook} />
      </View>

      <View style={styles.priceRule} />

      <View style={styles.savingRow}>
        <Ionicons name="pricetag" size={14} color={Colors.secondary} />
        <Text style={styles.savingText}>
          You save {formatPrice(offer.saving)} per person on this offer
        </Text>
      </View>
    </View>
  );
}

// A small CTA rather than the full-width PrimaryButton: it sits beside the
// price, so it has to stay narrow enough that the number stays the loudest
// thing in the card. At that size a flat fill reads as a static chip, so this
// one is lit with a gradient and an arrow to keep it looking pressable — the
// full-width button at the foot of the page is still the main commitment.
function CompactBookButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Book now"
      style={({ pressed }) => [styles.bookNow, pressed && styles.bookNowPressed]}>
      <Text style={styles.bookNowLabel}>Book</Text>
      <Ionicons name="arrow-forward" size={13} color={Colors.primaryForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // No background of its own: the lower part of the image is transparent, and
  // a fill here would be exactly the hard edge the mask exists to remove.
  hero: {
    width: '100%',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroTopRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Sits over the photo, so it carries its own surface rather than relying on
  // the image being light enough behind it.
  roundButton: {
    width: ROUND,
    height: ROUND,
    borderRadius: ROUND / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    // Negative: it pulls the text up into the hero's tail, which is empty now
    // that the fade sits below the map rather than across it — so the heading
    // still tucks under the artwork instead of starting a gap below it.
    marginTop: -28,
  },
  operator: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: Colors.secondary,
  },
  titleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    color: Colors.onLight,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onLight,
  },
  factWrap: {
    marginTop: 18,
  },
  priceCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: 16,
  },
  priceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceMain: {
    flex: 1,
    gap: 3,
  },
  priceRule: {
    height: 1,
    marginVertical: 14,
    backgroundColor: Colors.divider,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  savingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceNow: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.accent,
  },
  priceWas: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  pricePer: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  // overflow hidden so the gradient takes the pill's corners; the glow is cast
  // by the Pressable itself, which is outside the clip.
  bookNow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  bookNowPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.95,
  },
  bookNowLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: Colors.primaryForeground,
  },
  summary: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
  chips: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onLight,
  },
  tabsWrap: {
    marginTop: 26,
    marginBottom: 22,
  },
  panelTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  panelSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textMuted,
  },
  termsIntro: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  terms: {
    marginTop: 14,
    gap: 12,
  },
  termRow: {
    flexDirection: 'row',
    gap: 10,
  },
  termNumber: {
    width: 18,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.secondary,
  },
  termText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  perkBlock: {
    marginTop: 22,
    gap: 8,
  },
  perkTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onLight,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  offerTerm: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
  },
  actions: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callButton: {
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  bookButton: {
    flex: 1,
  },
  callHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  missingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
