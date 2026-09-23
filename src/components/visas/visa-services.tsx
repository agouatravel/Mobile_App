import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GAP, PANEL_RADIUS } from '@/components/visas/metrics';
import { VISA_SERVICES } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

const CHIP = 40;
const COLUMNS = 2;

// What the service covers.
//
// Two columns rather than the five-across strip this replaces. Five cells on a
// phone came to about 58pt each — enough for a 9.5pt label with two of the
// names abbreviated to fit, which is a row of icons with captions too small to
// read rather than a list of what you get. Half the width each is enough for
// the real names at a real size, and the section is what most of this screen is
// selling.
//
// Five items over two columns leaves one odd. It runs full width rather than
// sitting in a half-empty row: a cell with a gap beside it reads as something
// that failed to load, and a wider last row reads as the end of a list.
export function VisaServices({ width }: { width: number }) {
  const half = Math.floor((width - GAP) / COLUMNS);
  const lastIndex = VISA_SERVICES.length - 1;
  const orphan = VISA_SERVICES.length % COLUMNS === 1;

  return (
    <View style={styles.grid}>
      {VISA_SERVICES.map((service, index) => {
        const full = orphan && index === lastIndex;
        return (
          <View
            key={service.key}
            style={[styles.cell, { width: full ? width : half }, full && styles.cellWide]}>
            <View style={styles.chip}>
              <Ionicons name={service.icon} size={20} color={Colors.secondary} />
            </View>

            {/* The labels carry their own line break, which the wide last cell
                does not want — it has the room to run on one line, and a forced
                break there would leave it looking like a two-line cell that had
                been stretched. */}
            <Text style={styles.label} numberOfLines={2}>
              {full ? service.label.replace('\n', ' ') : service.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: PANEL_RADIUS - 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  // The odd one out. Same height as the rest, so the block still reads as a
  // grid rather than as a grid with a banner stuck on the end.
  cellWide: {
    justifyContent: 'flex-start',
  },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2.6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.secondary}14`,
  },
  label: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '600',
    color: Colors.onLight,
  },
});
