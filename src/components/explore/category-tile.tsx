import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type ExploreCategory } from '@/constants/explore-data';
import { Colors } from '@/constants/theme';

export const CATEGORY_GAP = 10;

const CATEGORY_RADIUS = 20;

// Explore's frame, as a fraction of the tile it sits in. Proportional rather
// than a fixed size, so the frame tracks the card on every screen instead of
// holding one number and letting the margin absorb the rest.
//
// Not the full width the way Home's is: on Explore the tile also carries a
// strapline, and a frame flush to the edges of a cell with two lines of text
// under it reads as a mistake. The remainder is the margin, and it is meant to
// show.
const CATEGORY_BADGE_SCALE = 0.72;

// A frame may not go below this however narrow the grid gets — under it the
// artwork stops being readable as a picture of anything.
const CATEGORY_BADGE_MIN = 46;

// Home's frame, as a fraction of the tile: the whole of it. The row already
// cuts the tiles to fit the screen, so the frame banks whatever that works out
// to instead of being pinned to a size chosen for one phone.
const HOME_FRAME_SCALE = 1;

// Its corner, as a fraction of its width. A squircle rather than a circle —
// the corners a circle would have cropped are what let the artwork be drawn
// meaningfully larger inside the same cell.
const HOME_FRAME_RADIUS = 0.31;

// The glyph, as a fraction of the frame it sits in. One number for all ten:
// Ionicons draws its outline set on a shared optical grid, so unlike the
// rendered illustrations these need no per-icon correction — a plane and an ID
// card at the same point size already read as the same weight.
const GLYPH_SCALE = 0.42;

// One service, as a tile: a line glyph on a white frame, with the service's
// name beneath.
//
// The frames used to hold the rendered illustrations. They are a stroke now —
// a compact row is where a set has to read as a set, and ten photographic
// objects shrunk to 40pt read as ten different pictures. The objects are not
// gone: `ExploreCategory.icon` still carries each one, for the service's own
// screen where there is room to run it cinematically.
//
// Shared by Explore, which lists all ten across four columns with their
// straplines, and Home, which runs four of them plus More along one line at
// about a fifth of that width. `compact` is what tells the two apart: at
// Home's size there is no room for a second line under the label, and a
// truncated strapline is worse than none.
//
// Both draw the same frame — a white sheet with a hairline, the same behind
// all ten. Each category used to tint its own in an accent from the brand
// sheet, ten hues across one row; a set of services is not ten brands.
export function CategoryTile({
  category,
  width,
  compact,
  onPress,
}: {
  category: ExploreCategory;
  width: number;
  compact?: boolean;
  onPress: () => void;
}) {
  // Measured rather than left to percentages: the frame needs a numeric corner
  // radius, and the two surfaces size theirs differently.
  const frame = compact
    ? Math.round(width * HOME_FRAME_SCALE)
    : Math.max(CATEGORY_BADGE_MIN, Math.round(width * CATEGORY_BADGE_SCALE));
  const radius = compact ? Math.round(frame * HOME_FRAME_RADIUS) : frame / 2.6;

  const glyph = Math.round(frame * GLYPH_SCALE);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      // The strapline stays in the spoken name even when it is not drawn: it
      // is the part that says what the category actually does.
      accessibilityLabel={`${category.spoken ?? category.label}. ${category.detail}`}
      style={({ pressed }) => [styles.tile, { width }, pressed && styles.pressed]}>
      <View style={[styles.badge, { width: frame, height: frame, borderRadius: radius }]}>
        {/* Decorative: the label underneath already names the category, and the
            Pressable carries the accessible name for the whole tile. Ink
            rather than the action blue — the whole row is tappable, so
            colouring every glyph says nothing the layout has not already
            said, and eight blue marks is most of a screen's blue budget. */}
        <Ionicons name={category.glyph} size={glyph} color={Colors.foreground} />
      </View>

      {/* One line, always. A label that wraps makes its tile taller than the
          rest of its row, and a grid of services where one cell is deeper than
          its neighbours reads as a mistake rather than as a longer name.
          Every label fits on a line at Explore's four columns; at Home's
          narrower tile the two longest ("Car Rental", "Transfers") are close
          enough that a shrink-to-fit is what keeps them off an ellipsis. */}
      <Text
        style={[styles.label, compact && styles.labelCompact]}
        numberOfLines={1}
        adjustsFontSizeToFit={compact}
        minimumFontScale={0.85}>
        {category.label}
      </Text>

      {compact ? null : (
        <Text style={styles.detail} numberOfLines={2}>
          {category.detail}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The cell is not a surface on either screen. It was a white card with a
  // border and a lift on Explore, holding a second framed shape inside it —
  // a frame around a frame. The square inside it is the only surface either
  // tile needs.
  tile: {
    borderRadius: CATEGORY_RADIUS,
    paddingTop: 2,
    paddingBottom: 2,
    alignItems: 'center',
  },
  // The frame, on both screens: a white sheet with a hairline, no gradient and
  // no colour of its own behind any of the ten services. Its size and corner
  // are measured at the call site.
  //
  // No lift. These are small and there are five of them in a row on Home —
  // shadows at that density stop reading as depth and start reading as noise,
  // which is the opposite of what a quiet row of services is for.
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  label: {
    marginTop: 9,
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.onLight,
  },
  // Home's line only. Explore has the width for the full size.
  labelCompact: {
    fontSize: 11,
  },
  detail: {
    marginTop: 2,
    fontSize: 9.5,
    lineHeight: 13,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  // Presses the whole tile down rather than fading it: at this size a dimmed
  // tile is hard to tell from a disabled one.
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
