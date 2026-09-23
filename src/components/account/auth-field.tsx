import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Colors, Glass } from '@/constants/theme';

const FIELD_H = 54;

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
} & Pick<
  TextInputProps,
  | 'placeholder'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'keyboardType'
  | 'textContentType'
  | 'returnKeyType'
  | 'onSubmitEditing'
>;

// A labelled text field with its own error line.
//
// The error is rendered even when there is none — as an empty line of the same
// height — so a form does not jump every time validation fails. At four fields
// deep that reflow is enough to move the submit button out from under a thumb
// already on its way down.
export function AuthField({
  label,
  value,
  onChangeText,
  error,
  icon,
  secure,
  ...input
}: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.field, error ? styles.fieldError : null]}>
        <Ionicons name={icon} size={18} color={error ? Colors.primary : Colors.textMuted} />

        <TextInput
          {...input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !revealed}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            accessibilityState={{ selected: revealed }}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.error} numberOfLines={1}>
        {error ?? ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  field: {
    height: FIELD_H,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    // The form sits straight on the backdrop now rather than on a card, so each
    // field has to carry its own edge — the border reads it as an input, the
    // lift separates it from the wash behind it.
  },
  // The border carries the error rather than a red fill: the message under the
  // field already says what is wrong, and a filled field is harder to read
  // while you are fixing it.
  fieldError: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    // On web a TextInput is an <input> carrying an intrinsic width of its
    // own, which a flex item may not shrink below. Without this the field
    // sets a floor on how narrow the form can go and overflows the screen.
    minWidth: 0,
    fontSize: 15,
    color: Colors.onLight,
    // Android's TextInput ships vertical padding that pushes the text off the
    // field's centre line.
    paddingVertical: 0,
  },
  error: {
    minHeight: 16,
    marginTop: 4,
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
});
