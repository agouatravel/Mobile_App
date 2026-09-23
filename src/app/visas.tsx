import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { GAP, SIDE_PADDING } from '@/components/visas/metrics';
import { VisaCard } from '@/components/visas/visa-card';
import { VisaHelp, VisaPromo } from '@/components/visas/visa-help';
import { VisaHero } from '@/components/visas/visa-hero';
import { VisaServices } from '@/components/visas/visa-services';
import { VisaSteps } from '@/components/visas/visa-steps';
import { SUPPORT_PHONE } from '@/constants/contact';
import { POPULAR_VISAS } from '@/constants/visas-data';
import { Backdrop, Colors, Glass } from '@/constants/theme';

// Cards in the Popular rail, as a fraction of the screen. Narrower than it was
// — the card is down to a flag, a name and a price, and holding it at the old
// width left the price stranded in a field of white. This fits a card and most
// of the next, so the rail shows two countries at a glance and still reads as
// something to swipe.
const CARD_FRACTION = 0.52;

const SUPPORT = 40;

export default function VisasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - SIDE_PADDING * 2;
  const cardWidth = Math.round(width * CARD_FRACTION);

  // Both the headset in the header and Chat Now at the foot come here. The
  // desk is one desk, and `tel:` is the only channel the app is wired for —
  // sending "Chat Now" somewhere else would mean shipping a second contact
  // route that does not exist yet. Failures are swallowed the same way
  // offer.tsx does it: a device with no dialler is not something to interrupt
  // the user about.
  const call = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
  };

  return (
    // The header is pinned with `stickyHeaderIndices` rather than lifted out
    // of the scroller the way the other detail screens do it.
    //
    // Lifting it out is the better shape — the content never passes underneath,
    // so the header needs no surface of its own. It cannot be used here. This
    // is the only one of these screens whose scroller holds a horizontal rail,
    // and a horizontal ScrollView inside a vertical one inside a flex parent
    // has no definite width anywhere in its chain: the rail sizes to its six
    // cards, pushes the tree past the screen, and the row-flex root answers by
    // collapsing to zero, which wraps every line of text on the page to one
    // word. Keeping the ScrollView as the screen's root element is what gives
    // the chain the definite width it needs.
    <ScrollView
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 }}>
      {/* Outside the scroller rather than pinned over it, so it takes its own
          space at the top and the content below scrolls within what is left.
          Floating it would need a background to hide the content passing
          underneath, and an opaque band here would paint over the one part of
          the aurora backdrop that is actually coloured.

          The back arrow and the support button are the same size and sit at
          either end, so the title between them stays optically centred without
          being measured. */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <BackButton />

        <View style={styles.headerCopy}>
          <Text style={styles.title}>Tourist Visa</Text>
          <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            Hassle-free visa process for your dream destinations
          </Text>
        </View>

        <Pressable
          onPress={call}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Call the visa desk"
          style={({ pressed }) => [styles.support, pressed && styles.pressed]}>
          <Ionicons name="headset-outline" size={19} color={Colors.secondary} />
        </Pressable>
      </View>


        <View style={styles.section}>
          <VisaHero />
        </View>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Popular Tourist Visas</Text>
        <Pressable
          onPress={() => router.push('/visa-list')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all tourist visas"
          style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}>
          <Text style={styles.viewAllLabel}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // An explicit pixel width, not a flex or a percentage. A horizontal
        // scroller sizes to its content unless something definite constrains
        // it, and this rail's content is six cards wide. While this screen's
        // vertical ScrollView was the scene's root element the navigator gave
        // it a definite width and that constraint reached down here; now that
        // the header sits above it, nothing in the chain has one and the rail
        // pushes the whole tree out past the screen — which the row-flex root
        // above answers by collapsing to zero.
        style={[styles.railScroller, { width }]}
        // Padding goes on the content rather than the scroller, so the cards
        // scroll to the screen's edge instead of being clipped by padding on
        // the way past. The gap above it has to stay on the scroller itself.
        contentContainerStyle={styles.rail}>
        {POPULAR_VISAS.map((visa) => (
          <VisaCard
            key={visa.key}
            visa={visa}
            width={cardWidth}
            onPress={() => router.push({ pathname: '/visa', params: { key: visa.key } })}
          />
        ))}
      </ScrollView>

      <Text style={[styles.sectionHeading, styles.standaloneHeading]}>Our Visa Services Include</Text>
      <View style={styles.section}>
        <VisaServices width={contentWidth} />
      </View>

      <Text style={[styles.sectionHeading, styles.standaloneHeading]}>Simple 4 Steps Process</Text>
      <View style={styles.section}>
        <VisaSteps />
      </View>

        <View style={[styles.section, styles.footer]}>
          <VisaHelp onCall={call} />
          <VisaPromo onPress={() => router.push('/offers')} />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 10,
    // Sticky, so content passes underneath it and it has to carry a surface —
    // the flat page colour rather than white, which is what the rest of the
    // page dissolves into anyway.
    backgroundColor: Backdrop.base,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.onLight,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  support: {
    width: SUPPORT,
    height: SUPPORT,
    borderRadius: SUPPORT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  section: {
    marginTop: 18,
    paddingHorizontal: SIDE_PADDING,
  },
  sectionHeadingRow: {
    marginTop: 22,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.onLight,
  },
  // A heading with no control opposite it still needs the row's spacing, but
  // not its layout.
  standaloneHeading: {
    marginTop: 22,
    paddingHorizontal: SIDE_PADDING,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewAllLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  railScroller: {
    marginTop: 12,
  },
  rail: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 4,
    gap: GAP,
    alignItems: 'flex-start',
  },
  footer: {
    marginTop: 22,
  },
  pressed: {
    opacity: 0.75,
  },
});
