import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { DiscountBadge } from '@/components/offers/discount-badge';
import { PhotoScrim } from '@/components/offers/photo-scrim';
import { formatPrice } from '@/constants/currency';
import { formatExpiry, type ResolvedOffer } from '@/constants/offers-data';
import { Backdrop, Colors, Glass, PhotoGlass } from '@/constants/theme';

const RADIUS = 24;
const ASPECT = 1.28; // card width / card height
const NOTCH = 22;

// A voucher laid over the photograph rather than under it: the image fills the
// whole card, the stay name sits on it in white, and the deal itself is
// carried on a frosted band below the tear line so the price keeps a legible
// surface whatever the photo happens to be doing.
//
// The notches are circles in the page colour laid half outside the card and
// clipped by its overflow, so they read as bites taken out of the edge. That
// only works because the backdrop mesh band ends well above this section —
// everything down here is flat Backdrop.base, so a flat fill matches exactly.
export function OfferTicket({
  offer,
  width,
  onPress,
}: {
  offer: ResolvedOffer;
  width: number;
  onPress: () => void;
}) {
  const height = Math.round(width / ASPECT);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${offer.name}, ${offer.discount}% off, save ${formatPrice(offer.saving)} per person, now ${formatPrice(offer.now)} per person, ${offer.duration}, ${formatExpiry(offer.endsInDays).toLowerCase()}`}
      style={({ pressed }) => [styles.shadow, { width }, pressed && styles.pressed]}>
      <View style={[styles.card, { height }]}>
        <Image
          source={offer.cardImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <PhotoScrim id={`ticketScrim-${offer.key}`} from="38%" />

        <View style={styles.content}>
          <View style={styles.tagRow}>
            <View style={styles.expiryPill}>
              <Ionicons name="time-outline" size={12} color={Colors.onLight} />
              <Text style={styles.expiryText}>{formatExpiry(offer.endsInDays)}</Text>
            </View>
            <DiscountBadge discount={offer.discount} large />
          </View>

          {/* Takes up the slack so the caption stays pinned above the tear
              line and the photo keeps the middle of the card to itself. */}
          <View style={styles.spacer} />

          <View style={styles.head}>
            <Text style={styles.name} numberOfLines={1}>
              {offer.name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255, 255, 255, 0.85)" />
              <Text style={styles.location} numberOfLines={1}>
                {offer.route}
              </Text>
            </View>
          </View>

          <View style={styles.tearRow}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.dashWrap}>
              {/* Drawn in SVG rather than with borderStyle:'dashed' — on
                  Android a dashed border with only one side set renders
                  solid. White, because it crosses the photograph. */}
              <Svg width="100%" height="1">
                <Line
                  x1="0"
                  y1="0.5"
                  x2="100%"
                  y2="0.5"
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="1"
                  strokeDasharray="6 5"
                />
              </Svg>
            </View>
            <View style={[styles.notch, styles.notchRight]} />
          </View>

          <View style={styles.footer}>
            {/* Each element carries its own frosted backing rather than one
                band across the card, so the photograph stays visible between
                them. */}
            <View style={styles.footerText}>
              <View style={styles.savePill}>
                <Text style={styles.save} numberOfLines={1}>
                  Save {formatPrice(offer.saving)} per person
                </Text>
              </View>

              <View style={styles.pricePill}>
                <Text style={styles.now} numberOfLines={1}>
                  {formatPrice(offer.now)}
                  <Text style={styles.unit}>/person</Text>
                </Text>
                <Text style={styles.was} numberOfLines={1}>
                  was {formatPrice(offer.was)}
                </Text>
              </View>
            </View>

            <View style={styles.chevronPill}>
              <Ionicons name="chevron-forward" size={20} color={Colors.onLight} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: RADIUS,
  },
  // overflow:hidden clips the notches; the shadow lives on the wrapper above
  // because on iOS this would clip that too.
  card: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: Glass.fill,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
  },
  spacer: {
    flex: 1,
  },
  head: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  locationRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flexShrink: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
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
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onLight,
  },
  tearRow: {
    height: NOTCH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Half of each circle hangs outside the card and is clipped away, leaving a
  // semicircular bite on the edge.
  notch: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: Backdrop.base,
  },
  notchLeft: {
    marginLeft: -NOTCH / 2,
  },
  notchRight: {
    marginRight: -NOTCH / 2,
  },
  dashWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  footerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  savePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: PhotoGlass.fill,
  },
  save: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: Colors.primary,
  },
  pricePill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: PhotoGlass.fill,
  },
  chevronPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PhotoGlass.fill,
  },
  now: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onLight,
  },
  unit: {
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
