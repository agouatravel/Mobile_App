import { Easing } from 'react-native-reanimated';

// Every number the assistant's entry animation runs on. One file, so the whole
// transition can be retimed without opening a component.
//
// ── How to adjust the speed ───────────────────────────────────────────────
// Change `SPEED`. Everything below is derived from it, so 1.2 makes the whole
// transition 20% slower and 0.8 makes it 20% faster, with every phase, delay
// and stagger keeping its proportion. Touch the individual durations only when
// you want to change the *shape* of the transition rather than its pace.
export const SPEED = 1;

const ms = (base: number) => Math.round(base * SPEED);

// ── The opening ───────────────────────────────────────────────────────────
// The disc grows out of the button and becomes the assistant's ground, then
// dissolves onto the screen that has mounted behind it. 580 + 200 lands at
// 780ms end to end.
//
// This was cut to 560 to fit a 450-600ms budget and came back as too fast. At
// screen scale that budget is wrong: a disc crossing a whole phone in half a
// second is covering roughly two thousand points, and the eye reads that as a
// flash rather than as a movement it can follow. A small element can move in
// 300ms; something the size of the screen needs closer to 800.
export const EXPAND_MS = ms(580);
export const REVEAL_MS = ms(200);

// Where in the expansion the assistant is pushed.
//
// This has to be the moment the disc has *covered* the screen, and 0.95 is
// that moment rather than a taste: the disc is drawn at SEED points scaled to
// `reach`, which is 2.1x the distance to the furthest corner, so it first
// covers everything at scale = reach / 1.05 — which on the 0.2-to-reach ramp
// the scale runs on lands at grow = 0.95 on any screen size.
//
// It was 0.4, chosen so the content stagger could begin early. That was wrong
// twice over. Nothing outside the disc is painted by the wash, so pushing at
// 0.4 swapped the route while more than half the old screen was still visible
// — the navigator's own transition played in the ring around the disc, which
// is exactly the cut this whole component exists to avoid. And a route push
// mounts a screenful of gradients and an SVG orb, which is the heaviest work
// the app does; putting it in the middle of the expansion made the expansion
// stutter.
//
// Under full cover it costs nothing visible, and the stagger still gets its
// head start: the spring's tail plus the reveal leaves most of half a second
// after this point, which is longer than the cascade takes.
export const PUSH_AT = 0.95;

// ── The closing ───────────────────────────────────────────────────────────
// Shorter than the opening, as a way back always should be. The wash builds
// over the assistant first, then collapses — it does not re-grow from the
// button, which would make the reader sit through the expansion twice.
export const COVER_MS = ms(190);
export const COLLAPSE_MS = ms(340);

// ── Curves ────────────────────────────────────────────────────────────────
// The expansion is a spring, not a curve: `dampingRatio` under 1 lets it pass
// its target and settle back, which is what makes an expansion read as energy
// released rather than as a box being resized.
//
// Only just under, though, and 0.9 rather than the 0.82 it was. Overshoot is
// proportional to the thing overshooting — at 0.82 a screen-sized disc
// visibly wobbles as it lands, which reads as the animation slipping rather
// than settling.
export const EXPAND_SPRING = {
  duration: EXPAND_MS,
  dampingRatio: 0.9,
} as const;

// Symmetrical to the spring's start. A collapse that decelerates the way the
// opening did looks like it is being sucked back in rather than falling over.
export const CLOSE_EASING = Easing.bezier(0.65, 0, 0.35, 1);

// ── The button ────────────────────────────────────────────────────────────
export const PRESS_SCALE = 0.94;
export const PRESS_IN_MS = ms(130);
// The release springs rather than eases: a button that pops back is the one
// piece of the interaction the finger is still touching when it happens.
export const PRESS_OUT_SPRING = { duration: ms(320), dampingRatio: 0.5 } as const;

// ── Content stagger ───────────────────────────────────────────────────────
// Each block fades in and rises this far, one after the next. 12pt is enough
// to read as arrival and short enough that nothing is still moving when the
// eye lands on it.
export const RISE_PX = 12;
export const RISE_MS = ms(340);
export const STAGGER_MS = ms(80);

/** Delay for the nth block in a staggered group. */
export const stagger = (index: number) => index * STAGGER_MS;

// ── Idle orb ──────────────────────────────────────────────────────────────
// The "listening" pulse, over and above the orb's own slow internal drift.
// One breath every 2.5 seconds, which is close to a resting human one — fast
// enough to read as alive, slow enough never to be the thing you are watching.
export const PULSE_MS = ms(2500);
export const PULSE_MIN = 0.95;
export const PULSE_MAX = 1.05;

// ── Reduced motion ────────────────────────────────────────────────────────
// What the whole thing collapses to when the OS asks for less movement: no
// expansion, no growth, no stagger — one short cross-fade. The screen still
// changes, it just stops travelling to get there.
export const REDUCED_MS = 150;
