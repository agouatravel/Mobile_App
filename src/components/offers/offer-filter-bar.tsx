import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { SIDE_PADDING } from '@/components/offers/metrics';
import { OFFER_SORTS, type OfferFilter, type OfferSort } from '@/constants/offers-data';
import { Colors, Glass } from '@/constants/theme';

// Chip rail over the offer grid. Styled to match the rail on the Destinations
// screen — the two are the same control doing the same job, and a second look
// for it would read as a different feature.
export function OfferFilterRail({
  filters,
  value,
  onChange,
}: {
  filters: readonly OfferFilter[];
  value: OfferFilter;
  onChange: (filter: OfferFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Without flexGrow:0 the rail stretches to fill the column it sits in
      // and opens a gap under the chips.
      style={styles.railOuter}
      contentContainerStyle={styles.rail}>
      {filters.map((filter) => {
        const active = filter === value;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : styles.chipIdle,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{filter}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Cycles through OFFER_SORTS on tap rather than opening a menu: there are
// three options and the current one is always on the pill, so a sheet would
// be more chrome than the choice is worth.
export function OfferSortPill({
  value,
  onChange,
}: {
  value: OfferSort;
  onChange: (sort: OfferSort) => void;
}) {
  const next = OFFER_SORTS[(OFFER_SORTS.indexOf(value) + 1) % OFFER_SORTS.length];

  return (
    <Pressable
      onPress={() => onChange(next)}
      accessibilityRole="button"
      accessibilityLabel={`Sorted by ${value.toLowerCase()}. Tap to sort by ${next.toLowerCase()}.`}
      style={({ pressed }) => [styles.sortPill, pressed && styles.pressed]}>
      <Ionicons name="swap-vertical" size={14} color={Colors.secondary} />
      <Text style={styles.sortLabel}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  railOuter: {
    flexGrow: 0,
  },
  rail: {
    paddingHorizontal: SIDE_PADDING,
    gap: 8,
    paddingBottom: 14,
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
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  pressed: {
    opacity: 0.6,
  },
});
