import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

// The "-30%" chip. Solid orange is normally reserved for the single primary
// CTA, but the discount is the one piece of information the whole screen
// exists to sell, so it earns the same treatment at badge scale.
export function DiscountBadge({
  discount,
  large,
  style,
}: {
  discount: number;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.badge, large && styles.badgeLarge, style]}>
      <Text style={[styles.text, large && styles.textLarge]}>-{discount}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  badgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },
  textLarge: {
    fontSize: 16,
  },
});
