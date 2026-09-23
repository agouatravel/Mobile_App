import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CARD_RADIUS } from '@/components/visas/metrics';
import { formatPrice } from '@/constants/currency';
import { type VisaCountry } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

// One shape for every flag, so the rail reads as a set. The flags themselves
// are not one shape — Japan and the EU are 2:3, the UK and the UAE are 1:2,
// the US is nearer 1.9:1 — so something has to give. `cover` crops the wide
// ones slightly rather than letterboxing the tall ones, because a flag with
// bands of empty card either side stops looking like a flag.
const FLAG_ASPECT = 1.5;

// The flag sits inset with its own radius inside the card's, so the white
// surface frames it on all four sides. That inset is what makes the two radii
// read as concentric rather than as one rounded rectangle with a picture
// jammed into the top of it.
const INSET = 10;
const FLAG_RADIUS = CARD_RADIUS - INSET;

const ACTION = 46;

// One country in the Popular Tourist Visas rail: which country, what it costs,
// and a way in. Nothing else — the duration and the processing estimate that
// used to sit here belong on the detail screen, where there is room to qualify
// them.
export function VisaCard({
  visa,
  width,
  onPress,
}: {
  visa: VisaCountry;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      // "From ﷼299" read as two fragments after the name; one sentence for the
      // whole card is what a screen reader can actually act on.
      accessibilityLabel={`${visa.name}. From ${formatPrice(visa.from)}.`}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      {/* Decorative: the name directly below says which country this is, and
          the Pressable carries the accessible name for the whole card. */}
      <View style={styles.flag}>
        <Image
          source={visa.flag}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessible={false}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {visa.name}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceCell}>
            {/* The qualifier stays. Without it the figure reads as the price
                rather than as the cheapest of several, which is a claim the
                desk cannot stand behind. */}
            <Text style={styles.fromLabel}>From</Text>
            {/* Shrinks rather than wraps or truncates. Every current price is
                three digits, but a four-digit one would otherwise push the
                arrow off the card. */}
            <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {formatPrice(visa.from)}
            </Text>
          </View>

          {/* Repeats the card's own press rather than doing anything else. The
              whole card is the target; this is the affordance that says so. */}
          <Pressable
            onPress={onPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Open ${visa.name}`}
            style={({ pressed }) => [styles.action, pressed && styles.pressedTight]}>
            <Ionicons name="arrow-forward" size={19} color={Colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    padding: INSET,
  },
  flag: {
    width: '100%',
    aspectRatio: FLAG_ASPECT,
    borderRadius: FLAG_RADIUS,
    // Several of these are white at the edge — Japan's field, the UAE's centre
    // band, the US stripes — and the card behind them is white too. Without a
    // hairline the flag bleeds into the card and loses its shape.
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Glass.fill,
    // The flag has its own corners, so it does its own clipping — the card's
    // radius is further out and no longer cuts it.
    overflow: 'hidden',
  },
  body: {
    // The inset already holds the text clear of the card's edge; this is the
    // extra that stops it lining up flush with the flag above it.
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onLight,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  priceCell: {
    flex: 1,
  },
  fromLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  // The largest type on the card, and larger than the country name above it.
  // With the duration and the processing estimate gone, the price is most of
  // what the card has left to say, and it is what the rail is scanned for.
  price: {
    marginTop: 1,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: Colors.accent,
  },
  // The reference draws this near-black. Black is not one of the app's
  // colours, and solid orange is spoken for by the promo banner at the foot of
  // the screen — six orange discs in a rail would outshout it. The deep blue is
  // the brand's own dark, and it is already what the secondary actions on this
  // screen are drawn in.
  action: {
    width: ACTION,
    height: ACTION,
    borderRadius: ACTION / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  // The card already scales under a press. A nested control repeating that
  // would fight it, so this fades instead.
  pressedTight: {
    opacity: 0.7,
  },
});
