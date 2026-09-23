import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

export const TOUR_TABS = ['Itinerary', 'Inclusions', 'Terms'] as const;

export type TourTab = (typeof TOUR_TABS)[number];

// Segmented control over the three panels. Only one is mounted at a time —
// the terms alone run to eight clauses, and stacking everything would push
// the booking action most of a screen further down.
export function TourTabs({
  value,
  onChange,
}: {
  value: TourTab;
  onChange: (tab: TourTab) => void;
}) {
  return (
    <View style={styles.bar}>
      {TOUR_TABS.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.tab,
              active && styles.tabActive,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primaryForeground,
  },
  pressed: {
    opacity: 0.7,
  },
});
