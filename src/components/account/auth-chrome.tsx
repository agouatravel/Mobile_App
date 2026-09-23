import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Glass } from '@/constants/theme';

// The furniture both auth pages carry: the whole-attempt error and the one
// link to the other page. Shared so the two screens can diverge in content —
// different artwork, different fields, different copy — without drifting
// apart in how they look.

// Whatever the provider rejected the whole attempt for — a wrong password, an
// email already taken. Field-level errors live on the fields instead.
export function AuthFailure({ message }: { message: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.failure}>
      <Ionicons name="alert-circle-outline" size={15} color={Colors.primary} />
      <Text style={styles.failureText}>{message}</Text>
    </View>
  );
}

// The only way between Log in and Sign up now that the segmented switch is
// gone. `replace`, not `push`: the two pages are alternatives to each other,
// not steps, so bouncing between them must not stack history that back has to
// walk out of one page at a time.
export function AuthSwitchLink({
  prompt,
  action,
  href,
}: {
  prompt: string;
  action: string;
  href: '/login' | '/signup';
}) {
  return (
    <Link
      href={href}
      replace
      accessibilityRole="link"
      accessibilityLabel={`${prompt} ${action}`}
      style={styles.switchLink}>
      <Text style={styles.switchPrompt}>{prompt} </Text>
      <Text style={styles.switchAction}>{action}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  failure: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Glass.fill,
  },
  failureText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.onLight,
  },
  switchLink: {
    marginTop: 20,
    textAlign: 'center',
  },
  switchPrompt: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  switchAction: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.secondary,
  },
});
