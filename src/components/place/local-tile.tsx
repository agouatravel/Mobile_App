import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { PhotoScrim } from '@/components/offers/photo-scrim';
import type { PlaceLocal } from '@/constants/explore-data';
import { Colors, Glass } from '@/constants/theme';

// Photo-led, with the caption burned into the bottom of the image. The
// previous version put the text on a tinted panel above the photo, which left
// every card a third empty before the picture even started.
export function LocalTile({
  local,
  width,
  height,
  wide,
}: {
  local: PlaceLocal;
  width: number;
  height: number;
  // The lead tile in the mosaic gets more room, so its title can go up a size.
  wide?: boolean;
}) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${local.name}. ${local.nativeName}, ${local.gloss}.`}
      style={[styles.tile, { width, height }]}>
      <Image
        source={local.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id={`localScrim-${local.key}`} from={wide ? '38%' : '28%'} />

      <View style={styles.body}>
        <Text style={[styles.name, wide && styles.nameWide]} numberOfLines={1}>
          {local.name}
        </Text>
        <Text style={styles.native} numberOfLines={wide ? 1 : 2}>
          {local.nativeName} <Text style={styles.gloss}>({local.gloss})</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  body: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  nameWide: {
    fontSize: 20,
  },
  native: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  gloss: {
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
