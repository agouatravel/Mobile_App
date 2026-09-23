import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAiTransition } from '@/components/ai/ai-transition';
import { AiInput } from '@/components/ai/ai-input';
import { AiGround } from '@/components/ai/ai-ground';
import { AiOrb } from '@/components/ai/ai-orb';
import { AiTripDeck } from '@/components/ai/ai-trip-deck';
import { REDUCED_MS, RISE_MS, RISE_PX, stagger } from '@/constants/ai-motion';
import { CATALOGUE_SIZE } from '@/constants/search';
import { AiSuggestionChip } from '@/components/ai/ai-suggestion-chip';
import { useAuth } from '@/components/account/auth-provider';
import {
  AI_SUGGESTIONS,
  ASSISTANT_LATENCY,
  askAssistant,
  type AssistantReply,
} from '@/constants/assistant';
import type { SearchHit } from '@/constants/search';
import { Ai, Colors } from '@/constants/theme';

// The orb at rest, and once an answer has taken the space. Sized off the screen
// rather than fixed, so it is the same presence on a small phone as on a large
// one instead of a disc that dominates one and gets lost on the other.
const ORB_FRACTION = 0.46;
const ORB_MIN = 150;
const ORB_MAX = 260;
const ORB_ANSWERED = 76;

type Asked = { question: string; reply: AssistantReply } | null;

export default function AiTravelAssistant() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { exit } = useAiTransition();
  const { account } = useAuth();

  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState<Asked>(null);
  const [chip, setChip] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  // Only ever raised by trying to do something a guest cannot, never shown on
  // arrival: an assistant that opens by asking you to sign in is a gate with a
  // conversation behind it, which is the opposite of what this screen is for.
  const [signInPrompt, setSignInPrompt] = useState(false);

  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (pending.current) clearTimeout(pending.current);
  }, []);

  const orbSize = Math.min(ORB_MAX, Math.max(ORB_MIN, Math.round(width * ORB_FRACTION)));

  function ask(question: string, fromChip?: string) {
    const text = question.trim();
    if (text.length === 0 || thinking) return;

    setChip(fromChip ?? null);
    setDraft('');
    setThinking(true);
    setSignInPrompt(false);

    pending.current = setTimeout(() => {
      setAsked({ question: text, reply: askAssistant(text) });
      setThinking(false);
      pending.current = null;
    }, ASSISTANT_LATENCY);
  }

  function reset() {
    if (pending.current) clearTimeout(pending.current);
    setAsked(null);
    setChip(null);
    setThinking(false);
    setSignInPrompt(false);
  }

  const answered = asked !== null || thinking;

  // The screen's arrival, block by block.
  //
  // This screen is mounted partway through the transition's expansion — see
  // PUSH_AT — so these begin under the still-growing wash and are already
  // moving by the time it dissolves. That is the point: the content is not
  // waiting for the transition to finish, it is the second half of it.
  //
  // Reduced motion drops the travel and keeps a plain cross-fade, so the
  // hierarchy still reads in order without anything sliding.
  const rise = (index: number) =>
    reduced
      ? FadeIn.duration(REDUCED_MS)
      : FadeInDown.duration(RISE_MS)
          .delay(stagger(index))
          // FadeInDown travels 25px by default, which at this stagger reads as
          // the screen assembling itself. 12 is arrival, not assembly.
          .withInitialValues({ transform: [{ translateY: RISE_PX }] });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <AiGround />

      {/* The orb, before anything has been asked: set behind the heading and
          run off the right edge, so it is the light in the corner of the room
          rather than an object in the middle of the page. It comes forward and
          centres once there is an answer, which is when it has a job. */}
      {answered ? null : (
        <View
          pointerEvents="none"
          style={[styles.ambient, { top: insets.top + 6, right: -orbSize * 0.36 }]}>
          <AiOrb size={orbSize} />
        </View>
      )}

      {/* The wordmark holds the left and the controls stack down the right
          rather than sitting beside it. A row would put the close button level
          with the name and read as a title bar; a column reads as tools kept
          out of the way of the page. */}
      <View style={[styles.chrome, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <Text style={styles.wordmark}>AGOUA AI</Text>

        <View style={styles.tools}>
          <Pressable
            onPress={exit}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close the assistant"
            style={({ pressed }) => [styles.tool, pressed && styles.pressed]}>
            <Ionicons name="close" size={20} color={Ai.text} />
          </Pressable>

          {answered ? (
            <Pressable
              onPress={reset}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Start again"
              style={({ pressed }) => [styles.tool, pressed && styles.pressed]}>
              <Ionicons name="refresh" size={19} color={Ai.text} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          // Only while the rail is on screen. Pointing this at an index that
          // does not exist in the answered state would pin whatever happened
          // to be third instead.
          stickyHeaderIndices={answered ? undefined : [2]}
          keyboardShouldPersistTaps="handled">
          {/* These four are separate children of the ScrollView rather than one
              fragment, because `stickyHeaderIndices` counts children and a
              fragment is one of them. Null entries are stripped before the
              count, and every conditional below this point resolves to null in
              the state where the rail is shown — so the rail is index 2
              whenever it exists. */}
          {/* Two lines and two voices: the verb set heavy and upright, the
                object set light and sloped. One display size, so the pair
                reads as a single phrase rather than as a heading with a
                subheading under it. */}
          {answered ? null : (
            <Animated.View entering={rise(0)} style={styles.opening}>
              <View style={styles.headingLine}>
                <Text style={styles.heading}>Plan</Text>
                <View style={styles.withAi}>
                  <Text style={styles.withAiText}>With AI</Text>
                </View>
              </View>
              <Text style={[styles.heading, styles.headingSoft]}>Your Journey</Text>
            </Animated.View>
          )}

          {/* What the assistant can actually reach, stated before it is
                asked anything. The number is counted off the search index
                rather than written down — add a destination to the app and
                it goes up on its own — because a headline figure nobody can
                trace is the fastest way to make a screen feel like a mock. */}
          {answered ? null : (
            <Animated.View entering={rise(1)} style={styles.stats}>
              <Text style={styles.statValue}>{CATALOGUE_SIZE}</Text>

              <View style={styles.statLines}>
                <Text style={styles.statLine}>
                  Places <Text style={styles.statStrong}>ready to search</Text>
                </Text>
                <Text style={styles.statLine}>
                  Across <Text style={styles.statStrong}>destinations, stays and services</Text>
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Moved up from the foot, where it sat above the input. The
                suggestions are where a reader starts, not what they reach
                for last — and the foot is the field alone now. */}
          {answered ? null : (
            <Animated.View entering={rise(2)} style={styles.railSlot}>
              {/* The rail pins to the top of the scroll, so the categories
                  stay reachable while the deck moves under them. It needs a
                  ground of its own for that: without one, cards would pass
                  visibly between the pills. A gradient rather than a fill —
                  at rest the transparent foot lets the screen's own light
                  through, and in motion content fades out under the rail
                  instead of meeting a hard edge. */}
              <LinearGradient
                colors={[`${Ai.base}F2`, `${Ai.base}F2`, `${Ai.base}00`]}
                locations={[0, 0.62, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.chipRail}
                contentContainerStyle={styles.chips}>
                {AI_SUGGESTIONS.map((suggestion) => (
                  <AiSuggestionChip
                    key={suggestion.key}
                    label={suggestion.label}
                    active={chip === suggestion.key}
                    onPress={() => ask(suggestion.prompt, suggestion.key)}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {answered ? null : (
            <Animated.View entering={rise(3)} style={styles.hero}>
              <AiTripDeck />
            </Animated.View>
          )}

          {answered ? (
            <View style={[styles.stage, styles.stageAnswered]}>
              <AiOrb size={ORB_ANSWERED} />
            </View>
          ) : null}

          {asked ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.answer}>
              <Text style={styles.question}>{asked.question}</Text>

              <View style={styles.card}>
                <Text style={styles.cardText}>{asked.reply.text}</Text>

                {asked.reply.links.map((hit) => (
                  <ResultRow key={hit.key} hit={hit} onPress={() => router.push(hit.href)} />
                ))}

                <Pressable
                  onPress={() => {
                    // Signed in this would save the trip. Signed out it is the
                    // one thing on the screen a guest cannot finish, so it is
                    // also the only place the sign-in line is allowed to appear.
                    if (account) return;
                    setSignInPrompt(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Save this trip"
                  style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
                  <Ionicons name="bookmark-outline" size={15} color={Ai.onSurface} />
                  <Text style={styles.saveText}>Save this trip</Text>
                </Pressable>
              </View>

              {signInPrompt ? (
                <Animated.View entering={FadeIn.duration(220)} style={styles.gate}>
                  <Text style={styles.gateText}>
                    Sign in to save your trip and access your bookings.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/login')}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in"
                    style={({ pressed }) => [styles.gateCta, pressed && styles.pressed]}>
                    <Text style={styles.gateCtaText}>Sign In</Text>
                  </Pressable>
                </Animated.View>
              ) : null}
            </Animated.View>
          ) : null}

          {thinking ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.working}>
              <Text style={styles.workingText}>Looking through Agoua…</Text>
            </Animated.View>
          ) : null}
        </ScrollView>

        <Animated.View
          entering={rise(4)}
          style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <AiInput
            value={draft}
            onChangeText={setDraft}
            onSubmit={() => ask(draft)}
            busy={thinking}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// One place in the app the answer points at. A light row on the light card, so
// the whole answer reads as one object rather than as a panel with a list
// bolted underneath it.
function ResultRow({ hit, onPress }: { hit: SearchHit; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hit.title}, ${hit.subtitle}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.rowIcon}>
        <Ionicons name={hit.icon} size={15} color={Ai.onSurface} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {hit.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {hit.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Ai.base,
  },
  chrome: {
    flexDirection: 'row',
    // Top, not centre: the tools are a column and the wordmark is one line, so
    // centring would drop the name half way down beside them.
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  wordmark: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: Ai.text,
    paddingTop: 11,
  },
  tools: {
    gap: 10,
  },
  // Glass rather than a fill: these are the only controls on a screen that is
  // otherwise all atmosphere, and solid buttons here would read as chrome
  // borrowed from another page.
  tool: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Ai.surface,
    borderWidth: 1,
    borderColor: Ai.border,
  },
  // The orb before anything is asked. Absolute, so it costs the page no
  // layout and the content scrolls over it; behind everything, so it is light
  // rather than an object.
  ambient: {
    position: 'absolute',
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  opening: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 2,
  },
  headingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // The accent's one appearance in the type on this screen, and the only place
  // on it the orange is a fill. Ink on the orange rather than white: at this
  // size the chip is a small solid shape, and white on #FF8A00 is the weakest
  // pairing the palette has.
  withAi: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.accent,
  },
  withAiText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.foreground,
  },
  // The figure and its two lines, set on one baseline. `alignItems: flex-end`
  // rather than centre: the numeral is four times the height of the text
  // beside it, and centring left the small lines floating in the middle of it
  // instead of sitting on the same line as its foot.
  stats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    paddingTop: 22,
  },
  // The lit blue, not the accent. Orange is already spoken for twice at the
  // head of this screen — the "With AI" chip and the card's location — and a
  // third would stop it meaning anything. This also puts a cool mark at the
  // top-left against the warm bloom at the top-right, which is the ground's
  // own arrangement repeated in the type.
  statValue: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: Ai.orbDeepLit,
  },
  statLines: {
    flexShrink: 1,
    paddingBottom: 3,
    gap: 1,
  },
  statLine: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Ai.textMuted,
  },
  statStrong: {
    fontWeight: '700',
    color: Ai.textSecondary,
  },
  // Full-bleed, so the rail's scrim reaches the screen's edges rather than
  // stopping at the content margin and leaving two lit strips beside it. The
  // chips keep their own inset through `chips`.
  railSlot: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  hero: {
    paddingTop: 10,
  },
  // The app's display size, not a size of its own. This was 38 against Home's
  // 34 — two screens each claiming to hold the largest type in the app.
  heading: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    color: Ai.text,
    letterSpacing: -1,
  },
  // The second line of the pair: same size, light and sloped. Weight and slope
  // are what separate the two lines, not scale — dropping the size as well
  // would make it a subheading, and it is half of one phrase.
  headingSoft: {
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: -0.4,
    color: Ai.textSecondary,
  },

  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  stageAnswered: {
    paddingVertical: 4,
  },

  answer: {
    gap: 12,
  },
  question: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    color: Ai.text,
  },
  // The one light surface in the body. Deep blue on white is the pairing the
  // rest of the app is set in, so an answer reads as Agoua speaking rather than
  // as a panel the AI screen invented.
  card: {
    borderRadius: 26,
    backgroundColor: Ai.chipSurface,
    padding: 18,
    gap: 12,
  },
  // Ink, and explicitly `Colors.foreground` rather than `Ai.text` — this is
  // drawn on the card, not on the ground, and `Ai.text` is the white that
  // belongs on the colour. Following it here would set white type on a white
  // card. Every rule on this screen depends on what is directly behind the
  // thing being drawn, and the card is its own surface.
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.foreground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Ai.chipBorder,
  },
  rowPressed: {
    backgroundColor: Colors.surfaceSunken,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSunken,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingVertical: 4,
  },
  saveText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Ai.onSurface,
  },
  // Quiet, and beside the thing it is about rather than across the screen. A
  // guest is not being asked to sign in to carry on — only to keep this.
  gate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: Ai.surface,
    borderWidth: 1,
    borderColor: Ai.border,
  },
  gateText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    color: Ai.textSecondary,
  },
  gateCta: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: Colors.primary,
  },
  gateCtaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },

  working: {
    paddingTop: 6,
    alignItems: 'center',
  },
  workingText: {
    fontSize: 13.5,
    color: Ai.textMuted,
  },

  foot: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // Pulled out to the screen's edges and padded on the content instead, so the
  // last chip scrolls off the edge rather than stopping against a margin — the
  // row has to look like it continues, because it does.
  chipRail: {
    marginHorizontal: -20,
  },
  chips: {
    gap: 9,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
