import { StyleSheet, View } from 'react-native';

import { Backdrop } from '@/constants/theme';

// The app-wide background: a flat white sheet, and nothing else.
//
// This used to be a mesh — seven warm and cool blobs washed across the top
// half of every screen behind a gradient scrim that dissolved them into the
// page. The minimal theme has no wash to draw: the page is white, and depth
// comes from a surface being grey rather than from anything painted behind it.
//
// The component stays rather than being deleted at each call site. It is what
// paints the window's own colour under the safe areas and behind a screen that
// has not laid out yet, and keeping the seam means the background is still one
// thing the whole app agrees on. It is also now cheap enough to be free — an
// SVG with seven radial gradients per screen became a single View.
export function AuroraBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: Backdrop.base }]}
      pointerEvents="none"
    />
  );
}
