import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/glass/primary-button';
import { PhotoScrim } from '@/components/offers/photo-scrim';
import { formatPrice } from '@/constants/currency';
import { formatExpiry, type ResolvedOffer } from '@/constants/offers-data';
import { Colors, Glass, PhotoGlass, PhotoText } from '@/constants/theme';

const RADIUS = 26;
const PHOTO_RATIO = 0.52; // photo height / card width

// Wide enough to carry the price row and the inclusion chips, narrow enough
// that the next card shows at both edges — which is the only thing that tells
// anyone the rail moves.
const CARD_FRACTION = 0.82;
const CARD_GAP = 12;

const DOT = 6;
const DOT_ACTIVE = 20;

// Explore's picks, as things you can actually act on.
//
// This replaced a single card showing a temperature, a "+38% searches this
// month" figure and a drawn map — none of which answer a question anyone has
// before booking. These answer all of them: what the trip is, where it goes,
// how long it runs, what is in the price, what it costs, and how long the deal
// lasts. Every field comes from the tour catalogue, so nothing here is a second
// copy of a number kept somewhere else.
export function TopRecommendations({
  offers,
  screenWidth,
  onPressOffer,
}: {
  offers: ResolvedOffer[];
  screenWidth: number;
  onPressOffer: (offer: ResolvedOffer) => void;
}) {
  const cardWidth = Math.round(screenWidth * CARD_FRACTION);
  const stride = cardWidth + CARD_GAP;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={stride}
        decelerationRate="fast"
        disableIntervalMomentum
        // Half the leftover width each side, so the first and last cards settle
        // centred instead of flush against the screen edge.
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - cardWidth) / 2,
          gap: CARD_GAP,
          // Every card matches the tallest in the rail, so the rail's own edge
          // stays straight as it scrolls.
          alignItems: 'stretch',
        }}>
        {offers.map((offer, index) => (
          <OfferCard
            key={offer.key}
            offer={offer}
            index={index}
            stride={stride}
            width={cardWidth}
            scrollX={scrollX}
            onPress={() => onPressOffer(offer)}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {offers.map((offer, index) => (
          <Dot key={offer.key} index={index} stride={stride} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}

// Neighbours sit back a little so the centred card reads as the focused one —
// the same treatment the places carousel above uses, so the two rails behave
// alike rather than each having their own idea of what focus looks like.
function OfferCard({
  offer,
  index,
  stride,
  width,
  scrollX,
  onPress,
}: {
  offer: ResolvedOffer;
  index: number;
  stride: number;
  width: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const focus = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * stride) / stride;
    return {
      transform: [{ scale: interpolate(distance, [0, 1], [1, 0.94], Extrapolation.CLAMP) }],
      opacity: interpolate(distance, [0, 1], [1, 0.8], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View style={[{ width }, focus]}>
      <OfferCardBody offer={offer} width={width} onPress={onPress} />
    </Animated.View>
  );
}

// Width tracks the focused card rather than each dot fading on its own: a row
// of dots where one is simply brighter is easy to miss at this size.
function Dot({
  index,
  stride,
  scrollX,
}: {
  index: number;
  stride: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * stride) / stride;
    return {
      width: interpolate(distance, [0, 1], [DOT_ACTIVE, DOT], Extrapolation.CLAMP),
      opacity: interpolate(distance, [0, 1], [1, 0.35], Extrapolation.CLAMP),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

function OfferCardBody({
  offer,
  width,
  onPress,
}: {
  offer: ResolvedOffer;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${offer.name}. ${offer.duration}. ${formatPrice(offer.now)} per person, down from ${formatPrice(offer.was)}. ${formatExpiry(offer.endsInDays)}.`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.photo, { height: Math.round(width * PHOTO_RATIO) }]}>
        <Image
          source={offer.cardImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <PhotoScrim id={`topRecommendationScrim-${offer.key}`} from="45%" />

        {/* The one genuinely time-sensitive fact on the card, so it gets the
            photo's top corner rather than a line in the body. */}
        <View style={styles.photoTop}>
          <View style={styles.expiryPill}>
            <Ionicons name="time-outline" size={12} color={Colors.onLight} />
            <Text style={styles.expiryText}>{formatExpiry(offer.endsInDays)}</Text>
          </View>
        </View>

        <View style={styles.photoBody}>
          <Text style={styles.tagline} numberOfLines={1}>
            {offer.tagline}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {offer.name}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.duration}>
          <Ionicons name="calendar-outline" size={12} color={Colors.secondary} />
          <Text style={styles.durationText} numberOfLines={1}>
            {offer.duration}
          </Text>
        </View>

        <View style={styles.included}>
          {offer.usuallyIncluded.map((item) => (
            <View key={item} style={styles.includedChip}>
              <Ionicons name="checkmark" size={11} color={Colors.secondary} />
              <Text style={styles.includedText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceCell}>
            <View style={styles.priceLine}>
              <Text style={styles.price}>{formatPrice(offer.now)}</Text>
              <Text style={styles.was}>{formatPrice(offer.was)}</Text>
            </View>
            {/* The saving in money rather than percent, which is the figure
                people compare — and the only place the discount is stated now
                that the percentage badge is gone. */}
            <Text style={styles.saving} numberOfLines={1}>
              Save {formatPrice(offer.saving)} per person
            </Text>
          </View>

          {/* Decorative: the card carries the press handler and the accessible
              name, so this must not be a second stop for the same action. */}
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <PrimaryButton label="View offer" onPress={onPress} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // `flex: 1` so the card fills the height the tallest card in the rail sets,
  // rather than leaving a gap under the shorter ones.
  card: {
    flex: 1,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  dots: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: Colors.primary,
  },
  photo: {
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  // Right-aligned rather than spread: the discount badge that used to hold the
  // left end is gone, and a lone pill on a `space-between` row would drift back
  // to the left.
  photoTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  expiryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PhotoGlass.fill,
  },
  expiryText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.onLight,
  },
  photoBody: {
    padding: 16,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  name: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 27,
    color: PhotoText.color,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    flexShrink: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.onLight,
  },
  included: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  includedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Glass.fill,
  },
  includedText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.onLight,
  },
  // Pinned to the foot of the card, so the price sits on the same line across
  // the rail however many lines the name above it took.
  priceRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceCell: {
    flexShrink: 1,
  },
  // Baseline-aligned so the struck original sits beside the new price rather
  // than under it, as it does on the Offers hero.
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onLight,
  },
  was: {
    flexShrink: 1,
    fontSize: 12.5,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  saving: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
});
