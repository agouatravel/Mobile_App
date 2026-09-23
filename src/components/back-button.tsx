import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

// The way out of a screen that has no bottom bar. A circular target rather
// than a bare glyph: these screens put it on the backdrop with nothing else
// around it, and an unframed arrow up there reads as decoration.
export function BackButton({
  onPress,
  label = 'Go back',
}: {
  /** Defaults to leaving the screen. Pass one to step back within a flow. */
  onPress?: () => void;
  label?: string;
}) {
  const router = useRouter();

  function leave() {
    // Reachable as a cold start's first screen — a deep link, or a signed-out
    // launch landing on /login — and there is nothing behind it then. Without
    // the check the arrow is simply dead on those runs.
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <Pressable
      onPress={onPress ?? leave}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons name="arrow-back" size={21} color={Colors.onLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  pressed: {
    opacity: 0.75,
  },
});
