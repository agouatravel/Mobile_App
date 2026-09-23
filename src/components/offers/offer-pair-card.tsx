import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DiscountBadge } from '@/components/offers/discount-badge';
import { CARD_RADIUS } from '@/components/offers/metrics';
import { PhotoScrim } from '@/components/offers/photo-scrim';
import { formatPrice } from '@/constants/currency';
import { type ResolvedOffer } from '@/constants/offers-data';
import { Colors, Glass } from '@/constants/theme';

export const PAIR_HEIGHT = 150;

// The two half-width cards under the hero. Photograph-led with the caption
// burned into the bottom of the image, so they read as a continuation of the
// hero rather than as the first row of the grid below.
export function OfferPairCard({
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
      accessibilityLabel={`${offer.name}, ${offer.discount}% off, ${formatPrice(offer.now)} per person`}
      style={({ pressed }) => [
        styles.card,
        { width, height: PAIR_HEIGHT },
        pressed && styles.pressed,
      ]}>
      <Image
        source={offer.cardImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id={`pairScrim-${offer.key}`} from="35%" />

      <View style={styles.badge}>
        <DiscountBadge discount={offer.discount} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {offer.name}
        </Text>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(offer.now)}
          <Text style={styles.priceUnit}>/person</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },
  price: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pressed: {
    opacity: 0.75,
  },
});
