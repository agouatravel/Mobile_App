import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Pressable, Text, View } from 'react-native';

import { DESTINATIONS } from '@/constants/home-data';
import { Colors, PhotoText } from '@/constants/theme';

const SIDE_PADDING = 20;
const RADIUS = 24;

// Portrait, but only just. A true 4:5 is the shape of a poster and pushes
// everything under it off the first screen; this is tall enough to read as
// cinematic and short enough that the services below it are still visible
// without scrolling on a mid-size phone.
const ASPECT = 0.92;

// The scrim. A single flat veil over the whole frame greys the picture out to
// make room for four words at the foot of it; this leaves the top of the image
// alone and only darkens where the type actually sits.
const SCRIM_TOP = 'rgba(16, 24, 32, 0)';
const SCRIM_MID = 'rgba(16, 24, 32, 0.18)';
const SCRIM_FOOT = 'rgba(16, 24, 32, 0.72)';

// The one cinematic block on Home: a single destination, large, with almost
// nothing on it.
//
// This is where the screen spends its visual weight. Everything around it — the
// greeting, the search field, the service glyphs — is deliberately quiet, so
// the photograph is the only thing on the page asking to be looked at rather
// than read. One card and not a carousel: a rail of these would make each one
// a thumbnail, and a thumbnail is not cinematic.
export function FeaturedDestination() {
  const router = useRouter();

  // The head of the list is the feature. There is no editorial slot in the
  // data yet, so this follows whatever `DESTINATIONS` leads with rather than
  // inventing a second source of truth for "the one we are pushing".
  const featured = DESTINATIONS[0];
  if (!featured) return null;

  return (
    <Pressable
      onPress={() => router.push('/destinations')}
      accessibilityRole="button"
      accessibilityLabel={`${featured.name}, ${featured.location}. Explore destinations`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image
        source={featured.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={280}
      />

      {/* Three stacked veils rather than one gradient: this needs no SVG root
          and no gradient library, and at three stops the banding a linear ramp
          would show over a photograph is not visible anyway. */}
      <View pointerEvents="none" style={[styles.veil, styles.veilTop]} />
      <View pointerEvents="none" style={[styles.veil, styles.veilMid]} />
      <View pointerEvents="none" style={[styles.veil, styles.veilFoot]} />

      <View style={styles.caption}>
        <Text style={styles.eyebrow}>{featured.location.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {featured.name}
        </Text>

        {/* A line of type with an arrow, not a filled button. A solid CTA on a
            photograph this size competes with it; the whole card is the touch
            target, so this only has to say where it goes. */}
        <View style={styles.cta}>
          <Text style={styles.ctaLabel}>Explore</Text>
          <Ionicons name="arrow-forward" size={15} color={PhotoText.color} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SIDE_PADDING,
    aspectRatio: ASPECT,
    borderRadius: RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Colors.surfaceSunken,
  },
  veil: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  veilTop: { top: 0, height: '46%', backgroundColor: SCRIM_TOP },
  veilMid: { top: '46%', height: '24%', backgroundColor: SCRIM_MID },
  veilFoot: { top: '70%', bottom: 0, backgroundColor: SCRIM_FOOT },
  caption: {
    padding: 22,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: PhotoText.color,
    opacity: 0.82,
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  name: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 39,
    color: PhotoText.color,
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: PhotoText.color,
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
