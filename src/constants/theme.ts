// Named color tokens — mirrors the `--primary` / `--secondary` / etc. CSS
// variables in global.css, exposed as raw values for native style props
// (shadowColor, BlurView tint, etc.) that can't consume Tailwind classes.
// Never hardcode these hex/rgba values inline in a component — import them
// from here instead.
//
// ── Quiet Luxury ─────────────────────────────────────────────────────────
// Editorial travel rather than travel agency: the imagery does the visual
// work and the interface stays quiet behind it. Four rules:
//
//   1. 70 / 20 / 10. Seventy per cent of any screen is neutral, twenty is the
//      blue, ten is the orange. If a screen reads as a colour, it is wrong.
//   2. The ground is a warm off-white and a surface is pure white — a sheet of
//      paper on a desk, not a grey box on a white page.
//   3. Separation is a hairline and a whisper of a shadow. Never a heavy edge,
//      never a coloured glow, never a blur.
//   4. Type is a blue-black, actions are the blue, and orange is reserved for
//      the few things that must be found before they are read.
//
// Most of the token names outlived two theme changes deliberately: 43 files
// import them, and repointing the values is what lets the palette turn over
// without touching each one. Where a name now says something the value no
// longer does (`Glass`, `PrimaryGlow`), the comment says so rather than the
// rename rippling through every call site.

export const Colors = {
  // Actions. Deep blue carries every button, active state and control — but it
  // is the 20 in a 70/20/10 split, not the app's dominant colour. Most of any
  // screen is the neutrals below.
  primary: '#0B527A',
  primaryForeground: '#FFFFFF',
  // The same blue. Secondary actions differ from primary ones by their
  // surface, not their hue.
  secondary: '#0B527A',
  secondaryForeground: '#FFFFFF',
  // The 10. Prices, the saved heart, and the one CTA on a screen that has to
  // be found before it is read. Never a surface, never chrome, never a whole
  // bar — the moment orange becomes structural the app stops reading premium.
  accent: '#FF8A00',
  // The 70. A warm off-white, not pure white: the surfaces are pure white, and
  // they need a ground fractionally below them to sit on. Pure white for both
  // would flatten the card layer out of existence and force the borders and
  // shadows to carry it alone.
  background: '#F7F7F5',
  // Cards and sheets. White, and the inverse of the arrangement this replaced
  // — grey cards on a white page reads as a wireframe; white cards on a warm
  // ground reads as paper.
  surface: '#FFFFFF',
  // A surface that has to sit on another surface. Warm, so it stays in the
  // ground's family rather than introducing a cool grey.
  surfaceSunken: '#F0F0EE',
  // Headings and body copy. A blue-black rather than a neutral one — it sits
  // in the same family as the action colour, which is what keeps a page of
  // type and a blue button reading as one palette.
  foreground: '#101820',
  onLight: '#101820',
  // Supporting text: captions, straplines, metadata, inactive glyphs. A real
  // hex rather than an alpha of the ink, so it holds the same value on white
  // cards and on the warm ground alike.
  textSecondary: '#6B7378',
  // A step below that, for placeholders and text that is present but not being
  // offered — an unsaved heart, a disabled control.
  textMuted: '#9AA1A6',
  // The hairline. Every card, field, bar and divider draws this and nothing
  // heavier; it is what lets the shadows stay as light as they are.
  divider: '#E7E8E6',
} as const;

// The page, and nothing else. `from` and `to` were the two ends of a mesh wash
// that used to run behind every header; all three are the warm ground now, so
// the background renders as a flat sheet even if something still reaches for
// them. AuroraBackground no longer draws anything but `base`.
export const Backdrop = {
  from: Colors.background,
  to: Colors.background,
  base: Colors.background,
} as const;

// Surfaces. The name is a fossil — there is no glass left in the app, no blur
// and no translucency. What the 43 files importing this get is the white card
// fill and the hairline, which is how the borders came back onto every card
// without editing each one: the `borderWidth: 1` rules never left.
export const Glass = {
  fill: Colors.surface,
  border: Colors.divider,
  secondaryFill: Colors.surfaceSunken,
  secondaryBorder: Colors.divider,
  // Neutral and nearly nothing. The lift is a hint that a card is a separate
  // sheet, not a claim that it floats — the border and the ground's warmth are
  // what actually separate it. A brand-tinted shadow is what made the old
  // theme look busy at rest.
  shadowColor: '#101820',
} as const;

// The lift. Written as `boxShadow` strings rather than the `shadowOpacity` /
// `elevation` pair, for two reasons: that pair renders Android's shadow from
// the view's square bounds, which reads as a rectangle behind anything round,
// and `elevation` cannot be tinted or softened past what the platform gives.
//
// Two layers each — a tight contact shadow and a wide soft one. A single blur
// at this opacity reads as a grey smear; the pair reads as a sheet resting on
// a surface, which is the whole claim being made. Both are the ink at very low
// alpha, so nothing in the app glows in a brand colour any more.
export const Lift = {
  // Cards and sheets. Deliberately at the threshold of visible — the hairline
  // and the ground's warmth are what separate a card, and this only says which
  // of the two layers is on top.
  card: '0px 1px 2px rgba(16, 24, 32, 0.04), 0px 4px 14px rgba(16, 24, 32, 0.06)',
  // The bottom bar, which genuinely floats over scrolling content and is the
  // one thing in the app allowed to say so.
  bar: '0px 2px 6px rgba(16, 24, 32, 0.05), 0px 10px 28px rgba(16, 24, 32, 0.10)',
} as const;

// Was a lit orange gradient for compact CTAs. Buttons are a flat blue fill
// now — a gradient is exactly the kind of decoration this theme spends
// nothing on — so both stops are the action colour and the ramp is flat.
export const PrimaryGradient = {
  from: Colors.primary,
  to: Colors.primary,
} as const;

// Was the orange glow under the primary button and its glyphs. Nothing glows
// in this theme; the token survives transparent so the shadow props that
// reference it draw nothing.
export const PrimaryGlow = {
  shadowColor: 'transparent',
  textShadow: 'transparent',
} as const;

// Type and chrome laid over photography — the one place translucency is still
// doing real work, because a photograph is not a surface this theme controls.
// A caption on an unpredictable image has to carry its own contrast, so this
// stays a near-opaque white panel rather than becoming the grey fill.
export const PhotoGlass = {
  fill: 'rgba(255, 255, 255, 0.86)',
  border: 'transparent',
} as const;

// Type set straight onto a photograph with no panel behind it. White alone does
// not survive a bright frame, so the shadow — not the fill — is what holds the
// letterforms together. Pair it with a scrim; this is not enough on its own.
export const PhotoText = {
  color: '#FFFFFF',
  shadow: 'rgba(10, 10, 10, 0.55)',
} as const;

// The navbar sits on the ground and is meant to disappear into it — a title in
// the ink, on the warm off-white, with nothing behind it. `edge` is there for
// a screen that needs the header separated from content scrolling under it.
export const NavGlass = {
  tint: 'transparent',
  edge: Colors.divider,
} as const;

// The bottom bar's own tokens, kept in step with TabBar below.
export const BarGlass = {
  fill: Colors.surface,
  border: Colors.divider,
  activeFill: Colors.primary,
  activeBorder: Colors.primary,
} as const;

// The floating pill bar at the foot of the app.
//
// A white capsule on the warm ground, holding grey glyphs, with the selected
// tab a blue pill writing back in white. The bar itself is furniture and stays
// neutral; the blue appears on exactly one tab at a time, which is the whole
// of its selected state.
export const TabBar = {
  // White, with a hairline. The bar was a solid blue capsule; a filled bar is
  // a lot of the app's 20% spent on furniture that is present on every screen,
  // and it fought the photography above it. Inverting it puts the blue on the
  // one tab that is actually selected.
  surface: Colors.surface,
  border: Colors.divider,
  // The selected pill, and the only colour down here.
  activeFill: Colors.primary,
  activeContent: '#FFFFFF',
  // An unselected glyph. Supporting-text grey, so the bar reads as quiet
  // until you look at it.
  icon: Colors.textSecondary,
  shadow: '#101820',
} as const;

// The AI assistant.
//
// The one dark room in the app, and the only screen that inverts. Everywhere
// else is the warm off-white ground with white cards on it; this is a near
// black field with the brand's two colours bloomed into opposite corners —
// warm behind the orb at the head, cool at the foot.
//
// It has been three things now: a cool blue-black room, a near-white page, and
// this. The white page was the mistake: the assistant is reached through an
// animation made of colour, and landing that on the same ground as every other
// screen threw away the one moment the app has to feel like it went somewhere.
// Dark with coloured light keeps the arrival and still reads as Agoua, because
// the light is the brand's own orange and blue and nothing else.
//
// Everything laid on the dark is white or translucent white; everything laid
// on *those* surfaces goes back to the app's ink. Two levels, and the rule
// only ever depends on what is directly behind the thing being drawn.
export const Ai = {
  // The field. A blue-black rather than a neutral one — it is the app's ink
  // taken down, so the dark belongs to the same family as the type on every
  // other screen rather than being a black introduced for this one.
  base: '#0B1016',
  // The head of the field, fractionally lifted, so the ground has a top and a
  // bottom rather than being one flat sheet.
  dusk: '#111922',
  // The foot, deepest of the three. The input sits here as a white pill, and
  // the darker the ground under it the more it reads as lit.
  olive: '#080C11',

  // Chrome laid directly on the dark: the tool buttons, the glass chips, the
  // facts on the card. Translucent white, so each takes a tint from whichever
  // bloom it happens to sit over instead of being a flat grey.
  surface: 'rgba(255, 255, 255, 0.10)',
  surfaceStrong: 'rgba(255, 255, 255, 0.16)',
  border: 'rgba(255, 255, 255, 0.18)',

  // Type on the dark.
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // The solid white cards and chips, and what is written on them — the app's
  // own surfaces, unchanged. An answer card here is the same object an offer
  // card is on Home.
  onSurface: Colors.primary,
  chipBorder: 'transparent',
  chipSurface: Colors.surface,

  // The orb, the blooms in the ground, and the wash that becomes them: the
  // app's two brand colours and nothing else. `orbDeepLit` is the blue with
  // the lights on — #0B527A is very nearly the luminance of this ground and
  // disappears into it, which is the whole reason the lit value exists.
  orbWarm: Colors.accent,
  orbDeep: Colors.primary,
  orbDeepLit: '#1279AC',
} as const;
