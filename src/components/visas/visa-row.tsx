import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/constants/currency';
import { type VisaCountry } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

// Small, but the same 3:2 crop the rail's cards use, so a flag is the same
// shape wherever it appears in the app.
const FLAG_W = 46;
const FLAG_H = FLAG_W / 1.5;

// One country in the full list.
//
// A row rather than a card: thirty of these scroll past, and thirty cards would
// be thirty surfaces to separate from each other and from the page. The divider
// is drawn by the list, not here — a row that draws its own leaves a stray line
// under the last one.
export function VisaRow({ visa, onPress }: { visa: VisaCountry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${visa.name}, ${visa.region}. From ${formatPrice(visa.from)}.`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {/* Decorative: the country is named in the text beside it. */}
      <View style={styles.flag}>
        <Image
          source={visa.flag}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {visa.name}
        </Text>
        <Text style={styles.region} numberOfLines={1}>
          {visa.region}
        </Text>
      </View>

      {/* Right-aligned so the prices form a column the eye can run down, which
          is the whole reason to sort by price. */}
      <View style={styles.priceCell}>
        <Text style={styles.fromLabel}>From</Text>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(visa.from)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={17} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  flag: {
    width: FLAG_W,
    height: FLAG_H,
    borderRadius: 5,
    // Japan, the UAE and the US all reach their edge in white, and so does the
    // page — without a hairline those three lose their shape entirely.
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Glass.fill,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onLight,
  },
  region: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceCell: {
    alignItems: 'flex-end',
  },
  fromLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  price: {
    marginTop: 1,
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
