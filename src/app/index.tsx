import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DestinationGrid } from '@/components/home/destination-grid';
import { FeaturedDestination } from '@/components/home/featured-destination';
import { OfferBanner } from '@/components/home/offer-banner';
import { SalePosters } from '@/components/home/sale-posters';
import { SearchBar } from '@/components/home/search-bar';
import { ServiceGrid } from '@/components/home/service-grid';
import { Box } from '@/components/ui/box';
import { TAB_BAR_CONTENT_INSET } from '@/components/bottom-tab-bar';
import { Colors } from '@/constants/theme';

// The space between one section and the next. Large on purpose — the whole
// point of an editorial layout is that the reader is never looking at two
// things at once, and at anything under about 30 the service glyphs and the
// destination grid start reading as one continuous block of stuff.
const SECTION_GAP = 38;

export default function HomeScreen() {
  // The Navbar used to own the status-bar inset for this screen, and after it
  // the identity row did. Home opens on the greeting now, so the scroll
  // content has to clear the notch itself.
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Box className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: TAB_BAR_CONTENT_INSET + 24,
          gap: SECTION_GAP,
        }}>
        {/* The opening. Two lines and a field: who is here, the one question
            the app exists to answer, and where to answer it. Nothing else is
            allowed above the fold — the old Home opened on a greeting, a
            search bar, five category tiles and a poster rail, which is four
            things competing before the reader has looked at any of them. */}
        <View style={styles.opening}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.headline}>Where are you going?</Text>
        </View>

        <View style={styles.searchSlot}>
          <SearchBar />
        </View>

        <View style={styles.section}>
          <SectionHeading title="Discover your next journey" />
          <FeaturedDestination />
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="What do you need?"
            actionLabel="All services"
            onPress={() => router.push('/explore')}
          />
          <ServiceGrid />
        </View>

        <View style={styles.section}>
          <SectionHeading
            title="Popular destinations"
            actionLabel="See all"
            onPress={() => router.push('/destinations')}
          />
          <DestinationGrid />
        </View>

        {/* The commercial end of the page, and deliberately the end of it. An
            offer rail near the top makes the app a shop; down here it is what
            you find once you have decided you are going somewhere. */}
        <SalePosters />

        <OfferBanner />
      </ScrollView>
    </Box>
  );
}

// Read off the device clock rather than stored with the user. It is a
// greeting, not a fact about them — and it costs nothing to be right.
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// A section's name, and optionally the way past it. The action is a plain
// line of type rather than a chip: there are three of these on the page, and
// three chips down the right-hand side would read as the loudest thing on a
// screen whose whole argument is restraint.
function SectionHeading({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.headingRow}>
      <Text style={styles.headingText}>{title}</Text>

      {actionLabel && onPress ? (
        <Pressable
          onPress={onPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  opening: {
    paddingHorizontal: 20,
    gap: 6,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // The largest type in the app, and the only place it is set this size. A
  // negative tracking is what keeps a line this big from reading as loose —
  // display type needs less letter-spacing than body type, not the same.
  headline: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 40,
    color: Colors.foreground,
  },
  // The search field sits outside the opening's gap so it can take its own
  // breathing room without widening the gap between the two lines above it.
  searchSlot: {
    marginTop: -14,
  },
  section: {
    gap: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
  },
  headingText: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Colors.foreground,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
