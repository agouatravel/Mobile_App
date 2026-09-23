import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { CURRENT_USER } from '@/constants/home-data';
import { Colors, Glass } from '@/constants/theme';

const AVATAR = 46;

// Identity row that replaces the old centred "Home" title: who is signed in.
// Sits on the header mesh, so the text colours are the on-light pair rather
// than the muted body greys.
export function UserHeader() {
  return (
    <View style={styles.row}>
      <Image source={CURRENT_USER.avatar} style={styles.avatar} contentFit="cover" transition={200} />
      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {CURRENT_USER.name}
        </Text>
        <Text style={styles.tier} numberOfLines={1}>
          {CURRENT_USER.tier}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Glass.fill,
  },
  identity: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onLight,
  },
  tier: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
