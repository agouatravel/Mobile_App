import type { Ionicons } from '@expo/vector-icons';
import type { ImageSource } from 'expo-image';

type IconName = keyof typeof Ionicons.glyphMap;

// One country Agoua files a tourist visa for.
//
// `from` is a plain number like every other price in the app, formatted at the
// point of display through `formatPrice` -- see constants/currency.ts.
//
// `flag` is a bundled SVG rather than a flag emoji. Regional-indicator pairs
// need a font carrying flag glyphs and most Android builds ship none, so the
// emoji falls back to two hollow boxes or to the bare letters. These are drawn
// from the official construction sheets instead -- a few KB each, sharp at any
// size, and identical on both platforms.
export type VisaCountry = {
  key: string;
  name: string;
  region: VisaRegion;
  from: number;
  // Both are per-country because both genuinely differ, and both are read only
  // by the detail screen -- they were on the rail's card until it came down to
  // a flag, a name and a price, and this is the page with room to qualify them.
  //
  // `processingDays` is a range rather than a number because it is one: no
  // consulate commits to a single figure, and a card claiming "7 days" makes a
  // promise the desk cannot keep. Stored as the text that gets drawn, since
  // nothing computes with it.
  processingDays: string;
  maxStayDays: number;
  flag: ImageSource;
};

// True of every tourist visa Agoua files, so they are written once here rather
// than repeated across thirty-one rows. A country that genuinely differs should
// get its own field on VisaCountry rather than a second copy of this list.
export const VISA_ENTRY_TYPE = 'Single or multiple entry';
export const VISA_VALIDITY = '6 months from issue';

export const VISA_DOCUMENTS = [
  'Passport valid for at least six months',
  'Two recent passport photographs',
  'Bank statements for the last three months',
  'Confirmed flight and hotel booking',
  'Travel medical insurance',
  'Employment or business letter',
];

// Where a country sits in the filter. Deliberately not EXPLORE_REGIONS, which
// the destinations rail uses: that list has no Middle East, so the UAE, Qatar,
// Oman and Turkey would all file under Asia. Those are among the highest-volume
// rows on this screen, and a filter that files them under the wrong heading is
// worse than no filter at all.
export type VisaRegion = 'Europe' | 'Asia' | 'Middle East' | 'Americas' | 'Africa' | 'Oceania';

export const VISA_REGIONS: VisaRegion[] = [
  'Europe',
  'Asia',
  'Middle East',
  'Americas',
  'Africa',
  'Oceania',
];

// The sentinel for "no region filter". A string rather than null so the chip
// row can render it like any other option.
export const ALL_REGIONS = 'All';
export type VisaRegionFilter = VisaRegion | typeof ALL_REGIONS;

export const VISA_SORTS = ['Price: low to high', 'Price: high to low', 'Name: A-Z'] as const;
export type VisaSort = (typeof VISA_SORTS)[number];
export const DEFAULT_SORT: VisaSort = 'Price: low to high';

// Every country on the list screen, and the single source both screens read:
// the Popular rail resolves its six against this rather than holding copies, so
// a price corrected here cannot fall out of step with the landing screen.
//
// Metro resolves `require` at build time and cannot take a computed path, so
// each flag is written out -- the same reason ICONS in explore-data.ts is a map
// of literals. Files are named for the country rather than the visa, so eu.svg
// serves Schengen and would serve any other EU-wide product added later.
//
// Seven flags are approximations, because their emblems are painted rather than
// geometric: es and mx omit the arms, pt reduces the armillary sphere to a ring
// and shield, br omits the globe's 27 stars, eg simplifies the eagle, om omits
// the khanjar, and ch is drawn 3:2 rather than square so it crops like the rest.
// Swap those seven when there are real assets; the other 24 are drawn to their
// official construction.
export const ALL_VISAS: VisaCountry[] = [
  {
    key: 'schengen',
    name: 'Schengen Visa',
    region: 'Europe',
    from: 299,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/eu.svg'),
  },
  {
    key: 'uk',
    name: 'UK Visa',
    region: 'Europe',
    from: 149,
    processingDays: '15-20',
    maxStayDays: 180,
    flag: require('@/assets/flags/gb.svg'),
  },
  {
    key: 'france',
    name: 'France Visa',
    region: 'Europe',
    from: 279,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/fr.svg'),
  },
  {
    key: 'germany',
    name: 'Germany Visa',
    region: 'Europe',
    from: 279,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/de.svg'),
  },
  {
    key: 'italy',
    name: 'Italy Visa',
    region: 'Europe',
    from: 269,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/it.svg'),
  },
  {
    key: 'spain',
    name: 'Spain Visa',
    region: 'Europe',
    from: 269,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/es.svg'),
  },
  {
    key: 'netherlands',
    name: 'Netherlands Visa',
    region: 'Europe',
    from: 289,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/nl.svg'),
  },
  {
    key: 'switzerland',
    name: 'Switzerland Visa',
    region: 'Europe',
    from: 319,
    processingDays: '12-18',
    maxStayDays: 90,
    flag: require('@/assets/flags/ch.svg'),
  },
  {
    key: 'greece',
    name: 'Greece Visa',
    region: 'Europe',
    from: 259,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/gr.svg'),
  },
  {
    key: 'austria',
    name: 'Austria Visa',
    region: 'Europe',
    from: 279,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/at.svg'),
  },
  {
    key: 'portugal',
    name: 'Portugal Visa',
    region: 'Europe',
    from: 259,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/pt.svg'),
  },
  {
    key: 'japan',
    name: 'Japan Visa',
    region: 'Asia',
    from: 199,
    processingDays: '5-7',
    maxStayDays: 90,
    flag: require('@/assets/flags/jp.svg'),
  },
  {
    key: 'china',
    name: 'China Visa',
    region: 'Asia',
    from: 349,
    processingDays: '7-10',
    maxStayDays: 30,
    flag: require('@/assets/flags/cn.svg'),
  },
  {
    key: 'thailand',
    name: 'Thailand Visa',
    region: 'Asia',
    from: 129,
    processingDays: '3-5',
    maxStayDays: 60,
    flag: require('@/assets/flags/th.svg'),
  },
  {
    key: 'singapore',
    name: 'Singapore Visa',
    region: 'Asia',
    from: 179,
    processingDays: '3-5',
    maxStayDays: 30,
    flag: require('@/assets/flags/sg.svg'),
  },
  {
    key: 'malaysia',
    name: 'Malaysia Visa',
    region: 'Asia',
    from: 119,
    processingDays: '2-4',
    maxStayDays: 30,
    flag: require('@/assets/flags/my.svg'),
  },
  {
    key: 'indonesia',
    name: 'Indonesia Visa',
    region: 'Asia',
    from: 139,
    processingDays: '3-5',
    maxStayDays: 30,
    flag: require('@/assets/flags/id.svg'),
  },
  {
    key: 'south-korea',
    name: 'South Korea Visa',
    region: 'Asia',
    from: 229,
    processingDays: '7-10',
    maxStayDays: 90,
    flag: require('@/assets/flags/kr.svg'),
  },
  {
    key: 'uae',
    name: 'UAE Visa',
    region: 'Middle East',
    from: 449,
    processingDays: '3-5',
    maxStayDays: 60,
    flag: require('@/assets/flags/ae.svg'),
  },
  {
    key: 'turkey',
    name: 'Turkey Visa',
    region: 'Middle East',
    from: 129,
    processingDays: '2-3',
    maxStayDays: 90,
    flag: require('@/assets/flags/tr.svg'),
  },
  {
    key: 'qatar',
    name: 'Qatar Visa',
    region: 'Middle East',
    from: 189,
    processingDays: '3-5',
    maxStayDays: 30,
    flag: require('@/assets/flags/qa.svg'),
  },
  {
    key: 'oman',
    name: 'Oman Visa',
    region: 'Middle East',
    from: 159,
    processingDays: '3-5',
    maxStayDays: 30,
    flag: require('@/assets/flags/om.svg'),
  },
  {
    key: 'usa',
    name: 'USA Visa',
    region: 'Americas',
    from: 649,
    processingDays: '20-30',
    maxStayDays: 180,
    flag: require('@/assets/flags/us.svg'),
  },
  {
    key: 'canada',
    name: 'Canada Visa',
    region: 'Americas',
    from: 529,
    processingDays: '15-25',
    maxStayDays: 180,
    flag: require('@/assets/flags/ca.svg'),
  },
  {
    key: 'brazil',
    name: 'Brazil Visa',
    region: 'Americas',
    from: 389,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/br.svg'),
  },
  {
    key: 'mexico',
    name: 'Mexico Visa',
    region: 'Americas',
    from: 419,
    processingDays: '10-15',
    maxStayDays: 180,
    flag: require('@/assets/flags/mx.svg'),
  },
  {
    key: 'morocco',
    name: 'Morocco Visa',
    region: 'Africa',
    from: 199,
    processingDays: '5-7',
    maxStayDays: 90,
    flag: require('@/assets/flags/ma.svg'),
  },
  {
    key: 'egypt',
    name: 'Egypt Visa',
    region: 'Africa',
    from: 149,
    processingDays: '5-7',
    maxStayDays: 30,
    flag: require('@/assets/flags/eg.svg'),
  },
  {
    key: 'south-africa',
    name: 'South Africa Visa',
    region: 'Africa',
    from: 299,
    processingDays: '10-15',
    maxStayDays: 90,
    flag: require('@/assets/flags/za.svg'),
  },
  {
    key: 'australia',
    name: 'Australia Visa',
    region: 'Oceania',
    from: 579,
    processingDays: '15-20',
    maxStayDays: 90,
    flag: require('@/assets/flags/au.svg'),
  },
  {
    key: 'new-zealand',
    name: 'New Zealand Visa',
    region: 'Oceania',
    from: 549,
    processingDays: '15-20',
    maxStayDays: 90,
    flag: require('@/assets/flags/nz.svg'),
  },
];

// The six the landing screen leads with, in the order it shows them. Keys
// rather than copies, resolved against ALL_VISAS below.
const POPULAR_KEYS = ['schengen', 'uk', 'japan', 'uae', 'turkey', 'usa'];

// A key that no longer matches drops out rather than rendering a hole -- the
// same contract the Home category row uses for its featured list.
export const POPULAR_VISAS: VisaCountry[] = POPULAR_KEYS.map((key) =>
  ALL_VISAS.find((visa) => visa.key === key)
).filter((visa) => visa !== undefined);

// What the price slider opens at, taken from the data rather than written down
// so a country cheaper than the current floor cannot land outside the range
// that is supposed to contain everything.
export const VISA_PRICE_MIN = Math.min(...ALL_VISAS.map((visa) => visa.from));
export const VISA_PRICE_MAX = Math.max(...ALL_VISAS.map((visa) => visa.from));

// The slider moves in steps rather than continuously. Prices are whole riyals
// in the hundreds, so a pixel-accurate value would show a figure nobody set and
// no country matches.
export const VISA_PRICE_STEP = 10;

export type PriceRange = { low: number; high: number };

export const FULL_PRICE_RANGE: PriceRange = { low: VISA_PRICE_MIN, high: VISA_PRICE_MAX };

export function isFullPriceRange(range: PriceRange) {
  return range.low <= VISA_PRICE_MIN && range.high >= VISA_PRICE_MAX;
}

// Region, price and free text in one pass. The query matches on name only:
// region is already its own control, and letting "asia" match through the
// search box too would mean two controls silently fighting over one result set.
export function filterVisas(
  list: VisaCountry[],
  region: VisaRegionFilter,
  query: string,
  price: PriceRange = FULL_PRICE_RANGE
) {
  const needle = query.trim().toLowerCase();
  return list.filter(
    (visa) =>
      (region === ALL_REGIONS || visa.region === region) &&
      visa.from >= price.low &&
      visa.from <= price.high &&
      (needle === '' || visa.name.toLowerCase().includes(needle))
  );
}

// Returns a new array rather than sorting in place -- ALL_VISAS is module state
// and a screen reordering it would reorder it for every other screen too.
export function sortVisas(list: VisaCountry[], sort: VisaSort) {
  const sorted = [...list];
  if (sort === 'Name: A-Z') return sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'Price: high to low') return sorted.sort((a, b) => b.from - a.from);
  return sorted.sort((a, b) => a.from - b.from);
}

// The three reassurances under the hero headline. Short enough to sit on one
// line each at a third of the screen — anything longer wraps to three lines on
// a 360pt phone and pushes the hero taller than the fold.
export type VisaTrust = {
  key: string;
  icon: IconName;
  title: string;
  detail: string;
};

export const VISA_TRUST: VisaTrust[] = [
  { key: 'secure', icon: 'shield-checkmark-outline', title: 'Secure Process', detail: '100% Safe' },
  { key: 'fast', icon: 'time-outline', title: 'Fast Processing', detail: 'Quick & Reliable' },
  { key: 'support', icon: 'headset-outline', title: 'Expert Support', detail: "We're here to help" },
];

// What the service covers, as a row of five. These are informational rather
// than tappable: each one is a stage Agoua handles, not a thing to open.
export type VisaService = {
  key: string;
  icon: IconName;
  label: string;
};

// Full names again. These were shortened while the five sat in one row across
// the screen, where a cell was about 58pt wide and the longer two truncated to
// an ellipsis. The grid gives each of them half the width, so there is room for
// what the service is actually called.
export const VISA_SERVICES: VisaService[] = [
  { key: 'verification', icon: 'document-text-outline', label: 'Document\nVerification' },
  { key: 'filling', icon: 'create-outline', label: 'Application\nFilling' },
  { key: 'appointment', icon: 'calendar-outline', label: 'Appointment\nBooking' },
  { key: 'tracking', icon: 'search-outline', label: 'Visa Processing\n& Tracking' },
  { key: 'delivery', icon: 'paper-plane-outline', label: 'Delivery to\nYour Doorstep' },
];

// The four stages, in order. `title` is what happens and `detail` is who does
// it — the pairing is what makes the row read as a process rather than as four
// more feature tiles.
export type VisaStep = {
  key: string;
  icon: IconName;
  title: string;
  detail: string;
};

export const VISA_STEPS: VisaStep[] = [
  {
    key: 'apply',
    icon: 'cloud-upload-outline',
    title: 'Apply Online',
    detail: 'Fill the form & upload documents',
  },
  {
    key: 'verify',
    icon: 'folder-open-outline',
    title: 'We Verify',
    detail: 'Our experts verify your documents',
  },
  {
    key: 'processing',
    icon: 'hourglass-outline',
    title: 'Processing',
    detail: 'We process your visa application',
  },
  {
    key: 'collect',
    icon: 'checkmark-done-outline',
    title: 'Get Your Visa',
    detail: 'Receive your visa without hassle',
  },
];

// The banner at the foot of the screen. The number is here rather than inline
// in the copy so the two halves of the sentence cannot drift apart.
export const VISA_PROMO = {
  kicker: 'Book your trip with visa',
  discount: 10,
  detail: 'on your next booking',
  cta: 'Explore Deals',
} as const;
