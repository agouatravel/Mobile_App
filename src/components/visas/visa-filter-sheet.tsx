import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PriceRangeSlider } from '@/components/visas/price-range-slider';
import { SegmentedControl } from '@/components/visas/segmented-control';
import { SIDE_PADDING } from '@/components/visas/metrics';
import {
  ALL_REGIONS,
  DEFAULT_SORT,
  FULL_PRICE_RANGE,
  VISA_PRICE_MAX,
  VISA_PRICE_MIN,
  VISA_PRICE_STEP,
  VISA_REGIONS,
  VISA_SORTS,
  type PriceRange,
  type VisaRegionFilter,
  type VisaSort,
} from '@/constants/visas-data';
import { Colors } from '@/constants/theme';

const SHEET_RADIUS = 30;
const SHEET_MARGIN = 10;

// How far the sheet starts below its resting place. Not the sheet's own height:
// that is only known after layout, and a travel longer than the distance the
// eye needs makes the entrance feel slow rather than large.
const TRAVEL = 420;

// The entrance rides a spring so the sheet arrives with some weight; the exit
// is a short timing curve, because a dismissal that bounces reads as the sheet
// resisting being closed.
const IN_DAMPING = 20;
const OUT_MS = 190;

// Each section falls in behind the one above it. Small numbers — the whole
// stagger is over inside a third of a second, so it reads as the panel
// assembling rather than as four separate animations to sit through.
const STAGGER = 55;

// The shorter labels the segmented control shows. The stored sort strings say
// what they sort by as well as which way, which a third of a pill cannot hold.
const SORT_LABELS: Record<VisaSort, string> = {
  'Price: low to high': 'Lowest',
  'Price: high to low': 'Highest',
  'Name: A-Z': 'A–Z',
};

export function VisaFilterSheet({
  open,
  region,
  sort,
  price,
  onApply,
  onClose,
}: {
  open: boolean;
  region: VisaRegionFilter;
  sort: VisaSort;
  price: PriceRange;
  onApply: (region: VisaRegionFilter, sort: VisaSort, price: PriceRange) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={open}
      transparent
      // The sheet animates itself, in both directions. Leaving the Modal's own
      // slide on top of it would run two entrances at once, at two different
      // speeds, and the exit below would never be seen.
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* Mounted only while open, which is what seeds the draft state below
          from the applied values without syncing props into state: a sheet
          dismissed without applying is unmounted, so it cannot reopen holding
          the abandoned choice. */}
      {open ? (
        <FilterBody
          region={region}
          sort={sort}
          price={price}
          onApply={onApply}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function FilterBody({
  region,
  sort,
  price,
  onApply,
  onClose,
}: {
  region: VisaRegionFilter;
  sort: VisaSort;
  price: PriceRange;
  onApply: (region: VisaRegionFilter, sort: VisaSort, price: PriceRange) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  const [draftRegion, setDraftRegion] = useState(region);
  const [draftSort, setDraftSort] = useState(sort);
  const [draftPrice, setDraftPrice] = useState(price);
  // Bumped by Reset. The slider owns its thumbs once it has mounted, so the
  // only honest way to move them from outside is to give it a new identity and
  // let it seed itself again.
  const [sliderKey, setSliderKey] = useState(0);

  // Only the exit is driven by hand. The entrance is left to Reanimated's own
  // `entering` builders below, which run on mount without anything having to
  // push a value at them — and keeping this out of an effect is also what stops
  // it being a value the compiler sees mutated across a dependency.
  const closing = useSharedValue(0);

  // Both ways out play the exit first and only then tell the parent, which is
  // what unmounts this. Calling back straight away would cut the animation off.
  // Not wrapped in useCallback: nothing downstream is memoised on it, and the
  // shared value must stay outside any hook's dependencies.
  const leave = (then: () => void) => {
    closing.value = withTiming(1, { duration: OUT_MS }, (finished) => {
      if (finished) runOnJS(then)();
    });
  };

  const scrim = useAnimatedStyle(() => ({ opacity: 1 - closing.value }));

  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateY: closing.value * TRAVEL }],
  }));

  return (
    <View style={styles.root}>
      {/* The entering animation and the closing style are on separate nodes
          throughout, and deliberately: a layout animation and an animated style
          driving the same property on one view overwrite each other, and it is
          the exit that loses — Reanimated warns about exactly this. The outer
          view owns the entrance, the inner one owns the dismissal. */}
      <Animated.View entering={FadeIn.duration(220)} style={styles.scrim}>
        <Animated.View style={[styles.scrimFill, scrim]}>
          <Pressable
            style={styles.scrimTarget}
            onPress={() => leave(onClose)}
            accessibilityLabel="Close filters"
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(IN_DAMPING).stiffness(190)}
        style={[styles.sheetWrap, { marginBottom: Math.max(insets.bottom, SHEET_MARGIN) }]}>
        <Animated.View accessibilityViewIsModal style={[styles.sheet, sheet]}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            {/* Centred, with the icon beside the word rather than a control on
                either side — the reference leads with the title, and Reset is
                secondary enough to sit under it. */}
            <Ionicons name="options-outline" size={19} color={Colors.onLight} />
            <Text style={styles.title}>Filter</Text>

            <Pressable
              onPress={() => {
                setDraftRegion(ALL_REGIONS);
                setDraftSort(DEFAULT_SORT);
                setDraftPrice(FULL_PRICE_RANGE);
                setSliderKey((current) => current + 1);
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Reset filters"
              style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
              <Text style={styles.resetLabel}>Reset</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInDown.delay(STAGGER).springify().damping(IN_DAMPING)}>
              <Text style={styles.groupLabel}>Sort by</Text>
              <SegmentedControl
                options={VISA_SORTS}
                value={draftSort}
                onChange={setDraftSort}
                labels={SORT_LABELS}
              />
            </Animated.View>

            <Animated.View
              style={styles.group}
              entering={FadeInDown.delay(STAGGER * 2).springify().damping(IN_DAMPING)}>
              <Text style={styles.groupLabel}>Price range</Text>
              <PriceRangeSlider
                key={sliderKey}
                min={VISA_PRICE_MIN}
                max={VISA_PRICE_MAX}
                step={VISA_PRICE_STEP}
                initialLow={draftPrice.low}
                initialHigh={draftPrice.high}
                onChange={(low, high) => setDraftPrice({ low, high })}
              />
            </Animated.View>

            <Animated.View
              style={styles.group}
              entering={FadeInDown.delay(STAGGER * 3).springify().damping(IN_DAMPING)}>
              <Text style={styles.groupLabel}>Region</Text>
              <View style={styles.chips}>
                {[ALL_REGIONS as VisaRegionFilter, ...VISA_REGIONS].map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={draftRegion === option}
                    onPress={() => setDraftRegion(option)}
                  />
                ))}
              </View>
            </Animated.View>
          </ScrollView>

          <Animated.View entering={FadeInDown.delay(STAGGER * 4).springify().damping(IN_DAMPING)}>
            <ApplyButton
              onPress={() => leave(() => onApply(draftRegion, draftSort, draftPrice))}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// The full-width close. Presses down rather than fading: it is the largest
// target on the sheet and a dimmed one that size looks disabled.
function ApplyButton({ onPress }: { onPress: () => void }) {
  const press = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.03 }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (press.value = withSpring(1, { damping: 20, stiffness: 400 }))}
        onPressOut={() => (press.value = withSpring(0, { damping: 20, stiffness: 400 }))}
        accessibilityRole="button"
        accessibilityLabel="Apply filters"
        style={styles.apply}>
        <Ionicons name="checkmark" size={17} color={Colors.primaryForeground} />
        <Text style={styles.applyLabel}>Apply filter</Text>
      </Pressable>
    </Animated.View>
  );
}

// Single-select, so these are radios wearing chips. The role matters more than
// the shape: a screen reader announcing "button" gives no hint that picking one
// drops the last.
function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const press = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.05 }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (press.value = withSpring(1, { damping: 18, stiffness: 420 }))}
        onPressOut={() => (press.value = withSpring(0, { damping: 18, stiffness: 420 }))}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Deeper than a conventional scrim. The sheet is near-white and floats clear
  // of all four edges, so the darkness behind it is what gives it its edge —
  // at a lighter value the corners dissolve into the page underneath.
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrimFill: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
  },
  scrimTarget: {
    flex: 1,
  },
  // The wrapper carries the layout, so the percentage cap resolves against the
  // full-height root rather than against a box that sizes to its own content.
  sheetWrap: {
    marginHorizontal: SHEET_MARGIN,
    maxHeight: '84%',
  },
  // Floating rather than edge-to-edge, so the radius runs all the way round the
  // way the reference draws it. `flexShrink` is what makes the card respect the
  // wrapper's cap instead of overflowing it once the content is tall.
  sheet: {
    flexShrink: 1,
    borderRadius: SHEET_RADIUS,
    backgroundColor: Colors.surface,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },
  headerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.onLight,
  },
  // Absolute so it cannot pull the centred title off centre.
  reset: {
    position: 'absolute',
    right: 0,
  },
  resetLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.secondary,
  },
  body: {
    paddingTop: 22,
    paddingBottom: 6,
  },
  group: {
    marginTop: 24,
  },
  groupLabel: {
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onLight,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Bordered in `divider` rather than the usual `Glass.border`: that token is a
  // near-white highlight tuned for cards on the tinted backdrop, and on this
  // white sheet it is invisible.
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  chipSelected: {
    backgroundColor: `${Colors.primary}1A`,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  apply: {
    marginTop: 18,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 26,
    backgroundColor: Colors.primary,
  },
  applyLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  pressed: {
    opacity: 0.6,
  },
});
