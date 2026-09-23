import Svg, { Path } from 'react-native-svg';

// The assistant's mark: a four-pointed sparkle with a smaller one off its
// shoulder, drawn rather than borrowed.
//
// It replaces `Ionicons.sparkles`, which is three lumpy stars of near-equal
// weight on a grid built for interface glyphs — legible at 16pt in a list row,
// and mushy at 25pt alone in a 60pt disc, which is the only place this app
// used it. A mark that carries a button has to be drawn for that size.

// Where each arm's control points sit, as a fraction of the arm's length,
// measured from the centre. This is the one number that decides the mark's
// character, and the reason the edges are cubic rather than quadratic: a
// quadratic's control point is shared between two arms, which floors the waist
// at about half the arm length however far in it is pulled — that shape is a
// rounded diamond, not a sparkle. A cubic gives each arm its own control on
// its own axis, so the waist can be pulled to a quarter of the arm and the
// points come out genuinely sharp.
//
// At 0 the arms are needles and the mark reads as a thin cross; at 0.34 the
// waist fills back out into the diamond. 0.16 keeps sharp points with enough
// body at the waist to hold up in white on a saturated ground at 42pt.
const TAPER = 0.16;

// The pair, in a 0-100 box. The large star sits just off centre so the small
// one has somewhere to be — a mark centred in its own box with a satellite
// crammed into the corner looks cropped.
//
// These are positioned so the pair's *ink centroid* lands on the box centre,
// not so their bounding box does. The two differ by about four units here,
// because the large star carries almost all the weight and the small one is
// drawn back at 72% — centring the bounding box left the mark visibly low and
// to the left inside the disc.
//
// They never touch: the diagonal is exactly where both stars are thinnest, so
// the gap is far wider than the distance between their centres suggests.
const LARGE = { cx: 46, cy: 54, r: 40 };
const SMALL = { cx: 83, cy: 19, r: 16 };

// How much the small star is held back when it shares the large one's colour,
// so the pair reads as one mark with a highlight rather than as two stars of
// equal standing. A star given its own `accent` is drawn at full strength
// instead — it is already distinct, and dimming it as well would leave it
// looking like a mistake rather than a second colour.
const SMALL_OPACITY = 0.72;

// One arm's tip to the next, bending inward through two control points that
// sit on the axes the arms themselves run along.
function star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const k = r * TAPER;

  return (
    `M ${cx} ${cy - r}` +
    ` C ${cx} ${cy - k} ${cx + k} ${cy} ${cx + r} ${cy}` +
    ` C ${cx + k} ${cy} ${cx} ${cy + k} ${cx} ${cy + r}` +
    ` C ${cx} ${cy + k} ${cx - k} ${cy} ${cx - r} ${cy}` +
    ` C ${cx - k} ${cy} ${cx} ${cy - k} ${cx} ${cy - r}` +
    ' Z'
  );
}

export function AiMark({
  size,
  color,
  accent,
}: {
  size: number;
  color: string;
  /** Colour for the companion star. Defaults to a dimmed `color`. */
  accent?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={star(LARGE)} fill={color} />
      <Path
        d={star(SMALL)}
        fill={accent ?? color}
        opacity={accent ? 1 : SMALL_OPACITY}
      />
    </Svg>
  );
}
