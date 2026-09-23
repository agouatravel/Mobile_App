import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Duration, route and kind in one row — the three facts someone checks before
// reading a word of the itinerary.
export function FactStrip({
  duration,
  route,
  kind,
}: {
  duration: string;
  route: string;
  kind: string;
}) {
  return (
    <View style={styles.strip}>
      <Fact icon="calendar-outline" value={duration} />
      <View style={styles.rule} />
      <Fact icon="navigate-outline" value={route} />
      <View style={styles.rule} />
      <Fact icon="map-outline" value={kind} />
    </View>
  );
}

function Fact({ icon, value }: { icon: IconName; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={15} color={Colors.secondary} />
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  rule: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.divider,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
    color: Colors.onLight,
  },
});
