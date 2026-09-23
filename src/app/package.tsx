import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/glass/primary-button';
import { formatPrice } from '@/constants/currency';
import { DESTINATION_RESULTS } from '@/constants/home-data';
import { Colors, Glass } from '@/constants/theme';

const HERO_ASPECT = 1.15;
const BACK = 40;

export default function PackageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key?: string }>();

  const item = DESTINATION_RESULTS.find((entry) => entry.key === key);

  if (!item) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>That package is no longer available.</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={styles.hero}>
        <Image
          source={item.images[0]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.back,
            { top: insets.top + 8 },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="arrow-back" size={21} color={Colors.onLight} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={Colors.primary} />
            <Text style={styles.ratingValue}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.meta}>
            {item.operator} • {item.guests} guests • ({item.reviews} reviews)
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Highlights</Text>
        <View style={styles.highlights}>
          {item.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceCell}>
            <Text style={styles.priceLabel}>Per night</Text>
            <Text style={styles.priceValue}>{formatPrice(item.perNight)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCell}>
            <Text style={styles.priceLabel}>Per week</Text>
            <Text style={styles.priceValue}>{formatPrice(item.perWeek)}</Text>
          </View>
        </View>

        <PrimaryButton label="Book this package" onPress={() => {}} style={styles.book} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: HERO_ASPECT,
    backgroundColor: Glass.fill,
  },
  // Sits over the photo, so it carries its own surface rather than relying on
  // the image being light enough behind it.
  back: {
    position: 'absolute',
    left: 20,
    width: BACK,
    height: BACK,
    borderRadius: BACK / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onLight,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  meta: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
  highlights: {
    marginTop: 10,
    gap: 9,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceCard: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 16,
  },
  priceCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  priceDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.divider,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.accent,
  },
  book: {
    marginTop: 22,
    alignSelf: 'stretch',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  missingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
