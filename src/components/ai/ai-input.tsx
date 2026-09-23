import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AiMark } from '@/components/ai/ai-mark';
import { Ai, Colors } from '@/constants/theme';

const FIELD_H = 60;
// How far the focus ring sits outside the field. Was 10, when the ring was a
// coloured glow bleeding into a dark ground and needed room to fall off.
const RING_GAP = 4;
const FOCUS_MS = 220;

// The mark inside the action button, as a fraction of it. Smaller than the one
// on the bar's assistant button: that is a badge carrying a logo, this is a
// control in a field.
const MARK = 0.46;

const ACTION = 46;

// The one place on the assistant screen where anything is typed.
//
// A white field with a hairline, like every other field in the app. It used to
// be the one bright object on a dark ground and could rely on that alone; on
// the light screen it is a card among cards, and its focus state has to do the
// work the contrast used to.
export function AiInput({
  value,
  onChangeText,
  onSubmit,
  busy,
}: {
  value: string;
  onChangeText: (next: string) => void;
  onSubmit: () => void;
  busy?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const glow = useSharedValue(0);

  function light(on: boolean) {
    setFocused(on);
    glow.value = withTiming(on ? 1 : 0, {
      duration: FOCUS_MS,
      easing: Easing.out(Easing.quad),
    });
  }

  // A second outline just outside the field's own, fading up as it takes
  // focus. It was a filled glow — an orange-to-blue wash bleeding ten points
  // into the dark ground — which on a near-white page is a solid blue slab
  // behind a white pill. An outline says the same thing without painting
  // anything: on a light ground, focus is drawn, not lit.
  const ring = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
    transform: [{ scale: 1 - (1 - glow.value) * 0.015 }],
  }));

  const ready = value.trim().length > 0 && !busy;

  return (
    <View style={styles.wrap}>
      <Animated.View pointerEvents="none" style={[styles.ring, ring]} />

      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => light(true)}
          onBlur={() => light(false)}
          onSubmitEditing={onSubmit}
          placeholder="Ask me anything about your trip..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="send"
          editable={!busy}
        />

        {/* One control, two jobs. Idle it is the magic icon that says what the
            field is for; with something to send it is the send key. Two
            separate buttons would leave one of them dead most of the time. */}
        <Pressable
          onPress={onSubmit}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityLabel={ready ? 'Send' : 'Ask the assistant'}
          style={({ pressed }) => [styles.action, !ready && styles.actionIdle, pressed && styles.pressed]}>
          {ready ? (
            <Ionicons name="arrow-up" size={20} color={Colors.primaryForeground} />
          ) : (
            // The assistant's own mark, not Ionicons' sparkles — the same one
            // the button in the tab bar carries, so the thing that opened this
            // screen and the thing that acts on it are visibly related.
            <AiMark size={ACTION * MARK} color={Colors.primaryForeground} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: -RING_GAP,
    left: -RING_GAP,
    right: -RING_GAP,
    bottom: -RING_GAP,
    borderRadius: (FIELD_H + RING_GAP * 2) / 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  field: {
    height: FIELD_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 22,
    paddingRight: 7,
    gap: 10,
    borderRadius: FIELD_H / 2,
    backgroundColor: Ai.chipSurface,
    borderWidth: 1,
    borderColor: Ai.chipBorder,
  },
  // Focus is the one state this field has, so it gets the action colour — the
  // same blue every other focused or active thing in the app takes. It was the
  // brand orange, which is down to prices and the saved heart now.
  fieldFocused: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    // On web a TextInput is an <input> carrying an intrinsic width a flex item
    // may not shrink below, and the browser's own focus ring is a square box
    // across the corners of a rounded field. The outline needs a real style
    // named beside it or its zero width is ignored — and the field already
    // says it has focus, in the app's own colours.
    minWidth: 0,
    outlineStyle: 'solid',
    outlineWidth: 0,
    fontSize: 15,
    // What the reader types is content, so it is ink — the field is a place to
    // write, not a control to press. `Colors.foreground`, not `Ai.text`: the
    // field is a white pill, and `Ai.text` is the white for type on the
    // coloured ground behind it.
    color: Colors.foreground,
    paddingVertical: 0,
  },
  action: {
    width: ACTION,
    height: ACTION,
    borderRadius: ACTION / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  // Idle it is not disabled, only waiting — it still says what the field is
  // for. 0.55 read as greyed out; this is a step back, not a switch off.
  actionIdle: {
    opacity: 0.82,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
