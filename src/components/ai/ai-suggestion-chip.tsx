import { Pressable, StyleSheet, Text } from 'react-native';

import { Ai, Colors } from '@/constants/theme';

// One suggestion, in a rail of five.
//
// Selected is solid white with the app's ink on it; the rest are translucent
// white with white type, so they take a tint from whatever part of the ground
// they are sitting over. That inversion — one filled, the others glass — is
// what makes the rail read as a set with one thing chosen, rather than as five
// buttons of equal weight.
//
// It was the other way round: every chip a solid white pill, and the selected
// one filled blue. On a blue ground that meant five bright slabs across the
// screen and a selected state that sank into the background behind it.
export function AiSuggestionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipIdle,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: Ai.surface,
    borderColor: Ai.border,
  },
  chipActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Ai.text,
  },
  labelActive: {
    color: Ai.onSurface,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
