import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhotoScrim } from '@/components/offers/photo-scrim';
import type { ExplorePlace } from '@/constants/explore-data';
import { Colors, Glass, PhotoGlass } from '@/constants/theme';

const CONTROL = 42;

// Full-bleed photograph carrying the destination's name. This is the first
// screenful, so it is deliberately the largest single element on the page —
// the caption block sits in its lower third over a scrim.
export function PlaceHero({
  place,
  height,
  topInset,
  onBack,
}: {
  place: ExplorePlace;
  height: number;
  topInset: number;
  onBack: () => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <View style={[styles.hero, { height }]}>
      <Image
        source={place.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <PhotoScrim id={`placeHeroScrim-${place.key}`} from="42%" />

      <View style={[styles.controls, { top: topInset + 8 }]}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={21} color={Colors.onLight} />
        </Pressable>

        <Pressable
          onPress={() => setSaved((current) => !current)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
          accessibilityState={{ selected: saved }}
          style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? Colors.accent : Colors.onLight}
          />
        </Pressable>
      </View>

      <View style={styles.caption}>
        <Text style={styles.country} numberOfLines={1}>
          {place.country}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {place.name}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={13} color={Colors.primary} />
            <Text style={styles.ratingValue}>{place.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.reviews} numberOfLines={1}>
            {place.reviews} reviews
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  controls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Sits over the photo, so it carries its own surface rather than relying on
  // the image being light enough behind it.
  control: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: CONTROL / 2,
    backgroundColor: PhotoGlass.fill,
    borderWidth: 1,
    borderColor: PhotoGlass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    paddingHorizontal: 20,
    // Clears the stat strip, which is pulled up over this edge.
    paddingBottom: 46,
  },
  country: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  name: {
    marginTop: 2,
    fontSize: 38,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  statsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PhotoGlass.fill,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.onLight,
  },
  reviews: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pressed: {
    opacity: 0.7,
  },
});
