import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchCatalogue, type SearchGroup, type SearchHit } from '@/constants/search';
import { Colors, Glass } from '@/constants/theme';

const BAR_H = 56;

// Search field with its own suggestion list.
//
// The dropdown is a sibling in the flow rather than an overlay floating above
// the page. On Android a touch that lands outside its parent's bounds is never
// delivered, so an absolutely-positioned panel hanging below this bar inside a
// ScrollView would draw correctly and then ignore every tap on it. Pushing the
// page down costs a little movement and works on all three platforms.
export function SearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  // Whether the reader has closed the list themselves — by choosing something,
  // or by submitting. Tracked separately from focus on purpose: on web a tap on
  // a suggestion blurs the field first, so closing the panel on blur would
  // unmount the row before its own press could land.
  const [dismissed, setDismissed] = useState(false);
  // Only ever drives the field's ring, never the panel — see above.
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim();
  const results = useMemo(() => searchCatalogue(trimmed), [trimmed]);
  const open = trimmed.length > 0 && !dismissed;

  function submit() {
    if (trimmed.length === 0) return;
    setDismissed(true);
    Keyboard.dismiss();
    // The dropdown is the shortcut; this is the way to everything that did not
    // fit in it.
    router.push({ pathname: '/destinations', params: { q: trimmed } });
  }

  function choose(hit: SearchHit) {
    setDismissed(true);
    Keyboard.dismiss();
    router.push(hit.href);
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, focused && styles.barFocused]}>
        <Ionicons name="search-outline" size={19} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(next) => {
            setQuery(next);
            // Any new keystroke is a new search, so a list closed by the last
            // one comes back rather than staying shut until the field is empty.
            setDismissed(false);
          }}
          placeholder="Search destination"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={submit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
        />

        {trimmed.length > 0 ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setDismissed(false);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => pressed && styles.pressed}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel="Search"
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Ionicons name="search" size={14} color={Colors.primaryForeground} />
          <Text style={styles.actionText} numberOfLines={1}>
            Search
          </Text>
        </Pressable>
      </View>

      {open ? (
        <View style={styles.panel}>
          {results.length === 0 ? (
            <Text style={styles.empty}>Nothing matches “{trimmed}”.</Text>
          ) : (
            results.map((hit, index) => (
              <SuggestionRow
                key={hit.key}
                hit={hit}
                // The heading is drawn by the first row of each run rather than
                // by grouping the list into sections: the results are already
                // ordered, and a section wrapper would put a box around a group
                // that is sometimes one row long.
                heading={index === 0 || results[index - 1].group !== hit.group ? hit.group : null}
                onPress={() => choose(hit)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

function SuggestionRow({
  hit,
  heading,
  onPress,
}: {
  hit: SearchHit;
  heading: SearchGroup | null;
  onPress: () => void;
}) {
  return (
    <View>
      {heading ? <Text style={styles.groupHeading}>{heading}</Text> : null}

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${hit.title}, ${hit.subtitle}`}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.rowIcon}>
          <Ionicons name={hit.icon} size={16} color={Colors.secondary} />
        </View>

        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {hit.title}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {hit.subtitle}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    gap: 8,
  },
  bar: {
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 6,
    gap: 10,
  },
  input: {
    flex: 1,
    // A flex item may not shrink below its own minimum content size, and on
    // web a TextInput is an <input>, whose intrinsic width is around 170pt
    // whatever it is asked to display. Without this the field refused to give
    // ground on a narrow phone and shoved the button clean off the right edge
    // of the screen. No-op on native, where a view's minimum is already zero.
    minWidth: 0,
    // The browser draws its own focus ring on an <input>, and it is a square
    // black box straight across the corners of a 28pt-radius field. Dropped
    // here and put back on the bar below, which has the right shape to wear
    // it — the ring still has to exist, or the field stops telling a keyboard
    // user where they are.
    //
    // Both properties, not just the width: a ring left at the default
    // `outline-style: auto` is drawn at a width the browser picks for itself
    // and `outlineWidth` is ignored outright. Naming a real style is what
    // makes the zero mean anything.
    outlineStyle: 'solid',
    outlineWidth: 0,
    fontSize: 15,
    color: Colors.onLight,
    // Android's TextInput ships vertical padding that pushes the text off the
    // bar's centre line.
    paddingVertical: 0,
  },
  barFocused: {
    borderColor: Colors.primary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    // The field takes the free width first and the button keeps its label,
    // which is the right order — the button is the fixed furniture, the
    // placeholder is a prompt. These two are the floor under that: on a screen
    // too narrow for both, the button gives way as well rather than the row
    // overflowing again at a width the layout cannot see in advance.
    flexShrink: 1,
    minWidth: 0,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios: {
      },
      default: {},
    }),
  },
  actionText: {
    flexShrink: 1,
    color: Colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingVertical: 8,
    // Reads as a layer over the page rather than another block in it, which is
    // what says the list is a transient answer to what is in the field above.
  },
  groupHeading: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  rowPressed: {
    backgroundColor: Glass.fill,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.secondary}14`,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.onLight,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.6,
  },
});
