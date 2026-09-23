import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

const BUTTON = 48;

// The search field and the filter button, as one row.
//
// Controlled from the screen rather than holding the query itself: the list,
// the result count and the empty state all read the same string, and a field
// that owned it would make this component the source of truth for three things
// that are not its business.
export function VisaSearchBar({
  query,
  onChangeQuery,
  activeFilters,
  onOpenFilters,
}: {
  query: string;
  onChangeQuery: (next: string) => void;
  /** How many filters are set, for the badge. Zero draws no badge. */
  activeFilters: number;
  onOpenFilters: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Ionicons name="search" size={17} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search a country"
          placeholderTextColor={Colors.textMuted}
          // The list filters as you type, so the keyboard's action key has
          // nothing left to submit — "search" would promise a step that has
          // already happened.
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="words"
          accessibilityLabel="Search visas by country"
          style={styles.input}
        />

        {query.length > 0 ? (
          <Pressable
            onPress={() => onChangeQuery('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => pressed && styles.pressed}>
            <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel={
          activeFilters > 0 ? `Filters, ${activeFilters} active` : 'Filter and sort'
        }
        style={({ pressed }) => [
          styles.button,
          activeFilters > 0 && styles.buttonActive,
          pressed && styles.pressed,
        ]}>
        <Ionicons
          name="options-outline"
          size={21}
          color={activeFilters > 0 ? Colors.primaryForeground : Colors.secondary}
        />

        {/* The button gives no other sign that a filter is on once the sheet is
            closed, and a list quietly showing a third of its rows looks like a
            bug rather than a filter. */}
        {activeFilters > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilters}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  field: {
    flex: 1,
    // Both this and the input inside it: on web a TextInput is an <input>
    // with an intrinsic width of its own, and a flex item cannot shrink below
    // its content's minimum, so the field held the row open past the screen
    // edge. The floor has to be cleared on every box between the two.
    minWidth: 0,
    height: BUTTON,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: BUTTON / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14.5,
    color: Colors.onLight,
    // Android gives a TextInput its own vertical padding on top of the row's
    // centring, which pushes the text off the centre line.
    paddingVertical: 0,
  },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  buttonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  pressed: {
    opacity: 0.7,
  },
});
