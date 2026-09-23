import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/glass/primary-button';
import { DiscountBadge } from '@/components/offers/discount-badge';
import { SIDE_PADDING } from '@/components/offers/metrics';
import { PhotoScrim } from '@/components/offers/photo-scrim';
import { formatPrice } from '@/constants/currency';
import { formatExpiry, type ResolvedOffer } from '@/constants/offers-data';
import { Colors, Glass, PhotoGlass } from '@/constants/theme';

// The single largest offer on the screen. The whole card is pressable as well
// as the button inside it — the button is there to name the action, not to be
// the only target.
//
// The badge and the CTA carry their own solid fill, so they sit straight on
// the photograph. Only the pills that hold dark text — the price and the
// expiry — need a frosted surface under them.
export function OfferHero({
  offer,
  width,
  height,
  onPress,
}: {
  offer: ResolvedOffer;
  width: number;
  height: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${offer.name}, ${offer.discount}% off, ${formatPrice(offer.now)} per person, ${offer.duration}, ${formatExpiry(offer.endsInDays).toLowerCase()}`}
      style={({ pressed }) => [styles.hero, { width, height }, pressed && styles.pressed]}>
      <Image
        source={offer.cardImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id={`heroScrim-${offer.key}`} from="40%" />

      <View style={styles.topRow}>
        <DiscountBadge discount={offer.discount} />

        <View style={styles.expiryPill}>
          <Ionicons name="time-outline" size={13} color={Colors.onLight} />
          <Text style={styles.expiryText}>{formatExpiry(offer.endsInDays)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.locationRow}>
          <Ionicons name="calendar-outline" size={13} color="rgba(255, 255, 255, 0.9)" />
          <Text style={styles.location} numberOfLines={1}>
            {offer.duration}
          </Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {offer.name}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.pricePill}>
            <Text style={styles.price} numberOfLines={1}>
              {formatPrice(offer.now)}
              <Text style={styles.priceUnit}>/person</Text>
            </Text>
            <Text style={styles.was} numberOfLines={1}>
              {formatPrice(offer.was)}
            </Text>
          </View>

          {/* Decorative: the card itself already carries the press handler and
              the accessibility label, so this must not be a second stop for a
              screen reader on the same action. */}
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
  hero: {
    marginHorizontal: SIDE_PADDING,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  topRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: PhotoGlass.fill,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onLight,
  },
  body: {
    padding: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  name: {
    marginTop: 2,
    fontSize: 27,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  priceRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Frosted so the price reads as dark text on a light surface rather than
  // white text fighting whatever the photograph is doing behind it. The two
  // figures share a line on the baseline, so the struck-through original sits
  // beside the new price rather than under it.
  pricePill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: PhotoGlass.fill,
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  was: {
    flexShrink: 1,
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.85,
  },
});
