import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/glass/primary-button';
import { OfferRow } from '@/components/offers/offer-row';
import { GemCard } from '@/components/place/gem-card';
import { LocalTile } from '@/components/place/local-tile';
import { PlaceHero } from '@/components/place/place-hero';
import { StatTiles } from '@/components/place/stat-tiles';
import { EXPLORE_PLACES } from '@/constants/explore-data';
import { offersForPlace } from '@/constants/offers-data';
import { Colors, Glass } from '@/constants/theme';

const SIDE_PADDING = 20;
const GAP = 12;

// Tall rather than wide: the hero is the whole first screen, and a landscape
// crop would leave the caption block sitting in the middle of the page.
const HERO_ASPECT = 0.8; // width / height
const LEAD_TILE_H = 208;
const TILE_H = 152;

export default function PlaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { key } = useLocalSearchParams<{ key?: string }>();

  const place = EXPLORE_PLACES.find((entry) => entry.key === key);
  const offers = useMemo(() => offersForPlace(place?.key), [place?.key]);

  if (!place) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>That destination is no longer listed.</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  const contentWidth = width - SIDE_PADDING * 2;
  const halfWidth = Math.floor((contentWidth - GAP) / 2);
  const heroHeight = Math.round(width / HERO_ASPECT);

  const [lead, ...rest] = place.locals;

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <PlaceHero
        place={place}
        height={heroHeight}
        topInset={insets.top}
        onBack={() => router.back()}
      />

      <StatTiles
        weather={place.weather}
        trending={place.trending}
        offerCount={offers.length}
      />

      <Text style={styles.summary}>{place.summary}</Text>

      <View style={styles.gemWrap}>
        <GemCard gem={place.hiddenGem} width={contentWidth} />
      </View>

      <SectionHeading title="Worth seeing" />
      <View style={styles.mosaic}>
        {lead ? (
          <LocalTile local={lead} width={contentWidth} height={LEAD_TILE_H} wide />
        ) : null}

        {rest.length > 0 ? (
          <View style={styles.mosaicRow}>
            {rest.map((local) => (
              <LocalTile key={local.key} local={local} width={halfWidth} height={TILE_H} />
            ))}
          </View>
        ) : null}
      </View>

      <SectionHeading
        title={`Offers in ${place.name}`}
        count={offers.length}
        onSeeAll={() => router.push('/offers')}
      />
      {offers.length === 0 ? (
        <Text style={styles.empty}>No offers are running in {place.name} right now.</Text>
      ) : (
        <View style={styles.offers}>
          {offers.map((offer) => (
            <OfferRow
              key={offer.key}
              offer={offer}
              onPress={() => router.push({ pathname: '/offer', params: { key: offer.key } })}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.chips}>
          {place.highlights.map((highlight) => (
            <View key={highlight} style={styles.chip}>
              <Text style={styles.chipLabel}>{highlight}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton label="Plan this trip" onPress={() => {}} style={styles.cta} />
      </View>
    </ScrollView>
  );
}

function SectionHeading({
  title,
  count,
  onSeeAll,
}: {
  title: string;
  count?: number;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {count === undefined ? null : <Text style={styles.sectionCount}>{count}</Text>}
      <View style={styles.spacer} />
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  summary: {
    marginTop: 22,
    paddingHorizontal: SIDE_PADDING,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
  },
  gemWrap: {
    marginTop: 22,
    paddingHorizontal: SIDE_PADDING,
  },
  sectionHeadingRow: {
    marginTop: 28,
    marginBottom: 14,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onLight,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  // Pushes "See all" to the trailing edge without stretching the heading,
  // which would let a long destination name squeeze the count out.
  spacer: {
    flex: 1,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  mosaic: {
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
  mosaicRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  offers: {
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
  empty: {
    paddingHorizontal: SIDE_PADDING,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: 28,
    paddingHorizontal: SIDE_PADDING,
  },
  chips: {
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
  cta: {
    marginTop: 20,
    alignSelf: 'stretch',
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
    opacity: 0.7,
  },
});
