import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/components/account/auth-provider';
import { PrimaryButton } from '@/components/glass/primary-button';
import { OAUTH_LABELS, fullName, initials, type Account } from '@/constants/auth';
import { Colors, Glass } from '@/constants/theme';

const AVATAR = 76;

// What you see once you are in. Deliberately thin — this is the landing spot
// for a signed-in member, not the settings screen, which does not exist yet.
export function AccountPanel({ account }: { account: Account }) {
  const { signOut } = useAuth();

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials(account)}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {fullName(account)}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {account.email}
        </Text>

        {account.provider !== 'password' ? (
          <View style={styles.providerPill}>
            <Ionicons
              name={account.provider === 'google' ? 'logo-google' : 'logo-apple'}
              size={12}
              color={Colors.onLight}
            />
            <Text style={styles.providerText}>
              Signed in with {OAUTH_LABELS[account.provider]}
            </Text>
          </View>
        ) : null}
      </View>

      {/* The member ID gets a row of its own because it is the one thing here
          you have to be able to read back — it is the second way to log in. */}
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name="card-outline" size={17} color={Colors.secondary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardLabel}>Member ID</Text>
          <Text style={styles.cardValue} selectable>
            {account.id}
          </Text>
        </View>
      </View>

      <Text style={styles.hint}>
        You can log in with this ID or with your email address.
      </Text>

      <PrimaryButton label="Log out" onPress={signOut} style={styles.signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Glass.fill,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  initials: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.secondary,
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onLight,
  },
  email: {
    marginTop: 3,
    fontSize: 13.5,
    color: Colors.textSecondary,
  },
  providerPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Glass.fill,
  },
  providerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.onLight,
  },
  card: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Glass.fill,
  },
  cardBody: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  cardValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '800',
    // Tracked out: the ID is read a character at a time, not as a word.
    letterSpacing: 1.5,
    color: Colors.onLight,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textMuted,
  },
  signOut: {
    marginTop: 26,
    alignSelf: 'stretch',
  },
});
