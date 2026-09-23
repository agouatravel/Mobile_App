import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { PhotoScrim } from '@/components/offers/photo-scrim';
import { PROMOS, type Promo } from '@/constants/home-data';
import { Colors, Glass, PhotoText } from '@/constants/theme';

const SIDE_PADDING = 20;
const GAP = 14;

// Every slide is this tall whatever is inside it. One of the three carries no
// picture at all, so the height cannot come from the artwork any more — and a
// rail whose slides changed height as you swiped would rock the page under it.
const SLIDE_H = 150;
const RADIUS = 18;

// Three genuinely different pieces of sale literature, not one card with three
// paint jobs:
//
//   type  — set in type alone, no picture, ruled off like a tear-off coupon.
//   plate — the photograph fills the card and the sale is printed over it.
//   split — the card is divided, type on one side and the picture on the other.
//
// They share only their size and their three beats. That is the point: a rail
// of near-identical cards is one advert shown three times, and nobody swipes
// past the first.
type Brochure = {
  kind: 'type' | 'plate' | 'split';
  accent: string;
};

const BROCHURES: Brochure[] = [
  { kind: 'type', accent: Colors.primary },
  { kind: 'plate', accent: Colors.primary },
  { kind: 'split', accent: Colors.secondary },
];

export function SalePosters({ onPressPromo }: { onPressPromo?: (promo: Promo) => void }) {
  const { width } = useWindowDimensions();
  const slideWidth = width - SIDE_PADDING * 2;
  const [index, setIndex] = useState(0);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / (slideWidth + GAP));
    setIndex(Math.min(Math.max(next, 0), PROMOS.length - 1));
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snap to one slide-plus-gap so a swipe always lands a slide flush with
        // the page's 20pt gutter rather than mid-scroll.
        snapToInterval={slideWidth + GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={styles.rail}>
        {PROMOS.map((promo, slideIndex) => (
          <SaleSlide
            key={promo.key}
            promo={promo}
            // By position rather than from the data: how a slide is set is a
            // property of this rail, not of the sale, and a fourth promo
            // should fall back into the first setting rather than arriving
            // without one.
            brochure={BROCHURES[slideIndex % BROCHURES.length]}
            width={slideWidth}
            onPress={() => onPressPromo?.(promo)}
          />
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {PROMOS.map((promo, dotIndex) => (
          <View key={promo.key} style={[styles.dot, dotIndex === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function SaleSlide({
  promo,
  brochure,
  width,
  onPress,
}: {
  promo: Promo;
  brochure: Brochure;
  width: number;
  onPress: () => void;
}) {
  const { kind, accent } = brochure;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${promo.deal}, ${promo.cta}`}
      style={({ pressed }) => [styles.slide, { width }, pressed && styles.pressed]}>
      {kind === 'type' ? <TypeSlide promo={promo} accent={accent} /> : null}
      {kind === 'plate' ? <PlateSlide promo={promo} /> : null}
      {kind === 'split' ? <SplitSlide promo={promo} accent={accent} /> : null}
    </Pressable>
  );
}

// No picture at all. The sale is the whole card, so it is set larger than
// anywhere else in the rail and the dashed rule around it does the work the
// photograph does on the other two — it gives the card an edge without giving
// it a fill.
function TypeSlide({ promo, accent }: { promo: Promo; accent: string }) {
  return (
    <View style={[styles.type, { borderColor: accent }]}>
      <View style={styles.tagRow}>
        <Ionicons name="pricetag" size={13} color={accent} />
        <View style={[styles.tagRule, { backgroundColor: accent }]} />
      </View>

      <Text style={[styles.dealLarge, { color: accent }]} numberOfLines={1}>
        {promo.deal}
      </Text>

      <View style={styles.linkRow}>
        <Text style={styles.linkText} numberOfLines={1}>
          {promo.cta}
        </Text>
        <Ionicons name="arrow-forward" size={13} color={Colors.onLight} />
      </View>
    </View>
  );
}

// The photograph fills the card and the sale is printed over it. This is the
// one slide where the type has to hold its own against whatever the picture is
// doing, hence the scrim — the same one the offer cards use, so a promo photo
// and a tour photo darken identically.
function PlateSlide({ promo }: { promo: Promo }) {
  return (
    <View style={styles.plate}>
      <Image
        source={promo.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id={`saleScrim-${promo.key}`} from="35%" />

      <View style={styles.plateCopy}>
        <Text style={styles.dealOnPhoto} numberOfLines={1}>
          {promo.deal}
        </Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkOnPhoto} numberOfLines={1}>
            {promo.cta}
          </Text>
          <Ionicons name="arrow-forward" size={13} color={PhotoText.color} />
        </View>
      </View>
    </View>
  );
}

// Divided down the middle: type on the left with nothing behind it, the
// picture holding the right as a full-height panel rather than a square set
// into the row.
function SplitSlide({ promo, accent }: { promo: Promo; accent: string }) {
  return (
    <View style={styles.split}>
      <View style={styles.splitCopy}>
        <View style={[styles.ruleBar, { backgroundColor: accent }]} />
        <Text style={[styles.deal, { color: accent }]} numberOfLines={2}>
          {promo.deal}
        </Text>
        <Text style={styles.linkText} numberOfLines={1}>
          {promo.cta}
        </Text>
      </View>

      <View style={styles.splitArt}>
        <Image
          source={promo.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  rail: {
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
  slide: {
    height: SLIDE_H,
  },

  // — type —
  type: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tagRule: {
    flex: 1,
    height: 1,
    opacity: 0.35,
  },
  dealLarge: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  // — plate —
  plate: {
    flex: 1,
    borderRadius: RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  plateCopy: {
    padding: 16,
    gap: 2,
  },
  dealOnPhoto: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    color: PhotoText.color,
  },
  linkOnPhoto: {
    fontSize: 12.5,
    fontWeight: '700',
    color: PhotoText.color,
  },

  // — split —
  split: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  splitCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 7,
  },
  // A panel, not a tile: it runs the card's full height, which is what stops
  // it reading as the square that used to sit in the middle of the row.
  splitArt: {
    width: '42%',
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: Glass.fill,
  },
  deal: {
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  ruleBar: {
    width: 24,
    height: 2,
    borderRadius: 999,
  },

  // — shared —
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.onLight,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.divider,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
