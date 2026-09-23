import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountPanel } from '@/components/account/account-panel';
import { useAuth } from '@/components/account/auth-provider';
import { TAB_BAR_CONTENT_INSET } from '@/components/bottom-tab-bar';
import { Colors } from '@/constants/theme';

const SIDE_PADDING = 20;

// Signed-in only now. The signed-out half — the "Welcome" header and the
// tabbed log in / sign up panel that lived under it — moved out to /login and
// /signup, where each gets its own illustration and its own page. That leaves
// this screen with one job and no forms, so it no longer needs the
// KeyboardAvoidingView it used to wrap everything in.
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();

  if (!account) return <Redirect href="/login" />;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: TAB_BAR_CONTENT_INSET + 24,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Account is a bottom tab, so it owns its header the way Home,
            Explore and Offers do rather than taking the centred Navbar that
            pushed screens use. */}
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>Your membership, bookings and saved trips</Text>
        </View>

        <View style={styles.body}>
          <AccountPanel account={account} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIDE_PADDING,
    gap: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.onLight,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  body: {
    marginTop: 22,
    paddingHorizontal: SIDE_PADDING,
  },
});
