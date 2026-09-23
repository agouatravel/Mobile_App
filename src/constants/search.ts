import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import { EXPLORE_CATEGORIES, EXPLORE_PLACES } from '@/constants/explore-data';
import { DESTINATION_RESULTS } from '@/constants/home-data';

type IconName = keyof typeof Ionicons.glyphMap;

export type SearchGroup = 'Destinations' | 'Stays' | 'Services';

export type SearchHit = {
  key: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  icon: IconName;
  href: Href;
};

// How many rows the dropdown will show. A suggestion list is a shortcut to one
// thing, not a results page — past half a dozen rows it stops being scannable
// and starts covering the screen it is supposed to be a shortcut into. The
// Search button goes to the full list.
export const SEARCH_LIMIT = 6;

// The order groups appear in, which is also the tie-break between two hits that
// matched equally well. Places first: a name typed into a travel app's search
// box is far more often somewhere to go than a service to buy.
const GROUP_ORDER: SearchGroup[] = ['Destinations', 'Stays', 'Services'];

// A hit plus the lowercased text it can be matched on. `haystack` carries the
// secondary fields — a country, an operator, a strapline — so "Indonesia"
// finds Bali without those words having to show in the row's title.
type Entry = SearchHit & { haystack: string };

// One stay, as a hit. Named rather than inlined because the price lookup below
// needs the identical shape — two hand-built copies of it would drift.
function stayEntry(stay: (typeof DESTINATION_RESULTS)[number]): Entry {
  return {
    key: `stay-${stay.key}`,
    group: 'Stays',
    title: stay.name,
    subtitle: stay.operator,
    icon: 'bed-outline' as IconName,
    href: { pathname: '/package', params: { key: stay.key } } as Href,
    haystack: `${stay.name} ${stay.operator} ${stay.filter}`.toLowerCase(),
  };
}

// Built once at module scope. The catalogue is static, so rebuilding this per
// keystroke would be work with no possible different answer.
const INDEX: Entry[] = [
  ...EXPLORE_PLACES.map((place) => ({
    key: `place-${place.key}`,
    group: 'Destinations' as const,
    title: place.name,
    subtitle: place.country,
    icon: 'location-outline' as IconName,
    href: { pathname: '/place', params: { key: place.key } } as Href,
    haystack: `${place.name} ${place.country} ${place.region}`.toLowerCase(),
  })),
  ...DESTINATION_RESULTS.map(stayEntry),
  ...EXPLORE_CATEGORIES.map((category) => ({
    key: `service-${category.key}`,
    group: 'Services' as const,
    title: category.label,
    subtitle: category.detail,
    icon: 'briefcase-outline' as IconName,
    href: category.href as Href,
    haystack: `${category.label} ${category.detail}`.toLowerCase(),
  })),
];

// How much the assistant can actually reach. Counted off the index rather
// than written down, so it cannot drift from the catalogue it describes — add
// a destination and the number on the assistant screen goes up on its own.
export const CATALOGUE_SIZE = INDEX.length;

// Lower is better, -1 is no match. Three tiers rather than a fuzzy distance:
// what someone typing into a search box wants first is the thing whose name
// *starts* how they started typing, then anything whose name contains it, and
// only then a match that came from a field they cannot see.
function score(entry: Entry, needle: string) {
  const title = entry.title.toLowerCase();
  if (title.startsWith(needle)) return 0;
  if (title.includes(needle)) return 1;
  if (entry.haystack.includes(needle)) return 2;
  return -1;
}

// Everything in the app that a name could reasonably lead to, ranked.
//
// Case- and whitespace-insensitive, and matched on substrings rather than whole
// words: on a phone keyboard the query is usually the first few letters of one
// word, and requiring a complete one would leave the dropdown empty for most of
// the time it is on screen.
export function searchCatalogue(query: string, limit = SEARCH_LIMIT): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return [];

  return INDEX.map((entry) => ({ entry, rank: score(entry, needle) }))
    .filter((scored) => scored.rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        GROUP_ORDER.indexOf(a.entry.group) - GROUP_ORDER.indexOf(b.entry.group) ||
        a.entry.title.localeCompare(b.entry.title)
    )
    .slice(0, limit)
    .map(({ entry }) => entry);
}

// The cheapest stays Agoua sells, by nightly rate.
//
// A real answer to "what can I afford", rather than a keyword lookup: nothing
// in the catalogue has the word "budget" written on it, so searching for it
// finds nothing and the assistant would have had a topic to talk about and
// nothing to point at.
export function cheapestStays(limit = 3): SearchHit[] {
  return [...DESTINATION_RESULTS]
    .sort((a, b) => a.perNight - b.perNight)
    .slice(0, limit)
    .map(stayEntry);
}
