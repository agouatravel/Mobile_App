import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CategoryTile } from '@/components/explore/category-tile';
import { EXPLORE_CATEGORIES } from '@/constants/explore-data';

const SIDE_PADDING = 20;
const COLUMNS = 4;
const GAP = 12;
const ROW_GAP = 22;

// The eight services Home answers "what do you need?" with, in the order they
// are asked for rather than the order the brand sheet lists them: the two
// halves of a trip first, then what it takes to be allowed on it, then how you
// move once you land.
//
// Eight, not ten. IDL and Tours are the two nobody arrives at Home looking
// for — they are found on the way through a trip, not at the start of one —
// and eight is what fills four columns twice with no ragged last row. Both are
// a tap away under the section's own "See all".
const FEATURED = [
  'flights',
  'hotels',
  'visas',
  'packages',
  'car-rental',
  'transfers',
  'trains',
  'cruise',
];

// Home's service grid: a static block of line glyphs, four across.
//
// It was a horizontally scrolling row of five. A row that scrolls hides most
// of itself, and a shortcut you have to swipe through is not a shortcut — the
// same objection that took it down from ten to five in the first place. Four
// columns and two rows shows all eight at once in barely more height than the
// one row took, because nothing here is a card any more.
export function ServiceGrid() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const contentWidth = width - SIDE_PADDING * 2;
  const tileWidth = Math.floor((contentWidth - GAP * (COLUMNS - 1)) / COLUMNS);

  // Resolved against the real list rather than duplicated, so a service
  // renamed or repointed in one place cannot fall out of step here. A key that
  // no longer exists drops out rather than rendering a hole.
  const services = FEATURED.map((key) =>
    EXPLORE_CATEGORIES.find((category) => category.key === key)
  ).filter((category) => category !== undefined);

  return (
    <View style={styles.grid}>
      {services.map((service) => (
        <CategoryTile
          key={service.key}
          category={service}
          width={tileWidth}
          compact
          onPress={() => router.push(service.href)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // `space-between` rather than a column gap: the tiles are cut to the width
    // by integer division, which leaves a point or two spare, and this shares
    // that remainder out between them instead of pooling it on the right.
    justifyContent: 'space-between',
    rowGap: ROW_GAP,
  },
});
