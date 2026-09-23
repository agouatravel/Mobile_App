import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

const BOX_H = 58;

type CodeInputProps = {
  value: string;
  length: number;
  error?: string;
  onChangeText: (value: string) => void;
  /** Fired once, on the keystroke that fills the last box. */
  onComplete?: (value: string) => void;
};

// One real field behind a row of boxes, rather than one field per box.
//
// Per-box inputs have to move focus forward on entry and backward on
// backspace, and Android does not report a backspace in an empty field
// consistently — which is how those implementations end up trapping the caret
// in box 3. Here the boxes are decoration: a single TextInput sits invisibly
// over the whole row, so selection, paste, keyboard autofill of an emailed
// code, and backspace are all just a text field behaving normally.
export function CodeInput({ value, length, error, onChangeText, onComplete }: CodeInputProps) {
  const field = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  function change(next: string) {
    // The keypad is numeric, but a paste or a hardware keyboard is not.
    const digits = next.replace(/\D/g, '').slice(0, length);
    onChangeText(digits);

    if (digits.length === length && value.length < length) onComplete?.(digits);
  }

  // Which box the next digit lands in. Clamped so the last box stays lit
  // rather than the highlight vanishing once the code is full.
  const caret = Math.min(value.length, length - 1);

  return (
    <View>
      <View style={styles.row} pointerEvents="box-none">
        {Array.from({ length }, (_, index) => {
          const digit = value[index];
          const active = focused && index === caret;

          return (
            <View
              key={index}
              style={[
                styles.box,
                digit ? styles.boxFilled : null,
                active ? styles.boxActive : null,
                error ? styles.boxError : null,
              ]}>
              <Text style={styles.digit}>{digit ?? ''}</Text>
            </View>
          );
        })}

        {/* Over the boxes, not beside them: a tap anywhere on the row lands on
            the field itself, so focus needs no press handler of its own. */}
        <TextInput
          ref={field}
          value={value}
          onChangeText={change}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={length}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          accessibilityLabel={`Verification code, ${length} digits`}
          // `caretHidden` alone leaves the selection handles on Android, which
          // show up as a blue pin floating over the boxes.
          caretHidden
          contextMenuHidden
          selectionColor="transparent"
          style={[StyleSheet.absoluteFill, styles.field]}
        />
      </View>

      {/* Reserved even when empty, matching AuthField: the buttons under this
          must not move the moment a code is rejected. */}
      <Text style={styles.error} numberOfLines={1}>
        {error ?? ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    height: BOX_H,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  // A filled box holds its edge; an empty one is only a placeholder, so the
  // difference is visible at a glance without counting digits.
  boxFilled: {
    borderColor: Glass.secondaryBorder,
  },
  boxActive: {
    borderColor: Colors.primary,
  },
  boxError: {
    borderColor: Colors.primary,
  },
  digit: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onLight,
  },
  // Invisible, but still a real full-size field, so a tap anywhere on the row
  // focuses it and a screen reader has something the size of the row to land
  // on. `opacity: 0` is what actually hides it: the digits belong in the boxes
  // and nowhere else, and opacity is a compositing rule the platform cannot
  // decline, where `color: 'transparent'` is a hint a text engine is free to
  // ignore — which is how the raw string ends up drawn across the boxes. The
  // transparent colour stays underneath it as a second line of defence.
  field: {
    opacity: 0,
    color: 'transparent',
    fontSize: 22,
    textAlign: 'center',
    paddingVertical: 0,
  },
  error: {
    minHeight: 16,
    marginTop: 8,
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
});
