import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { NavGlass } from '@/constants/theme';

// No BlurView here: its Android fallback (when true blur isn't available)
// renders as a flat whitish tint, which is what was reading as an unwanted
// "white bg". A single clearly-colored translucent layer reads as branded
// glass instead, consistently across platforms.
export function Navbar({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <Box className="items-center justify-center overflow-hidden">
      <Box
        pointerEvents="none"
        className="absolute inset-0"
        style={{ backgroundColor: NavGlass.tint }}
      />
      <Box style={{ paddingTop: insets.top + 18, paddingBottom: 18 }}>
        <Heading size="3xl" className="text-center text-foreground">
          {title}
        </Heading>
      </Box>
    </Box>
  );
}
