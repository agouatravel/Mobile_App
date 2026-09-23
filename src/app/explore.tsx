import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { TAB_BAR_CONTENT_INSET } from '@/components/bottom-tab-bar';
import { ExpandHint } from '@/components/explore/expand-hint';
import { CATEGORY_GAP, CategoryTile } from '@/components/explore/category-tile';
import { TopRecommendations } from '@/components/explore/top-recommendation';
import {
  EXPLORE_CATEGORIES,
  EXPLORE_COLLECTIONS,
  EXPLORE_PLACES,
  EXPLORE_REGIONS,
  type ExploreCollection,
  type ExplorePlace,
  type ExploreRegion,
} from '@/constants/explore-data';
import { CURRENT_USER } from '@/constants/home-data';
import { resolveOffers, sortOffers } from '@/constants/offers-data';
import { Colors, Glass, PhotoGlass } from '@/constants/theme';

const SIDE_PADDING = 20;
const AVATAR = 52;

// Card takes most of the width but not all, so the neighbours peek in on both
// sides and the rail reads as a carousel rather than a single card.
const CARD_FRACTION = 0.72;
const CARD_ASPECT = 0.7; // width / height
const CARD_GAP = 14;
const CARD_BODY_PAD = 16;

// Slide-to-open control at the foot of each card.
const SLIDER_H = 52;
const SLIDER_PAD = 5;
const KNOB = SLIDER_H - SLIDER_PAD * 2;
// Fraction of the track the knob must pass for the drag to count as a commit
// rather than a stray swipe.
const COMMIT_AT = 0.6;

// Category grid under the greeting. Four columns is what the reference uses at
// phone width, and it is what makes the eight tiles land as two even rows.
const CATEGORY_COLUMNS = 4;

// Collection rail below the carousel.
const COLLECTION_W = 220;
const COLLECTION_H = 148;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [region, setRegion] = useState<ExploreRegion>(EXPLORE_REGIONS[0]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const cardWidth = Math.round(width * CARD_FRACTION);
  const cardHeight = Math.round(cardWidth / CARD_ASPECT);
  const stride = cardWidth + CARD_GAP;
  const sliderWidth = cardWidth - CARD_BODY_PAD * 2;

  const contentWidth = width - SIDE_PADDING * 2;
  const categoryWidth = Math.floor(
    (contentWidth - CATEGORY_GAP * (CATEGORY_COLUMNS - 1)) / CATEGORY_COLUMNS
  );

  // Sorted by discount rather than hand-picked: an editorial slot that has to
  // be re-pointed by hand goes stale, and the whole value of this rail is that
  // it is current. Biggest saving leads, so the rail opens on its strongest
  // card.
  const recommendations = sortOffers(resolveOffers(), 'Biggest discount');

  const places = EXPLORE_PLACES.filter((place) => place.region === region);

  // The rail opens on the middle card rather than the first. The focus effect
  // below keys off distance from the centre of the screen, so landing on index
  // 0 left the carousel looking like a list that starts at its own edge — with
  // a neighbour on one side only, there is nothing to suggest it scrolls both
  // ways.
  const centreIndex = places.length > 0 ? Math.floor(places.length / 2) : 0;
  const centreOffset = centreIndex * stride;

  // The slider's pan has to out-prioritise both scrollers it sits inside: the
  // carousel pans on the same axis, and the page scrolls vertically underneath
  // it. blocksExternalGesture needs their refs to do that.
  const railRef = useRef<Animated.ScrollView>(null);
  // Animated.ScrollView rather than the plain one purely so the ref is the
  // shape blocksExternalGesture accepts, as railRef's already is.
  const pageRef = useRef<Animated.ScrollView>(null);
  // Seeded rather than started at 0, so the centred card is already at full
  // scale on the first frame instead of scaling up once the first scroll
  // event lands.
  const scrollX = useSharedValue(centreOffset);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // `contentOffset` alone does not cover this: it is honoured at mount, but the
  // region chips swap the set out afterwards and the rail would hold whatever
  // offset the previous region left it at. onContentSizeChange catches the
  // mount case on Android, where the effect can run before the row is measured
  // and scrollTo would be dropped.
  //
  // scrollX is left alone here — a programmatic scroll still emits a scroll
  // event on both platforms, so the handler picks the new offset up.
  const centreRail = useCallback(() => {
    railRef.current?.scrollTo({ x: centreOffset, animated: false });
  }, [centreOffset]);

  useEffect(centreRail, [centreRail]);

  return (
    <Animated.ScrollView
      ref={pageRef}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: TAB_BAR_CONTENT_INSET + 24,
      }}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text style={styles.hello} numberOfLines={1}>
            Hello, {CURRENT_USER.name.split(' ')[0]}
          </Text>
          <Text style={styles.welcome} numberOfLines={1}>
            Welcome to Agoua
          </Text>
        </View>
        <Image
          source={CURRENT_USER.avatar}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Collapsed to the first row, with the rest a tap away. Ten tiles is
          three rows of chrome before the page gets to any content; one row and
          a prompt is enough to say the others are there. */}
      <View style={styles.categorySection}>
        <View style={styles.categoryGrid}>
          {(categoriesOpen ? EXPLORE_CATEGORIES : EXPLORE_CATEGORIES.slice(0, CATEGORY_COLUMNS)).map(
            (category) => (
              <CategoryTile
                key={category.key}
                category={category}
                width={categoryWidth}
                onPress={() => router.push(category.href)}
              />
            )
          )}
        </View>

        {EXPLORE_CATEGORIES.length > CATEGORY_COLUMNS ? (
          <Pressable
            onPress={() => setCategoriesOpen((current) => !current)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityState={{ expanded: categoriesOpen }}
            accessibilityLabel={
              categoriesOpen
                ? 'Show fewer categories'
                : `Show all ${EXPLORE_CATEGORIES.length} categories`
            }
            style={({ pressed }) => [styles.categoryToggle, pressed && styles.pressed]}>
            <ExpandHint open={categoriesOpen} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.heading}>Explore new horizons</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.railOuter}
        contentContainerStyle={styles.rail}>
        {EXPLORE_REGIONS.map((item) => {
          const active = item === region;
          return (
            <Pressable
              key={item}
              onPress={() => setRegion(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Animated.ScrollView
        ref={railRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={stride}
        decelerationRate="fast"
        disableIntervalMomentum
        contentOffset={{ x: centreOffset, y: 0 }}
        onContentSizeChange={centreRail}
        // Half the leftover width on each side, so the first and last cards
        // settle centred rather than flush against the screen edge.
        contentContainerStyle={{
          paddingHorizontal: (width - cardWidth) / 2,
          gap: CARD_GAP,
        }}>
        {places.map((place, index) => (
          <PlaceCard
            key={place.key}
            place={place}
            index={index}
            scrollX={scrollX}
            stride={stride}
            width={cardWidth}
            height={cardHeight}
            sliderWidth={sliderWidth}
            railRef={railRef}
            pageRef={pageRef}
            onOpen={() => router.push({ pathname: '/place', params: { key: place.key } })}
          />
        ))}
      </Animated.ScrollView>

      {recommendations.length > 0 ? (
        <>
          <SectionHeading title="Top Recommendations" onSeeAll={() => router.push('/offers')} />
          <View style={styles.recommendations}>
            <TopRecommendations
              offers={recommendations}
              screenWidth={width}
              onPressOffer={(offer) =>
                router.push({ pathname: '/offer', params: { key: offer.key } })
              }
            />
          </View>
        </>
      ) : null}

      <SectionHeading title="Collections" onSeeAll={() => router.push('/destinations')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.collectionRailOuter}
        contentContainerStyle={styles.collectionRail}>
        {EXPLORE_COLLECTIONS.map((collection) => (
          <CollectionCard
            key={collection.key}
            collection={collection}
            onPress={() => router.push('/destinations')}
          />
        ))}
      </ScrollView>

    </Animated.ScrollView>
  );
}

function SectionHeading({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CollectionCard({
  collection,
  onPress,
}: {
  collection: ExploreCollection;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${collection.title}, ${collection.count} places`}
      style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}>
      <Image
        source={collection.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      {/* Same scrim treatment as the place cards, and the same per-card id:
          ids are not reliably scoped across sibling Svg roots on native. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={`collectionScrim-${collection.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="30%" stopColor={Colors.foreground} stopOpacity={0} />
            <Stop offset="100%" stopColor={Colors.foreground} stopOpacity={0.78} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#collectionScrim-${collection.key})`} />
      </Svg>

      <View style={styles.collectionBody}>
        <Text style={styles.collectionTitle} numberOfLines={2}>
          {collection.title}
        </Text>
        <Text style={styles.collectionCount}>{collection.count} places</Text>
      </View>
    </Pressable>
  );
}

function PlaceCard({
  place,
  index,
  scrollX,
  stride,
  width,
  height,
  sliderWidth,
  railRef,
  pageRef,
  onOpen,
}: {
  place: ExplorePlace;
  index: number;
  scrollX: SharedValue<number>;
  stride: number;
  width: number;
  height: number;
  sliderWidth: number;
  railRef: React.RefObject<Animated.ScrollView | null>;
  pageRef: React.RefObject<Animated.ScrollView | null>;
  onOpen: () => void;
}) {
  const [saved, setSaved] = useState(false);

  // Neighbours sit back a little so the centred card reads as the focused one.
  const cardStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * stride) / stride;
    return {
      transform: [
        { scale: interpolate(distance, [0, 1], [1, 0.92], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(distance, [0, 1], [1, 0.75], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View style={[styles.card, { width, height }, cardStyle]}>
      <Image
        source={place.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      {/* Gradient scrim rather than a flat overlay: a uniform wash dark enough
          to carry the caption would mute the whole photograph. The id is
          per-card, since ids are not reliably scoped across sibling Svg roots
          on native. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={`exploreScrim-${place.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.foreground} stopOpacity={0.15} />
            <Stop offset="45%" stopColor={Colors.foreground} stopOpacity={0.05} />
            <Stop offset="100%" stopColor={Colors.foreground} stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#exploreScrim-${place.key})`} />
      </Svg>

      <Pressable
        onPress={() => setSaved((current) => !current)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
        accessibilityState={{ selected: saved }}
        style={({ pressed }) => [styles.heart, pressed && styles.pressed]}>
        {/* White while empty so it reads as a control on the photo, brand
            orange once filled so the saved state is unmistakable. */}
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={19}
          color={saved ? Colors.accent : Colors.primaryForeground}
        />
      </Pressable>

      <View style={styles.cardBody}>
        <Text style={styles.country} numberOfLines={1}>
          {place.country}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>

        <SeeMoreSlider
          label={`See more about ${place.name}`}
          width={sliderWidth}
          railRef={railRef}
          pageRef={pageRef}
          onOpen={onOpen}
        />
      </View>
    </Animated.View>
  );
}

// Slide-to-open rather than tap-to-open: the knob starts at the left, the fill
// behind it grows with the drag, and releasing past COMMIT_AT opens the place.
// A short drag springs back, so a mis-swipe on the carousel cannot navigate.
function SeeMoreSlider({
  label,
  width,
  railRef,
  pageRef,
  onOpen,
}: {
  label: string;
  width: number;
  railRef: React.RefObject<Animated.ScrollView | null>;
  pageRef: React.RefObject<Animated.ScrollView | null>;
  onOpen: () => void;
}) {
  const travel = Math.max(width - SLIDER_PAD * 2 - KNOB, 1);
  const offset = useSharedValue(0);

  const pan = Gesture.Pan()
    // The carousel pans on the same axis, so this gesture has to win outright
    // or the card would slide instead of the knob. The page scroller is named
    // too: activeOffsetX should keep a vertical drag out of here, but a
    // diagonal one would otherwise be up for grabs.
    .blocksExternalGesture(railRef, pageRef)
    .activeOffsetX([-6, 6])
    .onUpdate((event) => {
      offset.value = Math.min(Math.max(event.translationX, 0), travel);
    })
    .onEnd(() => {
      if (offset.value >= travel * COMMIT_AT) {
        runOnJS(onOpen)();
      }
      // Always springs home: the screen this opens is pushed on top, so the
      // card is still mounted underneath and would otherwise stay latched.
      offset.value = withDelay(120, withSpring(0, { damping: 18, stiffness: 160 }));
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  // Grows from under the knob, so the track fills with brand colour as it goes.
  const fillStyle = useAnimatedStyle(() => ({
    width: offset.value + KNOB + SLIDER_PAD * 2,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityHint="Swipe right to open"
        style={[styles.seeMore, { width }]}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.seeMoreFill]} />
        <Animated.View pointerEvents="none" style={[styles.seeMoreProgress, fillStyle]} />

        <Text style={styles.seeMoreLabel}>See More Offers</Text>

        {/* The same label again in white, inside a clip that tracks the fill —
            so the letters turn white exactly as the orange passes under them,
            rather than the whole word flipping at a threshold. At rest the clip
            is only knob-wide, so none of the text is white until a drag starts. */}
        <Animated.View pointerEvents="none" style={[styles.labelClip, fillStyle]}>
          <Text style={[styles.seeMoreLabel, styles.seeMoreLabelOver, { width }]}>
            See More Offers
          </Text>
        </Animated.View>

        <Animated.View style={[styles.seeMoreArrow, knobStyle]}>
          <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: SIDE_PADDING,
  },
  greetingText: {
    flex: 1,
    gap: 2,
  },
  hello: {
    fontSize: 25,
    fontWeight: '800',
    color: Colors.onLight,
  },
  welcome: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Glass.fill,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryGrid: {
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CATEGORY_GAP,
    // Ten tiles over four columns leaves the last row short. Centring it reads
    // as the end of a grid; left-aligned, those two look like a row that failed
    // to load. Full rows fill their width exactly, so nothing else moves.
    justifyContent: 'center',
  },
  // Bare chevrons on the page, clear of the row. The tap target comes from the
  // padding plus hitSlop rather than from a disc, since there is no longer a
  // shape to press.
  categoryToggle: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  heading: {
    marginTop: 24,
    paddingHorizontal: SIDE_PADDING,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onLight,
  },
  // Without flexGrow:0 the rail stretches to fill the column and opens a gap
  // beneath the chips.
  railOuter: {
    flexGrow: 0,
    marginTop: 16,
  },
  rail: {
    paddingHorizontal: SIDE_PADDING,
    gap: 10,
    paddingBottom: 18,
  },
  chip: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderColor: Glass.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onLight,
  },
  chipLabelActive: {
    color: Colors.primaryForeground,
    fontWeight: '700',
  },
  sectionHeadingRow: {
    marginTop: 28,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.foreground,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  // No horizontal margin: the rail runs the full width so cards can scroll past
  // the screen edge. It carries its own centring padding instead.
  recommendations: {
    marginTop: 14,
  },
  fabArrow: {
    transform: [{ rotate: '-45deg' }],
  },
  // Same flexGrow:0 reason as railOuter above.
  collectionRailOuter: {
    flexGrow: 0,
    marginTop: 14,
  },
  collectionRail: {
    paddingHorizontal: SIDE_PADDING,
    gap: 12,
    // Room for the card's shadow-less edge to clear the next heading without
    // the rail itself carrying a margin the horizontal scroll would inherit.
    paddingBottom: 4,
  },
  collectionCard: {
    width: COLLECTION_W,
    height: COLLECTION_H,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  collectionBody: {
    padding: 14,
  },
  collectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },
  collectionCount: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Glass.fill,
  },
  heart: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardBody: {
    padding: 16,
  },
  country: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  name: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  seeMore: {
    marginTop: 16,
    height: SLIDER_H,
    borderRadius: SLIDER_H / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: SLIDER_PAD,
  },
  seeMoreFill: {
    backgroundColor: PhotoGlass.fill,
  },
  // Anchored left and grown by the drag, so the track colours in behind the
  // knob rather than the knob sliding over a static bar.
  seeMoreProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: SLIDER_H / 2,
    backgroundColor: Colors.primary,
  },
  seeMoreLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onLight,
  },
  // Clips the white copy of the label to the filled part of the track. Its
  // child is given the slider's full width so the text centres on the same
  // point as the dark copy underneath and the two stay in register.
  labelClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  seeMoreLabelOver: {
    color: Colors.primaryForeground,
  },
  // White, not orange: the track it travels along fills with orange behind it,
  // and an orange knob dissolves into that fill just as the drag completes.
  seeMoreArrow: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
