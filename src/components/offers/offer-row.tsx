import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CARD_RADIUS } from '@/components/offers/metrics';
import { formatPrice } from '@/constants/currency';
import { formatExpiry, type ResolvedOffer } from '@/constants/offers-data';
import { Colors, Glass } from '@/constants/theme';

const MEDIA_W = 126;
const MEDIA_H = 138;

// Full-width offer, photo left and detail right. The Offers screen uses the
// taller OfferTicket; this is the compact form, for places like the
// destination screen where offers are one section among several.
//
// The photo runs flush to the card's leading edge rather than sitting inset,
// so the row reads as a picture with text beside it instead of a framed
// thumbnail. That fixes the card's height to the photo's.
export function OfferRow({ offer, onPress }: { offer: ResolvedOffer; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${offer.name}, ${offer.duration}, ${formatPrice(offer.now)} per person, down from ${formatPrice(offer.was)}, ${formatExpiry(offer.endsInDays).toLowerCase()}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.media}>
        <Image
          source={offer.cardImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {offer.name}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {offer.duration} · {offer.route}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(offer.now)}
            <Text style={styles.priceUnit}>/person</Text>
          </Text>
          <Text style={styles.was} numberOfLines={1}>
            {formatPrice(offer.was)}
          </Text>
        </View>

        <Text style={styles.expiry} numberOfLines={1}>
          {formatExpiry(offer.endsInDays)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MEDIA_H,
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    // Padding only on the text side: the photo is flush to the leading edge.
    paddingRight: 12,
    gap: 12,
    // No overflow:hidden — on iOS it would clip the row's own shadow. The
    // photo rounds its own leading corners instead.
  },
  media: {
    width: MEDIA_W,
    height: MEDIA_H,
    // One less than the card's radius so the photo's curve sits inside the
    // border rather than crossing it.
    borderTopLeftRadius: CARD_RADIUS - 1,
    borderBottomLeftRadius: CARD_RADIUS - 1,
    overflow: 'hidden',
    backgroundColor: Glass.fill,
  },
  body: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.accent,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  was: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  expiry: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  chevron: {
    marginLeft: -4,
  },
  pressed: {
    opacity: 0.75,
  },
});
