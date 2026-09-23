import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ItineraryDay } from '@/constants/tours-data';
import { Colors, Glass } from '@/constants/theme';

const NODE = 30;
const RAIL = 2;
const GUTTER = 14;

// Day-by-day plan as a single connected run: a rail down the left with a
// numbered node per day. Every day is open — a tour itinerary is the thing
// someone is deciding on, so hiding it behind taps costs more than the scroll
// it saves.
export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <View style={styles.list}>
      {days.map((entry, index) => (
        <DayRow key={entry.day} entry={entry} last={index === days.length - 1} />
      ))}
    </View>
  );
}

function DayRow({ entry, last }: { entry: ItineraryDay; last: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.node}>
          <Text style={styles.nodeText}>{entry.day}</Text>
        </View>
        {/* The connector stops at the last node so the rail does not trail
            off into the section below. */}
        {last ? null : <View style={styles.connector} />}
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow}>DAY {entry.day}</Text>
        <Text style={styles.title}>{entry.title}</Text>

        {entry.stops.length > 0 ? (
          <View style={styles.stops}>
            {entry.stops.map((stop) => (
              <View key={stop} style={styles.stop}>
                <Ionicons name="location" size={11} color={Colors.secondary} />
                <Text style={styles.stopLabel}>{stop}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.description}>{entry.description}</Text>

        {entry.overnight ? (
          <View style={styles.overnight}>
            <Ionicons name="moon-outline" size={13} color={Colors.secondary} />
            <Text style={styles.overnightText}>Overnight in {entry.overnight}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: GUTTER,
  },
  rail: {
    width: NODE,
    alignItems: 'center',
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  nodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  // Stretches to whatever the body beside it needs, so the rail is continuous
  // regardless of how much text a day carries.
  connector: {
    flex: 1,
    width: RAIL,
    marginVertical: 4,
    borderRadius: RAIL / 2,
    backgroundColor: Colors.divider,
  },
  body: {
    flex: 1,
    paddingBottom: 22,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.secondary,
  },
  title: {
    marginTop: 1,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onLight,
  },
  stops: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  stopLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onLight,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  overnight: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overnightText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
});
