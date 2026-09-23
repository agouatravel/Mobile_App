import type { Ionicons } from '@expo/vector-icons';
import type { ImageSource } from 'expo-image';

import { formatPrice } from '@/constants/currency';

// Region rail on the Explore screen. The first is the default selection.
export const EXPLORE_REGIONS = [
  'Asia',
  'Europe',
  'South America',
  'North America',
  'Africa',
] as const;

export type ExploreRegion = (typeof EXPLORE_REGIONS)[number];

// One tile in the strip that straddles the hero's lower edge. `value` is what
// the tile shouts and `label` is the small line under it, so they are stored
// apart rather than as one sentence the screen would have to split.
export type PlaceStat = {
  value: string;
  label: string;
};

// The wide feature card under the summary. It carries its own photograph
// rather than reusing the hero, since the whole point of it is somewhere the
// hero shot does not show.
export type HiddenGem = {
  title: string;
  blurb: string;
  image: string;
};

// A spot a local would name, with how they'd say it. `nativeName` is the local
// term romanised — Latin script only, so it stays readable to everyone and
// needs no font beyond the system one — and `gloss` translates it. The two are
// stored apart because the card styles them differently.
export type PlaceLocal = {
  key: string;
  name: string;
  nativeName: string;
  gloss: string;
  image: string;
};

export type ExplorePlace = {
  key: string;
  country: string;
  name: string;
  rating: number;
  reviews: number;
  summary: string;
  highlights: string[];
  image: string;
  region: ExploreRegion;
  weather: PlaceStat;
  trending: PlaceStat;
  hiddenGem: HiddenGem;
  locals: PlaceLocal[];
};

// Placeholder photography — swap for real destination shots later.
export const EXPLORE_PLACES: ExplorePlace[] = [
  {
    key: 'bali',
    country: 'Indonesia',
    name: 'Bali',
    rating: 5.0,
    reviews: 213,
    summary:
      'Terraced rice fields, volcanic ridgelines and temple gates that open straight onto the sea.',
    highlights: ['Ubud rice terraces', 'Temple sunrise tour', 'Reef diving'],
    image: 'https://picsum.photos/seed/agoua-bali/700/1000',
    region: 'Asia',
    weather: { value: '26°', label: 'Sunny and dry' },
    trending: { value: '+38%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Nusa Penida sea caves',
      blurb: 'Cut into the cliffs below Kelingking, and empty before the first boat lands.',
      image: 'https://picsum.photos/seed/agoua-gem-bali/900/560',
    },
    locals: [
      {
        key: 'tanah-lot',
        name: 'Tanah Lot',
        nativeName: 'Pura Tanah Lot',
        gloss: 'temple on the land in the sea',
        image: 'https://picsum.photos/seed/agoua-local-bali-tanahlot/600/800',
      },
      {
        key: 'tegallalang',
        name: 'Tegallalang',
        nativeName: 'Subak',
        gloss: 'the rice-water brotherhood',
        image: 'https://picsum.photos/seed/agoua-local-bali-tegallalang/600/800',
      },
      {
        key: 'uluwatu',
        name: 'Uluwatu',
        nativeName: 'Kecak',
        gloss: 'the fire and chant dance',
        image: 'https://picsum.photos/seed/agoua-local-bali-uluwatu/600/800',
      },
    ],
  },
  {
    key: 'kyoto',
    country: 'Japan',
    name: 'Kyoto',
    rating: 4.9,
    reviews: 486,
    summary:
      'Machiya lanes, moss gardens and a thousand shrine gates threaded up the hillside.',
    highlights: ['Fushimi Inari trail', 'Tea ceremony', 'Arashiyama grove'],
    image: 'https://picsum.photos/seed/agoua-kyoto/700/1000',
    region: 'Asia',
    weather: { value: '18°', label: 'Clear most days' },
    trending: { value: '+21%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Kurama mountain onsen',
      blurb: 'An hour north on the local line, with baths looking straight into cedar forest.',
      image: 'https://picsum.photos/seed/agoua-gem-kyoto/900/560',
    },
    locals: [
      {
        key: 'fushimi',
        name: 'Fushimi Inari',
        nativeName: 'Senbon Torii',
        gloss: 'the thousand gates',
        image: 'https://picsum.photos/seed/agoua-local-kyoto-fushimi/600/800',
      },
      {
        key: 'kiyomizu',
        name: 'Kiyomizu Temple',
        nativeName: 'Kiyomizu-dera',
        gloss: 'pure water temple',
        image: 'https://picsum.photos/seed/agoua-local-kyoto-kiyomizu/600/800',
      },
      {
        key: 'arashiyama',
        name: 'Arashiyama',
        nativeName: 'Chikurin',
        gloss: 'the bamboo grove',
        image: 'https://picsum.photos/seed/agoua-local-kyoto-arashiyama/600/800',
      },
    ],
  },
  {
    key: 'halong',
    country: 'Vietnam',
    name: 'Ha Long Bay',
    rating: 4.8,
    reviews: 312,
    summary:
      'Limestone karsts rising out of jade water, best seen from the deck of a slow junk.',
    highlights: ['Overnight junk', 'Kayak the caves', 'Floating villages'],
    image: 'https://picsum.photos/seed/agoua-halong/700/1000',
    region: 'Asia',
    weather: { value: '24°', label: 'Light sea haze' },
    trending: { value: '+14%', label: 'Searches this month' },
    hiddenGem: {
      title: "Bai Tu Long's quieter arm",
      blurb: 'The same karsts as the main bay, with a fraction of the junks under them.',
      image: 'https://picsum.photos/seed/agoua-gem-halong/900/560',
    },
    locals: [
      {
        key: 'sung-sot',
        name: 'Sung Sot Cave',
        nativeName: 'Hang Sửng Sốt',
        gloss: 'the cave of surprises',
        image: 'https://picsum.photos/seed/agoua-local-halong-sungsot/600/800',
      },
      {
        key: 'cat-ba',
        name: 'Cat Ba Island',
        nativeName: 'Cát Bà',
        gloss: "the women's isle",
        image: 'https://picsum.photos/seed/agoua-local-halong-catba/600/800',
      },
      {
        key: 'vung-vieng',
        name: 'Vung Vieng',
        nativeName: 'Làng chài',
        gloss: 'the floating fishing village',
        image: 'https://picsum.photos/seed/agoua-local-halong-vungvieng/600/800',
      },
    ],
  },
  {
    key: 'santorini',
    country: 'Greece',
    name: 'Santorini',
    rating: 4.9,
    reviews: 728,
    summary:
      'Whitewashed terraces stacked down a caldera wall, facing one of the great sunsets.',
    highlights: ['Caldera walk', 'Vineyard tasting', 'Catamaran sunset'],
    image: 'https://picsum.photos/seed/agoua-santorini/700/1000',
    region: 'Europe',
    weather: { value: '27°', label: 'Bright to September' },
    trending: { value: '+29%', label: 'Searches this month' },
    hiddenGem: {
      title: 'The Ammoudi Bay steps',
      blurb: 'Three hundred steps below Oia, ending at tavernas built onto the rock.',
      image: 'https://picsum.photos/seed/agoua-gem-santorini/900/560',
    },
    locals: [
      {
        key: 'oia',
        name: 'Oia',
        nativeName: 'Apano Meria',
        gloss: 'the upper side, as locals still say',
        image: 'https://picsum.photos/seed/agoua-local-santorini-oia/600/800',
      },
      {
        key: 'akrotiri',
        name: 'The buried city',
        nativeName: 'Akrotiri',
        gloss: 'the headland',
        image: 'https://picsum.photos/seed/agoua-local-santorini-akrotiri/600/800',
      },
      {
        key: 'assyrtiko',
        name: 'Basket vines',
        nativeName: 'Assyrtiko',
        gloss: 'the grape trained in coils',
        image: 'https://picsum.photos/seed/agoua-local-santorini-assyrtiko/600/800',
      },
    ],
  },
  {
    key: 'dolomites',
    country: 'Italy',
    name: 'Dolomites',
    rating: 4.7,
    reviews: 194,
    summary:
      'Pale limestone towers over alpine meadow, laced with cable cars and mountain huts.',
    highlights: ['Via ferrata', 'Alpine huts', 'Lake Braies'],
    image: 'https://picsum.photos/seed/agoua-dolomites/700/1000',
    region: 'Europe',
    weather: { value: '16°', label: 'Cool on the passes' },
    trending: { value: '+12%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Val di Funes at first light',
      blurb: 'The valley the postcards use, photographed before the coaches reach it.',
      image: 'https://picsum.photos/seed/agoua-gem-dolomites/900/560',
    },
    locals: [
      {
        key: 'braies',
        name: 'Lago di Braies',
        nativeName: 'Lech de Braies',
        gloss: 'the green lake, in Ladin',
        image: 'https://picsum.photos/seed/agoua-local-dolomites-braies/600/800',
      },
      {
        key: 'ferrata',
        name: 'Via Ferrata',
        nativeName: 'Via ferrata',
        gloss: 'the iron way',
        image: 'https://picsum.photos/seed/agoua-local-dolomites-ferrata/600/800',
      },
      {
        key: 'rifugio',
        name: 'Rifugio Lagazuoi',
        nativeName: 'Rifugio',
        gloss: 'the hut that takes you in',
        image: 'https://picsum.photos/seed/agoua-local-dolomites-rifugio/600/800',
      },
    ],
  },
  {
    key: 'lisbon',
    country: 'Portugal',
    name: 'Lisbon',
    rating: 4.6,
    reviews: 405,
    summary:
      'Tiled facades, hill trams and a river light that flatters everything it touches.',
    highlights: ['Alfama by tram', 'Belem pastries', 'Sintra day trip'],
    image: 'https://picsum.photos/seed/agoua-lisbon/700/1000',
    region: 'Europe',
    weather: { value: '22°', label: 'Breezy off the river' },
    trending: { value: '+18%', label: 'Searches this month' },
    hiddenGem: {
      title: 'The LX Factory rooftops',
      blurb: 'A print works turned into bookshops and terraces, under the bridge.',
      image: 'https://picsum.photos/seed/agoua-gem-lisbon/900/560',
    },
    locals: [
      {
        key: 'fado',
        name: 'Alfama',
        nativeName: 'Fado',
        gloss: 'the song of longing',
        image: 'https://picsum.photos/seed/agoua-local-lisbon-fado/600/800',
      },
      {
        key: 'nata',
        name: 'Belém',
        nativeName: 'Pastel de nata',
        gloss: 'the custard tart, still warm',
        image: 'https://picsum.photos/seed/agoua-local-lisbon-nata/600/800',
      },
      {
        key: 'miradouro',
        name: 'Graça',
        nativeName: 'Miradouro',
        gloss: 'the terrace you look out from',
        image: 'https://picsum.photos/seed/agoua-local-lisbon-miradouro/600/800',
      },
    ],
  },
  {
    key: 'patagonia',
    country: 'Argentina',
    name: 'Patagonia',
    rating: 4.9,
    reviews: 168,
    summary:
      'Granite spires, glacier faces and wind that makes the whole horizon feel unclaimed.',
    highlights: ['Torres base trek', 'Glacier cruise', 'Estancia stay'],
    image: 'https://picsum.photos/seed/agoua-patagonia/700/1000',
    region: 'South America',
    weather: { value: '11°', label: 'Standing wind' },
    trending: { value: '+9%', label: 'Searches this month' },
    hiddenGem: {
      title: 'The Laguna Torre lookout',
      blurb: 'A flat two hours from El Chaltén for the whole Torre skyline.',
      image: 'https://picsum.photos/seed/agoua-gem-patagonia/900/560',
    },
    locals: [
      {
        key: 'paine',
        name: 'Torres del Paine',
        nativeName: 'Paine',
        gloss: 'blue, in Tehuelche',
        image: 'https://picsum.photos/seed/agoua-local-patagonia-paine/600/800',
      },
      {
        key: 'estancia',
        name: 'Estancia',
        nativeName: 'Estancia',
        gloss: 'the sheep ranch that feeds you',
        image: 'https://picsum.photos/seed/agoua-local-patagonia-estancia/600/800',
      },
      {
        key: 'moreno',
        name: 'Perito Moreno',
        nativeName: 'Glaciar',
        gloss: 'the ice that is still moving',
        image: 'https://picsum.photos/seed/agoua-local-patagonia-moreno/600/800',
      },
    ],
  },
  {
    key: 'cusco',
    country: 'Peru',
    name: 'Cusco',
    rating: 4.8,
    reviews: 521,
    summary:
      'Inca stonework under colonial arcades, and the trailhead for the whole Sacred Valley.',
    highlights: ['Sacred Valley', 'Rainbow Mountain', 'San Pedro market'],
    image: 'https://picsum.photos/seed/agoua-cusco/700/1000',
    region: 'South America',
    weather: { value: '19°', label: 'Mild in the valley' },
    trending: { value: '+16%', label: 'Searches this month' },
    hiddenGem: {
      title: 'The Maras salt terraces',
      blurb: 'Thousands of shallow pans, worked by hand since before the Inca.',
      image: 'https://picsum.photos/seed/agoua-gem-cusco/900/560',
    },
    locals: [
      {
        key: 'saqsaywaman',
        name: 'Sacsayhuamán',
        nativeName: 'Saqsaywaman',
        gloss: 'the royal hawk',
        image: 'https://picsum.photos/seed/agoua-local-cusco-saqsaywaman/600/800',
      },
      {
        key: 'qorikancha',
        name: 'Qorikancha',
        nativeName: 'Qorikancha',
        gloss: 'the golden court',
        image: 'https://picsum.photos/seed/agoua-local-cusco-qorikancha/600/800',
      },
      {
        key: 'pachamanca',
        name: 'Pachamanca',
        nativeName: 'Pachamanka',
        gloss: 'cooked in the earth',
        image: 'https://picsum.photos/seed/agoua-local-cusco-pachamanca/600/800',
      },
    ],
  },
  {
    key: 'banff',
    country: 'Canada',
    name: 'Banff',
    rating: 4.8,
    reviews: 379,
    summary:
      'Turquoise lakes held in a ring of Rockies, with hot springs at the end of the day.',
    highlights: ['Lake Louise canoe', 'Gondola ridge walk', 'Hot springs'],
    image: 'https://picsum.photos/seed/agoua-banff/700/1000',
    region: 'North America',
    weather: { value: '14°', label: 'Colder up top' },
    trending: { value: '+11%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Johnston Canyon at first light',
      blurb: 'Catwalks bolted to the gorge wall, walkable before the crowds arrive.',
      image: 'https://picsum.photos/seed/agoua-gem-banff/900/560',
    },
    locals: [
      {
        key: 'louise',
        name: 'Lake Louise',
        nativeName: 'Ho-run-num-nay',
        gloss: 'lake of the little fishes',
        image: 'https://picsum.photos/seed/agoua-local-banff-louise/600/800',
      },
      {
        key: 'moraine',
        name: 'Moraine Lake',
        nativeName: 'Wenkchemna',
        gloss: 'the ten peaks',
        image: 'https://picsum.photos/seed/agoua-local-banff-moraine/600/800',
      },
      {
        key: 'minnewanka',
        name: 'Lake Minnewanka',
        nativeName: 'Minn-waki',
        gloss: 'water of the spirits',
        image: 'https://picsum.photos/seed/agoua-local-banff-minnewanka/600/800',
      },
    ],
  },
  {
    key: 'tulum',
    country: 'Mexico',
    name: 'Tulum',
    rating: 4.5,
    reviews: 642,
    summary:
      'Cliff-top ruins over the Caribbean, with cenotes cut into the jungle behind.',
    highlights: ['Cenote swim', 'Mayan ruins', 'Beach clubs'],
    image: 'https://picsum.photos/seed/agoua-tulum/700/1000',
    region: 'North America',
    weather: { value: '29°', label: 'Humid by afternoon' },
    trending: { value: '+24%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Cenote Calavera',
      blurb: 'A skull-shaped opening in the jungle floor, quiet before nine.',
      image: 'https://picsum.photos/seed/agoua-gem-tulum/900/560',
    },
    locals: [
      {
        key: 'zama',
        name: 'Tulum ruins',
        nativeName: 'Zamá',
        gloss: 'the city of dawn',
        image: 'https://picsum.photos/seed/agoua-local-tulum-zama/600/800',
      },
      {
        key: 'dzonot',
        name: 'The cenotes',
        nativeName: "Ts'onot",
        gloss: 'the sacred well',
        image: 'https://picsum.photos/seed/agoua-local-tulum-cenote/600/800',
      },
      {
        key: 'sian-kaan',
        name: "Sian Ka'an",
        nativeName: "Sian Ka'an",
        gloss: 'where the sky is born',
        image: 'https://picsum.photos/seed/agoua-local-tulum-siankaan/600/800',
      },
    ],
  },
  {
    key: 'marrakesh',
    country: 'Morocco',
    name: 'Marrakesh',
    rating: 4.7,
    reviews: 288,
    summary:
      'Souks, riad courtyards and the Atlas foothills an hour from the medina walls.',
    highlights: ['Medina souks', 'Atlas day trip', 'Majorelle garden'],
    image: 'https://picsum.photos/seed/agoua-marrakesh/700/1000',
    region: 'Africa',
    weather: { value: '30°', label: 'Hot in the medina' },
    trending: { value: '+20%', label: 'Searches this month' },
    hiddenGem: {
      title: 'Le Jardin Secret',
      blurb: 'A restored riad garden that most of the souk walks straight past.',
      image: 'https://picsum.photos/seed/agoua-gem-marrakesh/900/560',
    },
    locals: [
      {
        key: 'jemaa',
        name: 'The main square',
        nativeName: 'Jemaa el-Fnaa',
        gloss: 'the assembly at the end',
        image: 'https://picsum.photos/seed/agoua-local-marrakesh-jemaa/600/800',
      },
      {
        key: 'riad',
        name: 'Courtyard houses',
        nativeName: 'Riad',
        gloss: 'a garden with the house around it',
        image: 'https://picsum.photos/seed/agoua-local-marrakesh-riad/600/800',
      },
      {
        key: 'majorelle',
        name: 'Majorelle',
        nativeName: 'Jardin Majorelle',
        gloss: 'the blue garden',
        image: 'https://picsum.photos/seed/agoua-local-marrakesh-majorelle/600/800',
      },
    ],
  },
  {
    key: 'serengeti',
    country: 'Tanzania',
    name: 'Serengeti',
    rating: 4.9,
    reviews: 147,
    summary:
      'Open grassland carrying the migration, and skies that go on well past the light.',
    highlights: ['Great migration', 'Balloon safari', 'Maasai village'],
    image: 'https://picsum.photos/seed/agoua-serengeti/700/1000',
    region: 'Africa',
    weather: { value: '25°', label: 'Dry, cool at dawn' },
    trending: { value: '+15%', label: 'Searches this month' },
    hiddenGem: {
      title: 'The Moru Kopjes',
      blurb: 'Granite islands standing out of the grass, with rock art and resident lion.',
      image: 'https://picsum.photos/seed/agoua-gem-serengeti/900/560',
    },
    locals: [
      {
        key: 'siringet',
        name: 'Serengeti',
        nativeName: 'Siringet',
        gloss: 'the place where the land runs on',
        image: 'https://picsum.photos/seed/agoua-local-serengeti-siringet/600/800',
      },
      {
        key: 'ngorongoro',
        name: 'Ngorongoro',
        nativeName: 'Ngorongoro',
        gloss: 'the sound of the cowbell',
        image: 'https://picsum.photos/seed/agoua-local-serengeti-ngorongoro/600/800',
      },
      {
        key: 'boma',
        name: 'Maasai boma',
        nativeName: 'Boma',
        gloss: 'the thorn-fenced homestead',
        image: 'https://picsum.photos/seed/agoua-local-serengeti-boma/600/800',
      },
    ],
  },
];

export type ExploreCollection = {
  key: string;
  title: string;
  // How many places the collection holds, shown as the card's subtitle.
  count: number;
  image: string;
};

// Editorial groupings under the region carousel — a way into the catalogue that
// cuts across region, which the carousel above cannot express. The price label
// goes through formatPrice so the currency stays in one place.
export const EXPLORE_COLLECTIONS: ExploreCollection[] = [
  {
    key: 'value',
    title: `${formatPrice(3000)} and under`,
    count: 12,
    image: 'https://picsum.photos/seed/agoua-collection-value/600/400',
  },
  {
    key: 'solo',
    title: 'Solo travel',
    count: 8,
    image: 'https://picsum.photos/seed/agoua-collection-solo/600/400',
  },
  {
    key: 'week',
    title: '7-day escapes',
    count: 10,
    image: 'https://picsum.photos/seed/agoua-collection-week/600/400',
  },
  {
    key: 'family',
    title: 'Family friendly',
    count: 15,
    image: 'https://picsum.photos/seed/agoua-collection-family/600/400',
  },
];

// Agoua's own service artwork, one file per category, keyed by the same string
// the category is. These replaced Microsoft's Fluent 3D emoji, which stood in
// while there was nothing else: those were generic — a wrapped gift for
// Packages, a plain automobile for Car Rental — and were fetched from a CDN,
// so the row came up empty on a cold start with no network.
//
// Bundled rather than remote, which is why each one is written out. Metro
// resolves `require` at build time and cannot take a computed path, so a map
// keyed by category is the only way to hold them together; a lookup helper
// would have to be handed the literal anyway.
//
// SVG, and Metro lists `svg` in its default `assetExts`, so these resolve to
// plain assets — no transformer, and `react-native-svg` is not in the path.
// expo-image decodes them natively either side: Glide's SVG decoder on
// Android, SDWebImageSVGCoder on iOS, the `<img>` tag on web.
//
// The files are named for the category key rather than as they were delivered
// ("CAR RENTAL.svg", "IDP.svg"). Android flattens bundled assets into drawable
// resources, whose names may only be lowercase alphanumerics and underscores,
// so a space in the filename is not something to leave to that rewrite.
const ICONS = {
  packages: require('@/assets/icons/svg_icons/packages.svg'),
  flights: require('@/assets/icons/svg_icons/flights.svg'),
  hotels: require('@/assets/icons/svg_icons/hotels.svg'),
  visas: require('@/assets/icons/svg_icons/visas.svg'),
  idl: require('@/assets/icons/svg_icons/idl.svg'),
  'car-rental': require('@/assets/icons/svg_icons/car-rental.svg'),
  transfers: require('@/assets/icons/svg_icons/transfers.svg'),
  tours: require('@/assets/icons/svg_icons/tours.svg'),
  trains: require('@/assets/icons/svg_icons/trains.svg'),
  cruise: require('@/assets/icons/svg_icons/cruise.svg'),
} as const;

export type ExploreCategory = {
  key: keyof typeof ICONS;
  label: string;
  detail: string;
  // The service's hero object: a full-colour render, one per service.
  //
  // Nothing draws this today. It was what the compact tiles used, and they
  // draw `glyph` now — ten photographic objects shrunk to 40pt read as ten
  // different pictures rather than as one set. The field is held, not
  // abandoned: this is the slot the new cinematic artwork lands in, for each
  // service's own screen where there is room to run it large.
  //
  // Worth knowing while it sits unused: the ten files are PNGs base64'd inside
  // an SVG wrapper, about 1.5 MB each, ~14 MB in the bundle for artwork no
  // screen currently shows.
  icon: ImageSource;
  // The line glyph the service grids draw. Ionicons outline set — a stroke of
  // one weight across all ten, which is what makes a row of them read as a set
  // rather than as ten pictures that happen to share a page.
  //
  // It is not a replacement for `icon` below: that is the cinematic hero
  // object for the service's own screen, where there is room for it. Compact
  // rows get the glyph, detail screens get the object.
  glyph: keyof typeof Ionicons.glyphMap;
  // Optical size correction, as a fraction of the box the artwork is given.
  //
  // The ten renders are all cropped to their opaque bounds, so their boxes are
  // the same — but how much of that box each one actually inks is not. The
  // flight's thin diagonal aeroplane covers 12% of its square; the IDL card is
  // a filled rectangle covering 74%. Drawn at one size they read as wildly
  // different weights, the card looking twice the size of the plane.
  //
  // Measured rather than eyeballed: this is the side of the square with the
  // same ink area as the drawing, normalised across the set and damped (a
  // 0.45 exponent) so the correction evens the row out without inflating the
  // sparsest drawings to fill their box. Scaled so the sparsest sits at 1 and
  // the rest come down from it, which keeps every icon inside its frame.
  //
  // Paired with `icon`, and unused for the same reason. Glyphs need no
  // correction — Ionicons draws its outline set on a shared optical grid — so
  // this only comes back into play when the hero objects do. Re-measure it
  // against the new artwork rather than carrying these numbers over: they
  // describe the renders being replaced, not the ones replacing them.
  iconScale: number;
  // What a screen reader should say when `label` is an initialism it would
  // otherwise try to pronounce as a word.
  spoken?: string;
  href: '/offers' | '/destinations' | '/visas';
};

// The ten services Agoua sells, in the order the brand sheet lists them: down
// the left column, then down the right.
//
// `href` lives in the data so the targets can be repointed as the dedicated
// screens land; for now they fall back to Offers and Destinations.
export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    key: 'packages',
    label: 'Packages',
    detail: 'All in one trip',
    icon: ICONS.packages,
    glyph: 'briefcase-outline',
    iconScale: 0.89,
    href: '/offers',
  },
  {
    key: 'flights',
    label: 'Flights',
    detail: 'Best deals',
    icon: ICONS.flights,
    glyph: 'airplane-outline',
    iconScale: 1.0,
    href: '/offers',
  },
  {
    key: 'hotels',
    label: 'Hotels',
    detail: 'Stay in comfort',
    icon: ICONS.hotels,
    glyph: 'bed-outline',
    iconScale: 0.79,
    href: '/offers',
  },
  {
    key: 'visas',
    label: 'Visas',
    detail: 'Hassle free',
    icon: ICONS.visas,
    glyph: 'document-text-outline',
    iconScale: 0.8,
    href: '/visas',
  },
  {
    key: 'idl',
    label: 'IDL',
    detail: 'Drive abroad',
    icon: ICONS.idl,
    glyph: 'card-outline',
    iconScale: 0.72,
    spoken: 'International Driving Licence',
    href: '/offers',
  },
  {
    key: 'car-rental',
    label: 'Car Rental',
    detail: 'Wheels on arrival',
    icon: ICONS['car-rental'],
    glyph: 'car-sport-outline',
    iconScale: 0.93,
    href: '/offers',
  },
  {
    key: 'transfers',
    label: 'Transfers',
    detail: 'Airport & city',
    icon: ICONS.transfers,
    glyph: 'bus-outline',
    iconScale: 0.77,
    href: '/offers',
  },
  {
    key: 'tours',
    label: 'Tours',
    detail: 'Explore more',
    icon: ICONS.tours,
    glyph: 'map-outline',
    iconScale: 0.81,
    href: '/destinations',
  },
  {
    key: 'trains',
    label: 'Trains',
    detail: 'City to city',
    icon: ICONS.trains,
    glyph: 'train-outline',
    iconScale: 0.84,
    href: '/offers',
  },
  {
    key: 'cruise',
    label: 'Cruise',
    detail: 'Sail away',
    icon: ICONS.cruise,
    glyph: 'boat-outline',
    iconScale: 0.75,
    href: '/destinations',
  },
];
