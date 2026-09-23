import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { TOURS, type Tour } from '@/constants/tours-data';
import { Ai, Colors, PhotoText } from '@/constants/theme';

const RADIUS = 26;

// Matches the screen's own content inset, so the front card lines up with the
// heading above it rather than with the edge of the display.
const SIDE = 20;

// Portrait, but only just — the deck is the largest thing on the screen and
// still has to leave the input visible at the foot on a mid-size phone.
const ASPECT = 1.02;

// How many cards are drawn at once: the one you are reading and two behind it.
// Past the second the edges are a few points apart and read as a texture on
// the card rather than as cards, and each one is a real image being decoded
// for a sliver nobody looks at.
const DEPTH = 3;

// How much smaller each card behind is drawn, and how far its top edge clears
// the one in front. The pair is what makes a stack read as depth: scale alone
// looks like a target, and rise alone looks like paper seen straight on.
const SCALE_STEP = 0.055;
const PEEK = 10;

// How far a card that has been swiped past is thrown, as a fraction of the
// page. Over one, so it clears the deck rather than sitting just behind its
// left edge while the next card settles.
const EXIT = 1.15;

// The scrim, as two stacked veils rather than a gradient: no SVG root, no
// gradient library, and at this few stops the banding a linear ramp would show
// over a photograph is not visible. The top is left alone so the chips sit on
// the picture rather than on a grey wash.
const VEIL_MID = 'rgba(16, 24, 32, 0.14)';
const VEIL_FOOT = 'rgba(16, 24, 32, 0.7)';

// What the assistant puts in front of you before you have asked it anything.
//
// The screen used to open on a question and an orb and nothing else, which is
// a blank page with a cursor on it — the reader has to supply the first idea.
// This is the assistant showing its hand: real trips out of the catalogue,
// presented the way the rest of the app presents its photography.
//
// A stack you swipe through. The cards sit on top of one another rather than
// side by side, and a horizontal scroll underneath drives which one is in
// front — swipe right to left and the top card is thrown off while the two
// behind it come forward. The page's own vertical scroll still works over the
// top of it, so the two axes do what you would expect: down the page for the
// screen, across for the trips.
//
// Built on a plain ScrollView rather than a carousel library. All it has to do
// is report an offset and snap to a page; everything the deck does is derived
// from that number on the UI thread, so nothing here costs a re-render and it
// holds frame rate while the images decode.
//
// Static order for now, and honest about it: this is `TOURS` as written. There
// is no ranking behind the assistant yet, and shuffling would only make the
// order look considered when it is not.
export function AiTripDeck() {
  const { width } = useWindowDimensions();

  // The cards are stacked, so the "page" is only a scroll distance — it is
  // what one swipe advances by, not a place anything is drawn.
  const cardWidth = width - SIDE * 2;
  const cardHeight = cardWidth / ASPECT;
  const page = cardWidth;

  // A card behind is scaled about its own centre, which pulls its top edge
  // *down* by half the height it loses. The rise has to pay that back before
  // it buys any clearance, so it is computed rather than picked — otherwise
  // the stack disappears on a small screen and gapes on a large one.
  const step = (cardHeight * SCALE_STEP) / 2 + PEEK;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={{ height: cardHeight + step * (DEPTH - 1) }}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snapping rather than free scrolling. A deck that can come to rest
        // between two cards is showing half of each, and there is nothing
        // worth reading in that state.
        snapToInterval={page}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
        // The content is a scroll range and nothing else — every card is drawn
        // absolutely at the same place, and the offset this produces is what
        // moves them. Its width is what decides how many swipes there are.
        contentContainerStyle={{ width: page * TOURS.length }}>
        {TOURS.map((tour, index) => (
          <DeckCard
            key={tour.key}
            tour={tour}
            index={index}
            scrollX={scrollX}
            page={page}
            step={step}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function DeckCard({
  tour,
  index,
  scrollX,
  page,
  step,
  cardWidth,
  cardHeight,
}: {
  tour: Tour;
  index: number;
  scrollX: SharedValue<number>;
  page: number;
  step: number;
  cardWidth: number;
  cardHeight: number;
}) {
  const router = useRouter();

  const style = useAnimatedStyle(() => {
    // Where this card sits in the deck right now. 0 is the front, 1 is
    // directly behind it, and negative means it has been swiped past.
    const pos = index - scrollX.value / page;
    const depth = Math.min(Math.max(pos, 0), DEPTH - 1);
    const gone = Math.min(pos, 0);

    return {
      // `scrollX` is added back because these are children of the scrolling
      // content and would otherwise be carried along with it. Cancelling it
      // pins every card to the same spot on screen, which is what makes them a
      // stack rather than a row — and leaves the offset free to mean depth.
      transform: [
        { translateX: scrollX.value + gone * page * EXIT },
        { translateY: -depth * step },
        { scale: 1 - depth * SCALE_STEP },
      ],
      opacity:
        pos > DEPTH - 1
          ? 0
          : pos < 0
            ? Math.max(0, 1 + pos * 1.6)
            : 1 - depth * 0.26,
    };
  });

  return (
    <Animated.View
      style={[
        styles.slot,
        {
          left: SIDE,
          width: cardWidth,
          height: cardHeight,
          // Lower indices paint over higher ones, so the front card is always
          // on top of the ones behind it. A card already swiped past keeps the
          // highest z of all, which costs nothing — by then it has been thrown
          // clear of the deck and faded out.
          zIndex: TOURS.length - index,
        },
        style,
      ]}>
      <Pressable
        onPress={() => router.push('/offers')}
        accessibilityRole="button"
        accessibilityLabel={`${tour.name}. ${tour.tagline}, ${tour.route}, ${tour.days} days`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <Image
          source={tour.cardImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={280}
        />

        <View pointerEvents="none" style={[styles.veil, styles.veilMid]} />
        <View pointerEvents="none" style={[styles.veil, styles.veilFoot]} />

        {/* The facts run along the top and the arrow closes the row, so the
            two read as one line of chrome laid over the picture rather than as
            a caption competing with the title below. */}
        <View style={styles.top}>
          {/* Two chips, and only one of them filled. The kind of trip is
              context and stays glass; where it goes is the fact worth finding
              without reading, so it takes the accent. */}
          <View style={styles.facts}>
            <View style={styles.fact}>
              <Text style={styles.factText} numberOfLines={1}>
                {tour.kind}
              </Text>
            </View>

            <View style={[styles.fact, styles.factAccent]}>
              <Text style={[styles.factText, styles.factAccentText]} numberOfLines={1}>
                {tour.route}
              </Text>
            </View>
          </View>

          <View style={styles.open}>
            <Ionicons name="arrow-forward" size={16} color={PhotoText.color} />
          </View>
        </View>

        {/* Weight and slope carry the two halves of the name, so the second
            line reads as a qualifier rather than as a second heading. */}
        <View style={styles.caption}>
          <Text style={styles.name} numberOfLines={2}>
            {tour.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {tour.tagline}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Every card occupies the same slot; the transform above is what separates
  // them. Anchored to the bottom of the container so the cards behind rise
  // into the room reserved above it.
  slot: {
    position: 'absolute',
    bottom: 0,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: Ai.surfaceStrong,
  },
  veil: { position: 'absolute', left: 0, right: 0 },
  veilMid: { top: 0, height: '54%', backgroundColor: VEIL_MID },
  veilFoot: { top: '54%', bottom: 0, backgroundColor: VEIL_FOOT },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    padding: 14,
  },
  facts: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  // The same translucent white as the screen's own chrome, so a chip on the
  // photograph and a button on the ground are recognisably one material.
  fact: {
    maxWidth: '100%',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Ai.surfaceStrong,
    borderWidth: 1,
    borderColor: Ai.border,
  },
  factText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: PhotoText.color,
  },
  factAccent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  // Ink on the orange, as everywhere else it is a fill: at chip size white on
  // #FF8A00 is the weakest pairing the palette has.
  factAccentText: {
    color: Colors.foreground,
  },
  open: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Ai.surfaceStrong,
    borderWidth: 1,
    borderColor: Ai.border,
    // Points up and to the right: it opens something, it does not advance
    // through a sequence.
    transform: [{ rotate: '-45deg' }],
  },
  caption: {
    padding: 18,
    gap: 1,
  },
  name: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 27,
    color: PhotoText.color,
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 19,
    fontWeight: '400',
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.86)',
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
