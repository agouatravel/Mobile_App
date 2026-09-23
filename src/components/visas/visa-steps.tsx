import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PANEL_RADIUS } from '@/components/visas/metrics';
import { VISA_STEPS } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

const DISC = 38;
const RAIL = 52;
const LINE = 2;
const CHIP = 40;

// The four stages, as a timeline of cards down the page.
//
// This began as four cards across the screen, which gave each about 76pt and
// forced the whole thing to 8.5pt type — the smallest in the app, for the
// section with the most to explain. "Simple, four steps" is not a claim you can
// support with text people have to squint at.
//
// Down the page instead, and each step is now its own card rather than a row on
// a shared panel. The rail runs behind them: the numbered disc sits on the
// card's left edge, straddling the seam, and the connector passes from one to
// the next. Cards give each step a surface of its own, which is what lets them
// carry an icon and a full sentence without the section turning into a wall of
// text — and it is what makes the block read as four things rather than one
// list with rules in it.
export function VisaSteps() {
  return (
    <View>
      {VISA_STEPS.map((step, index) => {
        const last = index === VISA_STEPS.length - 1;

        return (
          <View key={step.key} style={styles.row}>
            {/* The rail. The connector is drawn by every step but the last and
                stretches to whatever height the card beside it turns out to
                need — `flex: 1` inside a stretched row rather than a fixed
                height that would have to be guessed and would break the first
                time a detail line wrapped. */}
            <View style={styles.rail}>
              <View style={styles.disc}>
                <Text style={styles.discText}>{index + 1}</Text>
              </View>
              {last ? null : <View style={styles.line} />}
            </View>

            <View style={[styles.card, last && styles.cardLast]}>
              <View style={styles.chip}>
                <Ionicons name={step.icon} size={20} color={Colors.secondary} />
              </View>

              <View style={styles.copy}>
                <Text style={styles.stepLabel}>
                  Step {index + 1} of {VISA_STEPS.length}
                </Text>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.detail}>{step.detail}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    // Stretch, so the connector can fill the height the card sets.
    alignItems: 'stretch',
  },
  rail: {
    width: RAIL,
    alignItems: 'center',
  },
  // Lifted, because it sits over the card's edge rather than beside it and a
  // flat disc there reads as a hole punched in the card.
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surface,
    // Above the card, so the ring reads as the disc sitting on top of it.
    zIndex: 1,
  },
  discText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  line: {
    flex: 1,
    width: LINE,
    marginVertical: 2,
    borderRadius: LINE / 2,
    backgroundColor: `${Colors.primary}33`,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // Pulled left under the rail so the disc straddles the card's edge instead
    // of floating clear of it.
    marginLeft: -DISC / 2,
    marginBottom: 14,
    paddingVertical: 15,
    paddingRight: 14,
    paddingLeft: DISC / 2 + 12,
    borderRadius: PANEL_RADIUS - 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  cardLast: {
    marginBottom: 0,
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
  // The rail already numbers the steps, but only while all four are on screen
  // together. Scrolled to, one card at a time, this is what says where in the
  // process you are.
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Colors.primary,
  },
  title: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
  detail: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
});
