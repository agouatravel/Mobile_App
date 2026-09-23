import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResetFlow } from '@/components/account/reset-flow';

const SIDE_PADDING = 20;

// The screen is only the frame — scrolling, insets and getting the fields out
// from under the keyboard. Which of the three steps is showing, and what "back"
// means at each of them, belongs to the flow.
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          // `flexGrow` rather than `flex`: it lets the flow fill the window and
          // centre itself while there is room, and hand back to normal
          // scrolling once the keyboard leaves less than the content needs.
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: SIDE_PADDING,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* `replace`, not `push`: a finished reset leaves you signed in, and
              backing into the form you just completed would only offer to
              reset the password again. */}
          <ResetFlow onExit={() => router.back()} onDone={() => router.replace('/account')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
