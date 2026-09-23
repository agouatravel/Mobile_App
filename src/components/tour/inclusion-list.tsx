import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

// One of the two halves of the Inclusions panel. `tone` decides both the mark
// and its colour, so a caller cannot accidentally pair a tick with "Exclude".
export function InclusionList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'include' | 'exclude';
}) {
  const include = tone === 'include';

  return (
    <View style={styles.block}>
      <View style={styles.headRow}>
        <View style={[styles.mark, include ? styles.markInclude : styles.markExclude]}>
          <Ionicons
            name={include ? 'checkmark' : 'close'}
            size={13}
            color={Colors.primaryForeground}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.items}>
        {items.map((item) => (
          <View key={item} style={styles.row}>
            <Ionicons
              name={include ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={include ? Colors.secondary : Colors.textMuted}
              style={styles.icon}
            />
            <Text style={[styles.text, !include && styles.textMuted]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 20,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInclude: {
    backgroundColor: Colors.secondary,
  },
  markExclude: {
    backgroundColor: Colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onLight,
  },
  items: {
    marginTop: 10,
    gap: 9,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  // Nudged onto the first line's optical centre; alignItems:'center' would
  // float it against a wrapped two-line item.
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  textMuted: {
    color: Colors.textMuted,
  },
});
