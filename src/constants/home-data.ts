// Placeholder for the signed-in user until auth is wired up.
export const CURRENT_USER = {
  name: 'Sam Rivera',
  tier: 'Basic Traveler',
  avatar: 'https://picsum.photos/seed/agoua-avatar/160/160',
} as const;

// Three of these share one row, so every string here is written to a third of
// the screen's width. A poster is three beats and no more — the sale, the
// picture, then what it is for — so there is nowhere to put an overflowing
// headline, and `deal` in particular has to survive being set large.
export type Promo = {
  key: string;
  /** The sale itself. Two short words at most. */
  deal: string;
  /** What is on sale, and the poster's closing line. */
  cta: string;
  image: string;
};

// The sale posters under the category row.
export const PROMOS: Promo[] = [
  {
    key: 'summer',
    deal: '25% off',
    cta: 'Summer escapes',
    image: 'https://picsum.photos/seed/agoua-promo-summer/900/560',
  },
  {
    key: 'city',
    deal: 'SAR 745',
    cta: 'City breaks',
    image: 'https://picsum.photos/seed/agoua-promo-city/900/560',
  },
  {
    key: 'elite',
    deal: '2x points',
    cta: 'Join Elite',
    image: 'https://picsum.photos/seed/agoua-promo-elite/900/560',
  },
];

export type Destination = {
  key: string;
  name: string;
  location: string;
  // Bare number in the app's currency; rendered through formatPrice so the
  // currency lives in one place.
  priceFrom: number;
  image: string;
};

// Placeholder images — swap for real destination photography later.
export const DESTINATIONS: Destination[] = [
  {
    key: 'maldives',
    name: 'The Maldives',
    location: 'South Male Atoll',
    priceFrom: 4875,
    image: 'https://picsum.photos/seed/maldives-agoua/500/650',
  },
  {
    key: 'swiss-alps',
    name: 'Swiss Alps',
    location: 'Zermatt, Switzerland',
    priceFrom: 3695,
    image: 'https://picsum.photos/seed/swiss-agoua/500/650',
  },
  {
    key: 'santorini',
    name: 'Santorini',
    location: 'Cyclades, Greece',
    priceFrom: 2850,
    image: 'https://picsum.photos/seed/santorini-agoua/500/650',
  },
  {
    key: 'kyoto',
    name: 'Kyoto',
    location: 'Kansai, Japan',
    priceFrom: 3340,
    image: 'https://picsum.photos/seed/kyoto-agoua/500/650',
  },
];

// Filter rail on the destinations results screen. The first is the default.
export const DESTINATION_FILTERS = ['Beach', 'Mountain', 'City', 'Island', 'Desert'] as const;

export type DestinationFilter = (typeof DESTINATION_FILTERS)[number];

export type DestinationResult = {
  key: string;
  name: string;
  operator: string;
  guests: number;
  rating: number;
  reviews: string;
  highlights: string[];
  perNight: number;
  perWeek: number;
  // Swiped as a carousel on the results card; the first is also the detail
  // screen's hero.
  images: string[];
  filter: DestinationFilter;
};

export const DESTINATION_RESULTS: DestinationResult[] = [
  {
    key: 'maldives-villas',
    name: 'Overwater Villas',
    operator: 'South Male Atoll',
    guests: 6,
    rating: 4.8,
    reviews: '1.3k',
    highlights: ['Snorkelling gear', 'Private deck', 'Half board'],
    perNight: 940,
    perWeek: 5900,
    images: [
      'https://picsum.photos/seed/maldives-agoua-1/800/520',
      'https://picsum.photos/seed/maldives-agoua-2/800/520',
      'https://picsum.photos/seed/maldives-agoua-3/800/520',
    ],
    filter: 'Beach',
  },
  {
    key: 'santorini-caves',
    name: 'Cliffside Cave Suites',
    operator: 'Oia, Cyclades',
    guests: 4,
    rating: 4.6,
    reviews: '3.3k',
    highlights: ['Caldera view', 'Plunge pool', 'Breakfast', 'Wi-Fi'],
    perNight: 720,
    perWeek: 4300,
    images: [
      'https://picsum.photos/seed/santorini-agoua-1/800/520',
      'https://picsum.photos/seed/santorini-agoua-2/800/520',
      'https://picsum.photos/seed/santorini-agoua-3/800/520',
    ],
    filter: 'Beach',
  },
  {
    key: 'zermatt-chalets',
    name: 'Alpine Chalets',
    operator: 'Zermatt, Switzerland',
    guests: 8,
    rating: 4.7,
    reviews: '4.3k',
    highlights: ['Ski-in access', 'Log fire', 'Sauna'],
    perNight: 1180,
    perWeek: 7400,
    images: [
      'https://picsum.photos/seed/swiss-agoua-1/800/520',
      'https://picsum.photos/seed/swiss-agoua-2/800/520',
      'https://picsum.photos/seed/swiss-agoua-3/800/520',
    ],
    filter: 'Mountain',
  },
  {
    key: 'dolomites-lodges',
    name: 'Ridge Lodges',
    operator: 'Cortina, Dolomites',
    guests: 5,
    rating: 4.5,
    reviews: '900',
    highlights: ['Guided hikes', 'Mountain spa', 'Wi-Fi'],
    perNight: 860,
    perWeek: 5200,
    images: [
      'https://picsum.photos/seed/dolomites-agoua-1/800/520',
      'https://picsum.photos/seed/dolomites-agoua-2/800/520',
      'https://picsum.photos/seed/dolomites-agoua-3/800/520',
    ],
    filter: 'Mountain',
  },
  {
    key: 'kyoto-machiya',
    name: 'Machiya Townhouses',
    operator: 'Gion, Kyoto',
    guests: 4,
    rating: 4.9,
    reviews: '2.1k',
    highlights: ['Tea ceremony', 'Garden bath', 'Bike hire'],
    perNight: 690,
    perWeek: 4100,
    images: [
      'https://picsum.photos/seed/kyoto-agoua-1/800/520',
      'https://picsum.photos/seed/kyoto-agoua-2/800/520',
      'https://picsum.photos/seed/kyoto-agoua-3/800/520',
    ],
    filter: 'City',
  },
  {
    key: 'lisbon-lofts',
    name: 'Alfama Lofts',
    operator: 'Alfama, Lisbon',
    guests: 3,
    rating: 4.4,
    reviews: '1.8k',
    highlights: ['River view', 'Rooftop', 'Wi-Fi'],
    perNight: 520,
    perWeek: 3100,
    images: [
      'https://picsum.photos/seed/lisbon-agoua-1/800/520',
      'https://picsum.photos/seed/lisbon-agoua-2/800/520',
      'https://picsum.photos/seed/lisbon-agoua-3/800/520',
    ],
    filter: 'City',
  },
  {
    key: 'palawan-huts',
    name: 'Lagoon Huts',
    operator: 'El Nido, Palawan',
    guests: 4,
    rating: 4.6,
    reviews: '760',
    highlights: ['Kayaks', 'Reef tours', 'Beach bar'],
    perNight: 610,
    perWeek: 3600,
    images: [
      'https://picsum.photos/seed/palawan-agoua-1/800/520',
      'https://picsum.photos/seed/palawan-agoua-2/800/520',
      'https://picsum.photos/seed/palawan-agoua-3/800/520',
    ],
    filter: 'Island',
  },
  {
    key: 'wahiba-camp',
    name: 'Dune Camp',
    operator: 'Wahiba Sands',
    guests: 6,
    rating: 4.5,
    reviews: '1.1k',
    highlights: ['Stargazing deck', 'Dune drive', 'Full board'],
    perNight: 780,
    perWeek: 4600,
    images: [
      'https://picsum.photos/seed/wahiba-agoua-1/800/520',
      'https://picsum.photos/seed/wahiba-agoua-2/800/520',
      'https://picsum.photos/seed/wahiba-agoua-3/800/520',
    ],
    filter: 'Desert',
  },
  {
    key: 'amalfi-terraces',
    name: 'Cliff Terraces',
    operator: 'Positano, Amalfi',
    guests: 4,
    rating: 4.7,
    reviews: '2.4k',
    highlights: ['Sea terrace', 'Lemon garden', 'Boat transfer'],
    perNight: 890,
    perWeek: 5400,
    images: [
      'https://picsum.photos/seed/amalfi-agoua-1/800/520',
      'https://picsum.photos/seed/amalfi-agoua-2/800/520',
      'https://picsum.photos/seed/amalfi-agoua-3/800/520',
    ],
    filter: 'Beach',
  },
  {
    key: 'tulum-cabanas',
    name: 'Jungle Cabanas',
    operator: 'Tulum, Quintana Roo',
    guests: 2,
    rating: 4.3,
    reviews: '1.5k',
    highlights: ['Cenote access', 'Open-air shower', 'Yoga deck'],
    perNight: 470,
    perWeek: 2800,
    images: [
      'https://picsum.photos/seed/tulum-agoua-1/800/520',
      'https://picsum.photos/seed/tulum-agoua-2/800/520',
      'https://picsum.photos/seed/tulum-agoua-3/800/520',
    ],
    filter: 'Beach',
  },
  {
    key: 'patagonia-refugios',
    name: 'Glacier Refugios',
    operator: 'Torres del Paine',
    guests: 4,
    rating: 4.8,
    reviews: '640',
    highlights: ['Glacier trek', 'Full board', 'Ranger guide'],
    perNight: 1040,
    perWeek: 6300,
    images: [
      'https://picsum.photos/seed/patagonia-agoua-1/800/520',
      'https://picsum.photos/seed/patagonia-agoua-2/800/520',
      'https://picsum.photos/seed/patagonia-agoua-3/800/520',
    ],
    filter: 'Mountain',
  },
  {
    key: 'marrakech-riads',
    name: 'Medina Riads',
    operator: 'Medina, Marrakech',
    guests: 6,
    rating: 4.6,
    reviews: '2.9k',
    highlights: ['Courtyard pool', 'Rooftop dinner', 'Hammam'],
    perNight: 560,
    perWeek: 3300,
    images: [
      'https://picsum.photos/seed/marrakech-agoua-1/800/520',
      'https://picsum.photos/seed/marrakech-agoua-2/800/520',
      'https://picsum.photos/seed/marrakech-agoua-3/800/520',
    ],
    filter: 'City',
  },
  {
    key: 'istanbul-konak',
    name: 'Bosphorus Konak',
    operator: 'Sultanahmet, Istanbul',
    guests: 5,
    rating: 4.5,
    reviews: '1.2k',
    highlights: ['Strait view', 'Turkish bath', 'Breakfast'],
    perNight: 640,
    perWeek: 3800,
    images: [
      'https://picsum.photos/seed/istanbul-agoua-1/800/520',
      'https://picsum.photos/seed/istanbul-agoua-2/800/520',
      'https://picsum.photos/seed/istanbul-agoua-3/800/520',
    ],
    filter: 'City',
  },
  {
    key: 'azores-cottages',
    name: 'Crater Cottages',
    operator: 'São Miguel, Azores',
    guests: 4,
    rating: 4.7,
    reviews: '520',
    highlights: ['Hot springs', 'Whale watching', 'Wi-Fi'],
    perNight: 580,
    perWeek: 3400,
    images: [
      'https://picsum.photos/seed/azores-agoua-1/800/520',
      'https://picsum.photos/seed/azores-agoua-2/800/520',
      'https://picsum.photos/seed/azores-agoua-3/800/520',
    ],
    filter: 'Island',
  },
  {
    key: 'atacama-domes',
    name: 'Stargazer Domes',
    operator: 'San Pedro de Atacama',
    guests: 2,
    rating: 4.9,
    reviews: '880',
    highlights: ['Observatory night', 'Salt flat tour', 'Full board'],
    perNight: 820,
    perWeek: 4900,
    images: [
      'https://picsum.photos/seed/atacama-agoua-1/800/520',
      'https://picsum.photos/seed/atacama-agoua-2/800/520',
      'https://picsum.photos/seed/atacama-agoua-3/800/520',
    ],
    filter: 'Desert',
  },
  {
    key: 'ubud-villas',
    name: 'Jungle Villas',
    operator: 'Ubud, Bali',
    guests: 4,
    rating: 4.8,
    reviews: '1.9k',
    highlights: ['Rice terrace view', 'Private pool', 'Yoga pavilion'],
    perNight: 660,
    perWeek: 3900,
    images: [
      'https://picsum.photos/seed/ubud-agoua-1/800/520',
      'https://picsum.photos/seed/ubud-agoua-2/800/520',
      'https://picsum.photos/seed/ubud-agoua-3/800/520',
    ],
    filter: 'Island',
  },
  {
    key: 'seminyak-suites',
    name: 'Beachfront Suites',
    operator: 'Seminyak, Bali',
    guests: 2,
    rating: 4.5,
    reviews: '2.6k',
    highlights: ['Sunset beach club', 'Spa credit', 'Breakfast'],
    perNight: 720,
    perWeek: 4300,
    images: [
      'https://picsum.photos/seed/seminyak-agoua-1/800/520',
      'https://picsum.photos/seed/seminyak-agoua-2/800/520',
      'https://picsum.photos/seed/seminyak-agoua-3/800/520',
    ],
    filter: 'Beach',
  },
  {
    key: 'nusa-penida-cliffs',
    name: 'Cliff Cabins',
    operator: 'Nusa Penida, Bali',
    guests: 3,
    rating: 4.7,
    reviews: '840',
    highlights: ['Kelingking viewpoint', 'Snorkel trip', 'Scooter hire'],
    perNight: 540,
    perWeek: 3200,
    images: [
      'https://picsum.photos/seed/nusapenida-agoua-1/800/520',
      'https://picsum.photos/seed/nusapenida-agoua-2/800/520',
      'https://picsum.photos/seed/nusapenida-agoua-3/800/520',
    ],
    filter: 'Island',
  },
  {
    key: 'halong-junks',
    name: 'Overnight Junks',
    operator: 'Ha Long Bay, Vietnam',
    guests: 4,
    rating: 4.6,
    reviews: '1.4k',
    highlights: ['Cave kayaking', 'Sunset deck', 'Full board'],
    perNight: 480,
    perWeek: 2900,
    images: [
      'https://picsum.photos/seed/halong-agoua-1/800/520',
      'https://picsum.photos/seed/halong-agoua-2/800/520',
      'https://picsum.photos/seed/halong-agoua-3/800/520',
    ],
    filter: 'Island',
  },
  {
    key: 'cusco-casonas',
    name: 'Colonial Casonas',
    operator: 'San Blas, Cusco',
    guests: 5,
    rating: 4.7,
    reviews: '2.2k',
    highlights: ['Sacred Valley tour', 'Courtyard breakfast', 'Altitude support'],
    perNight: 500,
    perWeek: 3000,
    images: [
      'https://picsum.photos/seed/cusco-agoua-1/800/520',
      'https://picsum.photos/seed/cusco-agoua-2/800/520',
      'https://picsum.photos/seed/cusco-agoua-3/800/520',
    ],
    filter: 'City',
  },
  {
    key: 'banff-cabins',
    name: 'Lakeside Cabins',
    operator: 'Banff, Alberta',
    guests: 6,
    rating: 4.8,
    reviews: '1.7k',
    highlights: ['Canoe hire', 'Hot springs pass', 'Log fire'],
    perNight: 900,
    perWeek: 5500,
    images: [
      'https://picsum.photos/seed/banff-agoua-1/800/520',
      'https://picsum.photos/seed/banff-agoua-2/800/520',
      'https://picsum.photos/seed/banff-agoua-3/800/520',
    ],
    filter: 'Mountain',
  },
  {
    key: 'serengeti-camps',
    name: 'Migration Camps',
    operator: 'Serengeti, Tanzania',
    guests: 4,
    rating: 4.9,
    reviews: '610',
    highlights: ['Dawn game drives', 'Balloon safari', 'Full board'],
    perNight: 1350,
    perWeek: 8200,
    images: [
      'https://picsum.photos/seed/serengeti-agoua-1/800/520',
      'https://picsum.photos/seed/serengeti-agoua-2/800/520',
      'https://picsum.photos/seed/serengeti-agoua-3/800/520',
    ],
    filter: 'Desert',
  },
];
