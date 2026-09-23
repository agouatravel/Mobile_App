import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Colors } from '@/constants/theme';

// The illustration is what tells you which of the two pages you are on, so it
// gets to be the first thing on the screen rather than a decoration under a
// heading. It replaced the Log in / Sign up segmented switch: with a picture
// this specific at the top, a tab strip saying the same thing in words is
// redundant, and the switch was the thing making both halves read as one
// generic form.
//
// Sized as a fraction of the window rather than a fixed height. These renders
// are tall portraits with a lot of vertical air, and a fixed box that looks
// right on a Pixel 8 eats half the screen on an iPhone SE — where the fields
// underneath are the part that has to survive the keyboard.
//
// The `large` size is the same rule with more headroom, for a page whose
// artwork is carrying more of the screen.
const HERO = {
  default: { fraction: 0.3, min: 168, max: 260 },
  large: { fraction: 0.4, min: 220, max: 360 },
} as const;

export function AuthHero({
  source,
  title,
  subtitle,
  size = 'default',
}: {
  source: ImageSource;
  title: string;
  subtitle: string;
  size?: keyof typeof HERO;
}) {
  const { height } = useWindowDimensions();
  const { fraction, min, max } = HERO[size];
  const artHeight = Math.min(Math.max(height * fraction, min), max);

  return (
    <View style={styles.hero}>
      <Image
        source={source}
        // `contain`, so the height above is a budget rather than a crop — the
        // artwork keeps its own proportions inside one at any screen width.
        contentFit="contain"
        // Decoration: the title under it already says what this page is, and
        // there is nothing in the picture a caption would add.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.art, { height: artHeight }]}
      />

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 22,
  },
  // Full width with `contain` doing the centring, rather than a measured box:
  // the artwork carries a transparent margin of its own, so a tight frame
  // around it would not look any tighter.
  art: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 33,
    color: Colors.onLight,
  },
  // Held short of the full width: centred prose running edge to edge gives the
  // eye no consistent left margin to return to on the second line.
  subtitle: {
    alignSelf: 'center',
    maxWidth: 320,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
});
