import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPrice } from '@/constants/currency';
import {
  DESTINATION_FILTERS,
  DESTINATION_RESULTS,
  type DestinationFilter,
  type DestinationResult,
} from '@/constants/home-data';
import { Colors, Glass } from '@/constants/theme';

const FIELD_H = 46;
const SIDE_PADDING = 20;
const CARD_RADIUS = 22;
const MEDIA_ASPECT = 1.6; // card width / carousel height

export default function DestinationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Seeded from the route rather than held empty and filled by an effect:
  // arriving from Home's Search button, the list should already be narrowed on
  // the first frame instead of painting everything and then cutting it down.
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const [filter, setFilter] = useState<DestinationFilter>(DESTINATION_FILTERS[0]);
  const { width } = useWindowDimensions();
  const cardWidth = width - SIDE_PADDING * 2;

  // Filter chip narrows the list; the free-text query narrows it further, so
  // clearing the box returns to the chip's full set rather than to everything.
  const search = query.trim().toLowerCase();
  const results = DESTINATION_RESULTS.filter(
    (item) =>
      item.filter === filter &&
      (search.length === 0 ||
        item.name.toLowerCase().includes(search) ||
        item.operator.toLowerCase().includes(search))
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.searchRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => pressed && styles.pressed}>
          <Ionicons name="arrow-back" size={23} color={Colors.onLight} />
        </Pressable>

        <View style={styles.searchField}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder="Search destinations"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
        </View>

        <Pressable
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}>
          <Ionicons name="options-outline" size={20} color={Colors.onLight} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRailOuter}
        contentContainerStyle={styles.chipRail}>
        {DESTINATION_FILTERS.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Text style={styles.heading}>Searched by {filter.toLowerCase()}</Text>

        {results.length === 0 ? (
          <Text style={styles.empty}>No stays match that search.</Text>
        ) : (
          results.map((item) => (
            <ResultCard
              key={item.key}
              item={item}
              cardWidth={cardWidth}
              onView={() => router.push({ pathname: '/package', params: { key: item.key } })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ResultCard({
  item,
  cardWidth,
  onView,
}: {
  item: DestinationResult;
  cardWidth: number;
  onView: () => void;
}) {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <ImageCarousel images={item.images} width={cardWidth} />

      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {item.operator}
          </Text>
        </View>

        <Text style={styles.highlightsLabel}>Highlights</Text>
        {/* Joined into one Text rather than a row of views so the list wraps as
            prose instead of overflowing or forcing a fixed column count. */}
        <Text style={styles.highlights}>
          {item.highlights.map((highlight) => `• ${highlight}`).join('   ')}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPrice(item.perNight)}
            <Text style={styles.priceUnit}>/night</Text>
            <Text style={styles.priceOr}> or </Text>
            {formatPrice(item.perWeek)}
            <Text style={styles.priceUnit}>/week</Text>
          </Text>
          <Pressable
            onPress={onView}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}`}
            style={({ pressed }) => [styles.viewButton, pressed && styles.pressed]}>
            <Text style={styles.viewLabel}>View</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ImageCarousel({ images, width }: { images: string[]; width: number }) {
  const [index, setIndex] = useState(0);
  const height = width / MEDIA_ASPECT;

  // Rounded off the offset rather than tracked continuously: the dots only
  // need to know which slide settled, and a scroll listener per card would run
  // on every frame of every visible row.
  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));

  return (
    <View style={[styles.media, { width, height }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}>
        {images.map((image) => (
          <Image
            key={image}
            source={image}
            style={{ width, height }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>

      {images.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {images.map((image, dotIndex) => (
            <View key={image} style={[styles.dot, dotIndex === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  searchField: {
    flex: 1,
    // Both this and the input inside it: on web the TextInput is an <input>
    // with an intrinsic width of its own, and a flex item cannot shrink under
    // its content's minimum, so the field held the row open past the screen
    // edge. The floor has to be cleared on every box between the two.
    minWidth: 0,
    height: FIELD_H,
    borderRadius: FIELD_H / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onLight,
    // Android's TextInput ships vertical padding that pushes the text off the
    // field's centre line.
    paddingVertical: 0,
  },
  filterButton: {
    width: FIELD_H,
    height: FIELD_H,
    borderRadius: FIELD_H / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Without flexGrow:0 the rail stretches to fill the column and opens a gap
  // under the chips; without flex:1 on the list below it, the list sizes to its
  // content and never scrolls.
  chipRailOuter: {
    flexGrow: 0,
  },
  list: {
    flex: 1,
  },
  chipRail: {
    paddingHorizontal: 20,
    gap: 8,
    // Tight: the heading below names the selected chip, so the two belong to
    // each other and a wide gap reads as a section break between them.
    paddingBottom: 4,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderColor: Glass.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onLight,
  },
  chipLabelActive: {
    color: Colors.primaryForeground,
    fontWeight: '700',
  },
  heading: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    marginBottom: 22,
    marginHorizontal: SIDE_PADDING,
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    // No overflow:hidden here — on iOS it would clip the card's own shadow.
    // The carousel rounds its top corners itself instead.
  },
  media: {
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: Glass.fill,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.primaryForeground,
  },
  cardBody: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  location: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
  },
  highlightsLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  highlights: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  // Inline now that the card is full width — the price still has room to sit
  // beside the button without wrapping.
  priceRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewButton: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  viewLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },
  price: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accent,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceOr: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
});
