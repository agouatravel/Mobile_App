import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const HERO_IMAGE = 'https://picsum.photos/seed/agoua-hero/900/600';

// Full-width hero banner introducing the app's headline.
export function HeroSection() {
  return (
    <View style={styles.container}>
      <Image source={HERO_IMAGE} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.scrim} />
      <View style={styles.textWrap}>
        <Text style={styles.eyebrow}>WHERE TO</Text>
        <Text style={styles.title}>Next?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 10, 0.28)',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  eyebrow: {
    color: Colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    opacity: 0.85,
  },
  title: {
    color: Colors.primaryForeground,
    fontSize: 32,
    fontWeight: '800',
  },
});
