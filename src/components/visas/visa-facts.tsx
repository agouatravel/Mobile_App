import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GAP, PANEL_RADIUS } from '@/components/visas/metrics';
import {
  VISA_ENTRY_TYPE,
  VISA_VALIDITY,
  type VisaCountry,
} from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const CHIP = 34;

// The four facts checked before anyone reads a word of the requirements.
//
// A 2x2 grid rather than the one-row FactStrip the tour screens use: that one
// takes exactly three facts and names them duration, route and kind, so using
// it here would have meant either dropping a fact or calling a processing
// estimate a "route". Four across a phone would also put each of these back
// under 80pt, which is the mistake the steps section was just brought out of.
export function VisaFacts({ visa, width }: { visa: VisaCountry; width: number }) {
  const half = Math.floor((width - GAP) / 2);

  return (
    <View style={styles.grid}>
      <Fact
        width={half}
        icon="time-outline"
        label="Processing"
        value={`${visa.processingDays} days`}
      />
      <Fact
        width={half}
        icon="calendar-outline"
        label="Maximum stay"
        value={`${visa.maxStayDays} days`}
      />
      <Fact width={half} icon="repeat-outline" label="Entry" value={VISA_ENTRY_TYPE} />
      <Fact width={half} icon="shield-checkmark-outline" label="Validity" value={VISA_VALIDITY} />
    </View>
  );
}

function Fact({
  width,
  icon,
  label,
  value,
}: {
  width: number;
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.cell, { width }]}>
      <View style={styles.chip}>
        <Ionicons name={icon} size={17} color={Colors.secondary} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {/* Two lines: "Single or multiple entry" does not fit on one at half a
            phone's width, and shrinking it would leave two of the four cells
            set smaller than the others. */}
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
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
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: PANEL_RADIUS - 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  chip: {
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2.6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.secondary}14`,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  value: {
    marginTop: 1,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
});
