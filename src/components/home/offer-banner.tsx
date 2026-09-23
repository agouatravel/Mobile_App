import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/glass/primary-button';
import { Colors } from '@/constants/theme';

// The one solid, non-glass orange block on the page — matches the "loudest
// element on screen" rule: a single primary CTA per screen, no blur.
export function OfferBanner() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name="star" size={13} color={Colors.primaryForeground} />
        <Text style={styles.badgeText}>AGOUA ELITE</Text>
      </View>
      <Text style={styles.title}>Double Points on Packages</Text>
      <Text style={styles.body}>
        Book any luxury package this week and earn double elite qualifying points towards your
        next tier.
      </Text>
      <PrimaryButton
        label="Explore Offers"
        style={styles.button}
        onPress={() => router.push('/offers')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 22,
    gap: 12,
    backgroundColor: Colors.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: Colors.primaryForeground,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.primaryForeground,
    fontSize: 22,
    fontWeight: '800',
  },
  body: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    // Dark fill so the white label reads, and so it contrasts against the
    // solid-orange banner it sits on.
    backgroundColor: Colors.onLight,
    marginTop: 4,
  },
});
