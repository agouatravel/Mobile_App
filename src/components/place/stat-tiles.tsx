import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { PlaceStat } from '@/constants/explore-data';
import { Colors, Glass } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// The strip is pulled up by this much so it straddles the hero's lower edge
// and ties the photograph to the content below it, rather than starting a
// second, unrelated page under the image.
export const STAT_OVERLAP = 34;

// Three tiles: what the weather is doing, how fast the place is climbing, and
// how many deals are running. The offers count is computed by the screen, so
// it comes in as a plain value rather than as a PlaceStat.
export function StatTiles({
  weather,
  trending,
  offerCount,
}: {
  weather: PlaceStat;
  trending: PlaceStat;
  offerCount: number;
}) {
  return (
    <View style={styles.row}>
      <Tile icon="sunny-outline" value={weather.value} label={weather.label} />
      <Tile icon="trending-up-outline" value={trending.value} label={trending.label} />
      <Tile
        icon="pricetag-outline"
        value={`${offerCount}`}
        label={offerCount === 1 ? 'Offer running' : 'Offers running'}
      />
    </View>
  );
}

function Tile({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${value}, ${label}`}
      style={styles.tile}>
      <Ionicons name={icon} size={17} color={Colors.secondary} />
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: -STAT_OVERLAP,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  value: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onLight,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
