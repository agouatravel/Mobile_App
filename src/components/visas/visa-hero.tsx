import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { PANEL_RADIUS } from '@/components/visas/metrics';
import { VISA_TRUST } from '@/constants/visas-data';
import { Colors, Glass } from '@/constants/theme';

// Agoua's own visa artwork — the same file the category tile draws, required
// here directly rather than reached through EXPLORE_CATEGORIES. The tile picks
// its icon out of that list because it renders whichever category it is handed;
// this hero only ever draws one, and routing a fixed asset through a lookup
// would only make it possible for the lookup to come back empty.
const VISA_ART = require('@/assets/icons/svg_icons/visas.svg');

const ART = 148;
const BADGE = 44;

// How far the trust card is pulled up over the panel above it.
const OVERLAP = 30;

// No entrance animation here, deliberately, and it is worth saying why since
// this is the one block on the screen that is visible the moment it mounts and
// would therefore be the natural place for one.
//
// Reanimated's `entering` builders set up their initial state on first render.
// On native that is fine. In the static web export this block is server-
// rendered, and the markup the builders produce does not match what the client
// then renders — React bails out of hydration and the app is left at the
// server's zero-width layout, which collapses the entire page. The filter
// sheet's entrance animations are safe because a Modal only ever renders after
// an interaction, so it is never part of the server render.
//
// An animation that plays once, on a block nobody has to wait for, is not worth
// a broken platform.

// The card that opens the screen: the promise, the artwork, and the three
// reassurances that qualify it.
//
// The reference draws this on cream. Cream is not one of the app's colours and
// a flat unbranded panel at the top of a screen reads as a banner pasted in
// from somewhere else, so it is a wash of the brand's own two hues instead —
// warm at the top left where the headline sits, cooling into the blue behind
// the artwork. Both stops are theme tokens at low alpha rather than new
// colours, so the card shifts with the brand instead of having to be found and
// re-picked when it changes.
//
// The reassurances used to sit inside that panel. They are on their own white
// card now, lifted and overlapping the panel's lower edge: the panel is the
// pitch and these are the proof, and a claim and its evidence printed on one
// surface read as one more line of the claim.
export function VisaHero() {
  return (
    <View>
      <View style={styles.panel}>
        {/* Decorative rings behind the artwork. Drawn as outlines rather than
            fills so they read as depth in the panel rather than as shapes
            sitting on it, and clipped by the panel's own corner. */}
        <View pointerEvents="none" style={[styles.ring, styles.ringLarge]} />
        <View pointerEvents="none" style={[styles.ring, styles.ringSmall]} />

        <View style={styles.top}>
          <View style={styles.copy}>
            <View style={styles.tag}>
              <Ionicons name="sparkles" size={11} color={Colors.primary} />
              <Text style={styles.tagLabel}>Trusted visa desk</Text>
            </View>

            {/* The reference sets this in a script face. The app bundles no
                script font, and pulling one in for four words would cost a font
                file on every cold start — italic at the brand orange carries
                the same "spoken aside" role the script was doing. */}
            <Text style={styles.kicker}>Travel the world</Text>

            <Text style={styles.headline}>We make{'\n'}visa easy!</Text>

            <Text style={styles.support}>
              Apply online in minutes. We handle the paperwork, the appointment
              and the follow-up.
            </Text>
          </View>

          {/* Decorative: the headline beside it already says what the card is
              about, so a screen reader gains nothing from announcing it. */}
          <Image
            source={VISA_ART}
            style={styles.art}
            contentFit="contain"
            transition={200}
            accessible={false}
          />
        </View>

        {/* Leaves room for the half of the trust card that hangs over this
            edge, so the artwork above cannot end up behind it. */}
        <View style={styles.overlapSpacer} />
      </View>

      <View style={styles.trustCard}>
        {VISA_TRUST.map((item, index) => (
          <View key={item.key} style={styles.trustCell}>
            {/* A rule between the cells rather than around them: three bordered
                boxes inside a bordered card is a frame inside a frame inside a
                frame. */}
            {index > 0 ? <View style={styles.trustRule} /> : null}

            <View style={styles.trustBody}>
              <View style={styles.trustBadge}>
                <Ionicons name={item.icon} size={19} color={Colors.primary} />
              </View>
              {/* Both lines shrink rather than wrap. Three cells across a 360pt
                  phone leaves about 100pt each, and "We're here to help" is one
                  character too long for it at full size — a wrap there would
                  make the third cell taller than the two beside it. */}
              <Text
                style={styles.trustTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {item.title}
              </Text>
              <Text
                style={styles.trustDetail}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {item.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: PANEL_RADIUS + 6,
    paddingTop: 20,
    paddingHorizontal: 18,
    // A white sheet on the warm ground. It was a blue-to-blue gradient wash
    // and carried no fill of its own; with the gradient gone it needs one.
    backgroundColor: Glass.fill,
    borderWidth: 1,
    borderColor: Glass.border,
    // Clips the decorative rings to the panel's corner.
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: `${Colors.primary}26`,
  },
  ringLarge: {
    width: 210,
    height: 210,
    right: -64,
    top: -46,
  },
  ringSmall: {
    width: 128,
    height: 128,
    right: 6,
    top: 74,
    borderColor: `${Colors.secondary}1F`,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // The copy takes what it needs and the artwork takes the rest, rather than
  // splitting the card in half: "We make visa easy!" sets the column width, and
  // a fixed half would either crowd it or strand it.
  copy: {
    flex: 1,
    paddingRight: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  tagLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: Colors.primary,
  },
  kicker: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '600',
    fontStyle: 'italic',
    color: Colors.primary,
  },
  headline: {
    marginTop: 4,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    color: Colors.onLight,
  },
  support: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  art: {
    width: ART,
    height: ART,
  },
  overlapSpacer: {
    height: OVERLAP + 16,
  },
  // Lifted off the panel rather than drawn on it, and inset either side so the
  // panel's corners stay visible behind it — which is what makes it read as a
  // separate card rather than as the panel's own footer.
  trustCard: {
    marginTop: -OVERLAP,
    marginHorizontal: 12,
    flexDirection: 'row',
    borderRadius: PANEL_RADIUS,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 14,
  },
  trustCell: {
    flex: 1,
    flexDirection: 'row',
  },
  trustRule: {
    width: 1,
    marginVertical: 4,
    backgroundColor: Colors.divider,
  },
  trustBody: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  trustBadge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2.6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}1A`,
  },
  trustTitle: {
    marginTop: 8,
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.onLight,
    textAlign: 'center',
  },
  trustDetail: {
    marginTop: 2,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
