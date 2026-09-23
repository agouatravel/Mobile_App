import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export type TabItem = {
  name: string;
  label: string;
  icon: IconName;
  iconOutline: IconName;
};

// Order here is the visual left-to-right order in the bottom bar. The bar
// iterates this list directly rather than the navigator's own route order,
// which is derived from the filesystem and would not follow edits here.
export const TAB_ITEMS: TabItem[] = [
  { name: 'index', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'explore', label: 'Explore', icon: 'location', iconOutline: 'location-outline' },
  { name: 'offers', label: 'Offers', icon: 'pricetag', iconOutline: 'pricetag-outline' },
  { name: 'account', label: 'Account', icon: 'person', iconOutline: 'person-outline' },
];

// Whether a route hides the bottom bar and carries its own way out instead.
//
// Derived from TAB_ITEMS rather than listed, so it is the tab bar's four routes
// that are enumerated and everything else is a detail screen by default. A
// hand-kept list of the exceptions was the wrong way round: every screen added
// since has been a detail screen, and each would have had to remember to add
// itself or would have shown a bar offering four ways sideways out of a page
// with one job.
//
// These screens carry a back button, and the ones with something to do carry
// their own action bar. That is the whole navigation they need: the bar's four
// destinations are all still one back-press away.
const TAB_NAMES = new Set(TAB_ITEMS.map((tab) => tab.name));

export function isBareRoute(name: string) {
  return !TAB_NAMES.has(name);
}
