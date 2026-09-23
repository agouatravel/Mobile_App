import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PhotoScrim } from '@/components/offers/photo-scrim';
import { formatPrice } from '@/constants/currency';
import { DESTINATIONS } from '@/constants/home-data';
import { Colors, Glass, PhotoGlass, PhotoText } from '@/constants/theme';

const GAP = 14;
const SIDE_PADDING = 20;
const CARD_MIN_WIDTH = 170;

// How many cards are built in the first commit. The rest arrive afterwards,
// CHUNK at a time, while the thread is idle.
//
// This grid is not virtualised — it maps the whole list into a plain View
// inside Home's ScrollView — and each card mounts an image and two SVG roots
// (the scrim and the corner cut). At the full list that is a great many native
// views constructed synchronously, which is what was blocking the JS thread for
// seconds on every tab press. Six fills the visible fold at two columns.
const FIRST_PAINT = 6;

// Cards added per idle pass. This used to be "all of them", deferred once
// behind InteractionManager, which only moved the same long task one tick
// later — the thread still stalled building the whole remainder in a single
// commit. Four keeps each task to roughly a screenful of native views, short
// enough to yield between them.
const CHUNK = 4;

const CARD_RADIUS = 22;
// The photo runs to the card's edge, so the card's own white is only ever
// visible inside the cut. The wrapper stays because it is what carries the
// shadow — the media clips its own overflow to round the photo.
const MEDIA_RADIUS = CARD_RADIUS;
// Portrait, because the caption now sits inside the photo and needs room below
// the subject rather than beside it.
const ASPECT = 0.72;

// The cut is built as a circle centred on the media's top-right corner, entered
// and left through fillets tangent to both the arc and the edge they meet —
// without those the curve would land on each edge at a right angle and read as
// a bite rather than a sweep.
const BITE = 0.33;
const BLEND = 0.16;

// The whole cut is then scaled about the corner: wider than it is deep, so it
// runs well across the top edge but drops only shallowly down the right. The
// badge's clearance from the arc is what sets the floor on how small this can
// go — flatten it further and the heart pushes back out onto the photo.
// Scaling is affine, so it maps the circles to axis-aligned ellipses and every
// tangency in the construction survives it.
const SKEW_X = 1;
const SKEW_Y = 0.73;

// The path's flat edges run this far past the media on the top and right. The
// Svg is anchored to the media's top-right by negative offsets rather than
// sized from the computed media width, so neither the fill nor its container
// can fall a rounded sub-pixel short of the edge and leave a sliver of photo.
const OVERSHOOT = 6;

// The badge is a disc now, so its diagonal — not the glyph — is what has to
// clear the cut's arc. At the narrowest card the grid builds (two columns on a
// small phone) a 26pt disc at these margins sits about 94% of the way out to
// the ellipse, so growing either the disc or the margins much further would
// push its shoulder back onto the photo.
const BADGE = 26;
const BADGE_MARGIN_RIGHT = 8;
const BADGE_MARGIN_TOP = 5;
const HEART = 15;

const CAPTION_INSET = 7;
const PILL_PADDING_X = 9;

type BiteGeometry = ReturnType<typeof measureBite>;

// Responsive card grid — column count adapts to screen width (2 on most
// phones, more on tablets/larger screens) instead of a fixed layout.
export function DestinationGrid() {
  const { width } = useWindowDimensions();

  const shown = useIdleCount(DESTINATIONS.length, FIRST_PAINT, CHUNK);

  const visible = DESTINATIONS.slice(0, shown);
  const available = width - SIDE_PADDING * 2;
  const columns = Math.max(2, Math.floor(available / (CARD_MIN_WIDTH + GAP)));
  const cardWidth = (available - GAP * (columns - 1)) / columns;

  const mediaWidth = cardWidth;
  const mediaHeight = mediaWidth / ASPECT;
  const bite = measureBite(mediaWidth);

  return (
    <View style={[styles.grid, { paddingHorizontal: SIDE_PADDING }]}>
      {visible.map((destination) => (
        <View key={destination.key} style={{ width: cardWidth, marginBottom: GAP }}>
          <View style={styles.card}>
            <View style={[styles.media, { height: mediaHeight }]}>
              <Image
                source={destination.image}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />

              {/* The title sits bare on the photo now, so it needs the same
                  scrim the other photo captions use. Drawn before the cut, so
                  the cut's white still paints over it. */}
              <PhotoScrim id={`destinationScrim-${destination.key}`} from="52%" />

              {/* The cut is painted over the photo in the card's own white
                  rather than clipped out of it: an Image cannot be masked by
                  an arbitrary path in React Native without a masking library,
                  and against the card behind it the result is identical. */}
              <Svg
                width={bite.boxWidth}
                height={bite.boxHeight}
                style={{
                  position: 'absolute',
                  top: -OVERSHOOT,
                  right: -OVERSHOOT,
                  width: bite.boxWidth,
                  height: bite.boxHeight,
                }}
                pointerEvents="none">
                <Path d={buildBitePath(bite)} fill={Colors.surface} />
              </Svg>

              {/* Name and price sit bare on the photo; the location pill is the
                  card's only panel, and hugs its own text. */}
              <View style={styles.footer}>
                <Text style={styles.name} numberOfLines={1}>
                  {destination.name}
                </Text>

                <View style={styles.locationPill}>
                  <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
                  <Text style={styles.location} numberOfLines={1}>
                    {destination.location}
                  </Text>
                </View>

                <Text style={styles.price} numberOfLines={1}>
                  From {formatPrice(destination.priceFrom)}
                </Text>
              </View>
            </View>

            {/* The heart sits on its own disc in the cut. Placed outside the
                media rather than in it, because the media clips overflow and
                the badge sits over the card's own white. */}
            <SaveBadge name={destination.name} />
          </View>
        </View>
      ))}
    </View>
  );
}

// `requestIdleCallback` is what React Native points at now that
// InteractionManager is deprecated (and, since 0.86, only a `setImmediate`
// stub anyway — it no longer waits for anything). It is a global on native and
// in current browsers, but Safari only shipped it in 16.4, and this app builds
// for web too, so the pair falls back to a timeout where it is missing.
//
// Read inside a try: on the New Architecture these globals are lazy getters
// over a C++ TurboModule, so merely probing them can throw where that module
// isn't registered. A missing scheduler should cost us the idle hint, not the
// screen.
const HAS_IDLE = (() => {
  try {
    return typeof requestIdleCallback === 'function' && typeof cancelIdleCallback === 'function';
  } catch {
    return false;
  }
})();

// The timeout is a ceiling, not a delay: a thread that never goes idle (a long
// scroll, say) would otherwise hold the rest of the grid back indefinitely.
const IDLE_TIMEOUT = 500;

function scheduleIdle(run: () => void): number {
  if (HAS_IDLE) {
    return requestIdleCallback(run, { timeout: IDLE_TIMEOUT }) as unknown as number;
  }
  return setTimeout(run, 1) as unknown as number;
}

function cancelIdle(handle: number) {
  if (HAS_IDLE) {
    cancelIdleCallback(handle);
    return;
  }
  clearTimeout(handle);
}

// Grows from `initial` to `total`, `chunk` items per idle pass, and returns how
// many may be rendered this commit. Each commit queues the next chunk, so the
// mounting cost is spread over several short tasks instead of one long one.
// The pending pass is cancelled on unmount, so a screen left quickly stops
// building cards nobody is looking at.
function useIdleCount(total: number, initial: number, chunk: number) {
  const [count, setCount] = useState(() => Math.min(initial, total));

  useEffect(() => {
    if (count >= total) return;

    const handle = scheduleIdle(() => setCount((current) => Math.min(current + chunk, total)));
    return () => cancelIdle(handle);
  }, [count, total, chunk]);

  return count;
}

// Saved state is per-card and local, matching PlaceHero — there is no store
// behind it yet, so it does not survive unmount or sync with the detail screen.
//
// Hollow outline when not saved, solid primary when it is, on a white disc that
// lifts off the cut on its shadow alone. hitSlop still
// carries the rest of the touch target — the disc is smaller than 44pt.
function SaveBadge({ name }: { name: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <Pressable
      onPress={() => setSaved((current) => !current)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${name} from saved` : `Save ${name}`}
      accessibilityState={{ selected: saved }}
      style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={HEART}
        color={saved ? Colors.accent : Colors.textMuted}
      />
    </Pressable>
  );
}

// Solves the cut in circular form, then scales it about the corner.
//
// Each fillet's centre sits at r + blend from the corner (externally tangent to
// the main circle) and at `blend` from its edge, which puts its contact point
// on that edge at s = sqrt(r² + 2·r·blend) from the corner. The shared tangent
// points follow from walking r along the line joining the two centres.
function measureBite(mediaWidth: number) {
  const r = mediaWidth * BITE;
  const blend = mediaWidth * BLEND;
  const k = r + blend;
  const s = Math.sqrt(r * r + 2 * r * blend);

  return {
    reachX: s * SKEW_X,
    reachY: s * SKEW_Y,
    arcRx: r * SKEW_X,
    arcRy: r * SKEW_Y,
    blendRx: blend * SKEW_X,
    blendRy: blend * SKEW_Y,
    // Tangent-point offsets from the corner, scaled.
    t1x: ((r * s) / k) * SKEW_X,
    t1y: ((r * blend) / k) * SKEW_Y,
    t2x: ((r * blend) / k) * SKEW_X,
    t2y: ((r * s) / k) * SKEW_Y,
    boxWidth: s * SKEW_X + OVERSHOOT * 2,
    boxHeight: s * SKEW_Y + OVERSHOOT * 2,
  };
}

// Coordinates are in the Svg's own box, whose top-right sits OVERSHOOT beyond
// the media's top-right corner. The curve's points are exact; only the flat
// runs overshoot, and the media's View clip — not the path's antialiased edge —
// is what cuts them.
function buildBitePath(b: BiteGeometry) {
  const cx = b.boxWidth - OVERSHOOT;
  const cy = OVERSHOOT;

  return (
    `M ${cx - b.reachX} 0` +
    ` L ${cx - b.reachX} ${cy}` +
    ` A ${b.blendRx} ${b.blendRy} 0 0 1 ${cx - b.t1x} ${cy + b.t1y}` +
    ` A ${b.arcRx} ${b.arcRy} 0 0 0 ${cx - b.t2x} ${cy + b.t2y}` +
    ` A ${b.blendRx} ${b.blendRy} 0 0 1 ${cx} ${cy + b.reachY}` +
    ` L ${b.boxWidth} ${cy + b.reachY}` +
    ` L ${b.boxWidth} 0` +
    ' Z'
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.surface,
    // The page is near-white and so is the card, so the shadow is what
    // separates them. A large rounded rect takes Android elevation cleanly,
    // unlike the bottom bar's pills.
  },
  media: {
    borderRadius: MEDIA_RADIUS,
    overflow: 'hidden',
    backgroundColor: Glass.fill,
    justifyContent: 'flex-end',
  },
  // Positioned against the card, which is flush with the media. The disc sits
  // inside the card's own white cut, so it takes the page's warm off-white
  // rather than the card's white — the one place in the app where `background`
  // is the fill and `surface` is what it sits on, because here the card is the
  // ground. The hairline is what keeps it legible at 26pt, where two shades
  // this close would otherwise read as one.
  badge: {
    position: 'absolute',
    top: BADGE_MARGIN_TOP,
    right: BADGE_MARGIN_RIGHT,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePressed: {
    opacity: 0.65,
  },
  footer: {
    margin: CAPTION_INSET,
    gap: 5,
  },
  name: {
    // Indented to the pills' text rather than their outer edge, so the three
    // lines share one left margin.
    marginLeft: PILL_PADDING_X + 1,
    marginBottom: 1,
    fontSize: 14,
    fontWeight: '700',
    color: PhotoText.color,
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // `alignSelf` is what keeps the pill off the card's full width — it sizes to
  // its own text instead of stretching like its siblings. A true capsule radius
  // rather than the old panel's concentric one, since the width is no longer
  // predictable.
  locationPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    // A near-opaque white panel, painted straight on rather than blurred
    // through. The blur was two extra native views per card and, over a
    // photograph, was never what was carrying the contrast — the fill was.
    // PhotoGlass, not the grey surface: what is behind this is a photograph
    // the theme does not control, so the panel has to bring its own.
    backgroundColor: PhotoGlass.fill,
    paddingHorizontal: PILL_PADDING_X,
    paddingVertical: 5,
  },
  location: {
    // Shrinks rather than flexes: it takes only the width it needs, but still
    // gives way and truncates when the name is longer than the card.
    flexShrink: 1,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  price: {
    marginLeft: PILL_PADDING_X + 1,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accent,
    // Bare on the photo now, so it needs the name's shadow. The orange holds up
    // against the scrim without going white.
    textShadowColor: PhotoText.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
