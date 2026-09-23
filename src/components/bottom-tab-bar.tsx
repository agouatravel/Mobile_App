import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/account/auth-provider';
import { AI_BUTTON_SIZE, AiButton } from '@/components/ai/ai-button';
import { isBareRoute, TAB_ITEMS, type TabItem } from '@/constants/nav';
import { Lift, TabBar } from '@/constants/theme';

const BAR_H = 52;

// The assistant sits in the bar's row rather than floating over the page above
// it. It was docked to Home's bottom-right corner, which meant it existed on
// exactly one screen and overlapped whatever was scrolling under it; as part
// of the bar it is reachable everywhere and belongs to the navigation rather
// than to the page.
//
// The circle overhangs the capsule by a few points top and bottom. That is
// what keeps it from reading as a fifth tab: same row, deliberately not the
// same object.
const AI_GAP = 12;
const ROW_H = Math.max(BAR_H, AI_BUTTON_SIZE);
// The bar is a floating capsule now rather than a sheet anchored to the screen
// edge, so it needs a gutter on all four sides.
const SIDE_MARGIN = 20;
const BOTTOM_GAP = 12;
// Inner padding, which is also the gap between the capsule's edge and the
// selected pill inside it.
const BAR_PAD = 5;
const ITEM_H = BAR_H - BAR_PAD * 2;

const ICON_SIZE = 20;

// An unselected tab is one glyph, so this is a touch target rather than a
// measurement — wide enough for a thumb, tight enough that four of them do not
// drift apart across the bar.
const ITEM_W = 46;

// The selected pill is sized from its contents rather than by padding on the
// item, because the item's width is animated and a `paddingHorizontal` that
// outgrew the idle width would fight the animation for the same pixels.
const PILL_PAD_H = 13;
const LABEL_GAP = 7;

// Until a label has been measured its width is guessed from its length, so the
// pill opens at very nearly the right size on the first frame rather than
// snapping wider once the measurement lands. The correction, when it comes, is
// a couple of points and rides the same spring.
const FALLBACK_CHAR_W = 8;

// The spring the pill rides — the same one the segmented control uses, so the
// two selection affordances in the app move with one hand. Slightly overdamped
// on purpose: a bar that overshoots and settles reads as a toy, and a pure
// timing curve reads as a screenshot changing.
const SPRING = { damping: 20, stiffness: 210, mass: 0.7 };

// Colour and opacity ride a curve rather than the spring. A spring spends its
// tail invisibly on a fade — the last few percent of an opacity change is not
// something the eye can watch settle — so it only makes the cross-fade feel
// late against the movement it is supposed to accompany.
const FADE_IN = { duration: 200 };
const FADE_OUT = { duration: 140 };

// A fully transparent copy of the bar's own fill, not the `transparent`
// keyword. Interpolating a colour to the keyword takes it through transparent
// black, which smudges the pill grey on its way out.
const CLEAR = 'rgba(255, 255, 255, 0)';

// Pages cannot see the safe-area inset at module scope, and the bar sits on
// top of it, so the export has to allow for the tallest one — a home
// indicator. On a device without one this leaves a little extra room at the
// foot of a scroll, which costs nothing.
const MAX_BOTTOM_INSET = 34;
const CLEARANCE = 16;

// Bottom padding a scrolling page needs so its last row clears the bar.
export const TAB_BAR_CONTENT_INSET = ROW_H + BOTTOM_GAP + MAX_BOTTOM_INSET + CLEARANCE;

// How much of the screen's foot the floating pill actually covers, above the
// safe-area inset. A screen pinning its own bar over the content needs this
// rather than TAB_BAR_CONTENT_INSET: that one budgets scroll padding and
// includes clearance and a worst-case inset, so anchoring to it leaves a band
// of scrolling content visible between the two bars.
export const TAB_BAR_OVERLAY_HEIGHT = ROW_H + BOTTOM_GAP;

type TabRoute = { key: string; name: string };

type BottomTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: { emit: (event: TabPressEvent) => { defaultPrevented: boolean }; navigate: (name: string) => void };
};

type TabPressEvent = { type: 'tabPress'; target: string; canPreventDefault: true };

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();

  // Natural width of each label, by tab name, taken from the hidden row at the
  // foot of this component. The pill cannot animate to a width nobody has
  // measured, and a label's width is a font-metrics question — it depends on
  // which family actually loaded and on the reader's text-size setting,
  // neither of which is knowable from here.
  const [labelWidths, setLabelWidths] = useState<Record<string, number>>({});

  // Driven by TAB_ITEMS order, not the navigator's: expo-router derives its
  // route order from the filesystem, so walking `state.routes` would ignore
  // how TAB_ITEMS is arranged. Routes with no config (a pushed detail screen)
  // fall out here, so index maths must run against this list.
  const tabs = TAB_ITEMS.map((config) => {
    const routeIndex = state.routes.findIndex((route) => route.name === config.name);
    return routeIndex === -1 ? null : { route: state.routes[routeIndex], routeIndex, config };
  }).filter((tab): tab is { route: TabRoute; routeIndex: number; config: TabItem } => tab !== null);

  // Routes that are not tabs (a pushed detail screen, say) are still part of
  // this navigator, so state.index can point outside `tabs`. Hold the pill on
  // the tab it came from rather than letting it collapse back to the first.
  const matchedSlot = tabs.findIndex((tab) => tab.routeIndex === state.index);
  const [lastSlot, setLastSlot] = useState(0);
  // Adjusted during render rather than in an effect: React re-runs this
  // component immediately with the new value and never commits the stale one,
  // where an effect would paint the wrong tab first and correct it after.
  if (matchedSlot >= 0 && matchedSlot !== lastSlot) setLastSlot(matchedSlot);
  const activeSlot = matchedSlot >= 0 ? matchedSlot : lastSlot;

  // After the hooks above, never before: the auth screens are siblings in this
  // navigator like any other, so the bar re-renders as they come and go and an
  // early return over a hook would change the hook order between those
  // renders. `lastSlot` is also still worth updating on the way through —
  // it is what puts the pill back on the tab you left from.
  if (isBareRoute(state.routes[state.index].name)) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: insets.bottom + BOTTOM_GAP }]}>
      <View style={styles.row}>
        {/* Two views, not one. The clip below and the shadow have to live on
            separate layers: on iOS `overflow: hidden` sets masksToBounds,
            which clips the layer's own shadow away along with its children. */}
        <View style={styles.lift}>
          <View style={styles.bar}>
            {tabs.map((tab, index) => (
              <TabButton
                key={tab.route.key}
                config={tab.config}
                selected={index === activeSlot}
                labelWidth={
                  labelWidths[tab.config.name] ?? tab.config.label.length * FALLBACK_CHAR_W
                }
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: tab.route.key,
                    canPreventDefault: true,
                  });
                  if (index !== activeSlot && !event.defaultPrevented) {
                    // Signed out, the Account tab goes straight to /login
                    // rather than to /account, which would only bounce off its
                    // own redirect. That bounce is not just untidy: /account
                    // stays in the back history behind /login, so back popped
                    // to it, it redirected forward again, and the button
                    // looked dead. Going direct keeps a screen nobody can use
                    // out of the history entirely, and back then returns to
                    // the tab you were actually on.
                    const target =
                      tab.config.name === 'account' && !account ? 'login' : tab.route.name;
                    navigation.navigate(target);
                  }
                }}
              />
            ))}
          </View>
        </View>

        {/* Outside the capsule, not in it. It is not a destination — it opens
            a mode over whatever you are looking at — so it does not take a
            slot, does not get a selected state, and does not move the pill. */}
        <AiButton />
      </View>

      {/* The ruler: every label laid out at its natural width, off the visible
          bar and out of the accessibility tree, purely so each pill knows how
          wide to open. It sits out here rather than inside the capsule because
          the capsule is sized by its own contents — measuring in there would
          ask the layout a question whose answer depended on the measurement. */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.ruler}>
        {tabs.map((tab) => (
          <Text
            key={tab.config.name}
            style={[styles.label, styles.rulerLabel]}
            onLayout={(event: LayoutChangeEvent) => {
              const width = Math.ceil(event.nativeEvent.layout.width);
              setLabelWidths((current) =>
                current[tab.config.name] === width
                  ? current
                  : { ...current, [tab.config.name]: width },
              );
            }}>
            {tab.config.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TabButton({
  config,
  selected,
  labelWidth,
  onPress,
}: {
  config: TabItem;
  selected: boolean;
  labelWidth: number;
  onPress: () => void;
}) {
  // Reanimated evaluates an animated style the moment it is created and takes
  // that first result as the starting value without animating to it, so a tab
  // that mounts already selected is simply drawn open — no pill unfurling
  // itself as the bar appears. Every later change to `selected` or
  // `labelWidth` re-runs the worklet, and those do animate.
  const pill = useAnimatedStyle(() => ({
    width: withSpring(
      selected ? PILL_PAD_H * 2 + ICON_SIZE + LABEL_GAP + labelWidth : ITEM_W,
      SPRING,
    ),
    backgroundColor: withTiming(
      selected ? TabBar.activeFill : CLEAR,
      selected ? FADE_IN : FADE_OUT,
    ),
  }));

  // The label's clip rides the same spring as the pill around it, so the two
  // edges travel together and the text is never left hanging outside the white.
  const reveal = useAnimatedStyle(() => ({
    width: withSpring(selected ? LABEL_GAP + labelWidth : 0, SPRING),
    opacity: withTiming(selected ? 1 : 0, selected ? FADE_IN : FADE_OUT),
  }));

  const idleGlyph = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 0 : 1, selected ? FADE_IN : FADE_OUT),
  }));

  const activeGlyph = useAnimatedStyle(() => ({
    opacity: withTiming(selected ? 1 : 0, selected ? FADE_IN : FADE_OUT),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ selected }}>
      <Animated.View style={[styles.item, pill]}>
        {/* Outline in both states. The blue pill is what says "selected"
            here; switching to the filled glyph as well would be the same thing
            said twice, and the filled house reads heavy beside its own label.
            Two copies of the one glyph, cross-fading, because Ionicons takes a
            colour string and a string cannot be animated — the swap would
            otherwise land in a single frame while everything around it is
            still moving. */}
        <View style={styles.glyph}>
          <Animated.View style={[styles.glyphLayer, idleGlyph]}>
            <Ionicons name={config.iconOutline} size={ICON_SIZE} color={TabBar.icon} />
          </Animated.View>
          <Animated.View style={[styles.glyphLayer, activeGlyph]}>
            <Ionicons name={config.iconOutline} size={ICON_SIZE} color={TabBar.activeContent} />
          </Animated.View>
        </View>

        {/* Always mounted, and revealed by a clip that opens from the left, so
            the name is written on rather than dropped in. Mounting the Text on
            selection instead would put a text layout in the same frame as the
            width change, which is what made the old bar jump. */}
        <Animated.View style={[styles.reveal, reveal]}>
          <Text numberOfLines={1} style={[styles.label, { width: labelWidth }]}>
            {config.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIDE_MARGIN,
    // The row is sized by its contents and centred in what is left, rather
    // than stretched across the screen. Stretching is what forced the gaps
    // between the icons wide open — there was leftover width and nothing to do
    // with it but share it out between them.
    alignItems: 'center',
  },
  // Capsule and assistant, level with each other.
  row: {
    maxWidth: '100%',
    height: ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AI_GAP,
  },
  // Carries the shadow only. No fill of its own — the capsule below paints it.
  // Two views, because on iOS `overflow: hidden` on the capsule would clip its
  // own shadow away along with its children.
  lift: {
    borderRadius: BAR_H / 2,
    boxShadow: Lift.bar,
    // Gives way before the assistant does. On a narrow screen the capsule
    // squeezes its own tabs — it already clips — rather than pushing a 60pt
    // circle off the edge of the display.
    flexShrink: 1,
  },
  bar: {
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    padding: BAR_PAD,
    borderRadius: BAR_H / 2,
    backgroundColor: TabBar.surface,
    borderWidth: 1,
    borderColor: TabBar.border,
    // Nothing may render outside the capsule. The row cannot overflow it any
    // more, but a clip here means a future fifth tab, or a longer label in
    // another language, degrades into a squeeze rather than into a tab that
    // has left the screen.
    overflow: 'hidden',
  },
  // The width is animated, so no static rule here may set one: a flex rule
  // that resolved to a width would be reapplied on every re-render and stamp
  // on whatever value the spring is currently holding.
  item: {
    height: ITEM_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ITEM_H / 2,
    overflow: 'hidden',
  },
  glyph: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  glyphLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Opens from the left, so the name reads on head-first rather than sliding
  // in tail-first from under the pill's right edge.
  reveal: {
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: LABEL_GAP,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: TabBar.activeContent,
  },
  // The hidden ruler. Absolute, so it costs the wrapper no layout, and
  // unshrinkable, so the four labels report their natural widths rather than
  // being squeezed into sharing a row.
  ruler: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    opacity: 0,
  },
  rulerLabel: {
    flexShrink: 0,
  },
});
