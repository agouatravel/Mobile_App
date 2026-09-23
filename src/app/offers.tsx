import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_CONTENT_INSET } from '@/components/bottom-tab-bar';
import { OfferFilterRail, OfferSortPill } from '@/components/offers/offer-filter-bar';
import { OfferHero } from '@/components/offers/offer-hero';
import { OfferPairCard } from '@/components/offers/offer-pair-card';
import { OfferTicket } from '@/components/offers/offer-ticket';
import { GAP, SIDE_PADDING } from '@/components/offers/metrics';
import {
  ALL_FILTER,
  OFFER_FILTERS,
  filterOffers,
  resolveOffers,
  sortOffers,
  type OfferFilter,
  type OfferSort,
  type ResolvedOffer,
} from '@/constants/offers-data';
import { Colors } from '@/constants/theme';

// Hero is close to square: it has to carry a caption block, a price and a CTA
// over the photograph, and a wider ratio leaves them stacked on top of the
// image's subject.
const HERO_ASPECT = 1.05; // width / height

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [filter, setFilter] = useState<OfferFilter>(ALL_FILTER);
  const [sort, setSort] = useState<OfferSort>('Biggest discount');

  const offers = useMemo(() => resolveOffers(), []);
  const featured = useMemo(() => offers.filter((offer) => offer.featured), [offers]);

  // The list shows every offer that matches the chip, featured ones included:
  // filtering to a duration and then hiding the tour that happens to be the
  // hero would look like the list had lost it.
  const listed = useMemo(
    () => sortOffers(filterOffers(offers, filter), sort),
    [offers, filter, sort]
  );

  const contentWidth = width - SIDE_PADDING * 2;
  const heroHeight = Math.round(contentWidth / HERO_ASPECT);
  const halfWidth = Math.floor((contentWidth - GAP) / 2);

  const openOffer = (offer: ResolvedOffer) =>
    router.push({ pathname: '/offer', params: { key: offer.key } });

  const [hero, ...pair] = featured;

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: TAB_BAR_CONTENT_INSET + 24,
      }}>
      {/* Offers is a bottom tab, so it owns its header the way Home and
          Explore do rather than taking the pushed-screen Navbar. */}
      <View style={styles.header}>
        <Text style={styles.title}>Offers</Text>
        <Text style={styles.subtitle}>{offers.length} tours on offer, updated daily</Text>
      </View>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Featured</Text>
      </View>

      {hero ? (
        <OfferHero
          offer={hero}
          width={contentWidth}
          height={heroHeight}
          onPress={() => openOffer(hero)}
        />
      ) : null}

      {pair.length > 0 ? (
        <View style={styles.pairRow}>
          {pair.map((offer) => (
            <OfferPairCard
              key={offer.key}
              offer={offer}
              width={halfWidth}
              onPress={() => openOffer(offer)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>All offers</Text>
        <Text style={styles.sectionCount}>{listed.length}</Text>
        <View style={styles.spacer} />
        <OfferSortPill value={sort} onChange={setSort} />
      </View>

      <OfferFilterRail filters={OFFER_FILTERS} value={filter} onChange={setFilter} />

      {listed.length === 0 ? (
        <Text style={styles.empty}>
          {filter === ALL_FILTER
            ? 'No offers are running right now.'
            : `No ${filter.toLowerCase()} offers are running right now.`}
        </Text>
      ) : (
        <View style={styles.list}>
          {listed.map((offer) => (
            <OfferTicket
              key={offer.key}
              offer={offer}
              width={contentWidth}
              onPress={() => openOffer(offer)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIDE_PADDING,
    gap: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.onLight,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionHeadingRow: {
    marginTop: 24,
    marginBottom: 14,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.foreground,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  // Pushes the sort pill to the trailing edge without stretching the heading
  // itself, which would let a long heading squeeze the count out.
  spacer: {
    flex: 1,
  },
  // One column: the tickets are full-width cards, not tiles.
  list: {
    paddingHorizontal: SIDE_PADDING,
    gap: 14,
  },
  pairRow: {
    marginTop: GAP,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    gap: GAP,
  },
  empty: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
