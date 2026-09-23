import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { PhotoScrim } from '@/components/offers/photo-scrim';
import type { HiddenGem } from '@/constants/explore-data';
import { Colors, Glass, PhotoGlass } from '@/constants/theme';

const ASPECT = 1.62; // width / height

// One wide feature block, deliberately unlike anything else on the page: the
// sections above it are tiles and the ones below are a mosaic and a list, so
// a single full-bleed card here keeps the page from settling into a rhythm.
export function GemCard({ gem, width }: { gem: HiddenGem; width: number }) {
  const height = Math.round(width / ASPECT);

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Hidden gem: ${gem.title}. ${gem.blurb}`}
      style={[styles.card, { width, height }]}>
      <Image
        source={gem.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id="gemScrim" from="30%" />

      <View style={styles.chip}>
        <Ionicons name="sparkles" size={12} color={Colors.primary} />
        <Text style={styles.chipLabel}>Hidden gem</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {gem.title}
        </Text>
        <Text style={styles.blurb} numberOfLines={2}>
          {gem.blurb}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  chip: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PhotoGlass.fill,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: Colors.onLight,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  blurb: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.88)',
  },
});
