import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Scrim under captions laid over photography. The gradient id is per-card:
// ids are not reliably scoped across sibling Svg roots on native, so two cards
// sharing one id can resolve to the same gradient.
export function PhotoScrim({ id, from }: { id: string; from: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={Colors.foreground} stopOpacity={0.28} />
          <Stop offset={from} stopColor={Colors.foreground} stopOpacity={0.05} />
          <Stop offset="100%" stopColor={Colors.foreground} stopOpacity={0.82} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
