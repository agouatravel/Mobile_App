// The tour catalogue. A tour is the thing Agoua actually sells — a routed,
// multi-day itinerary with a per-person price — which is why it carries its
// own day-by-day plan rather than the per-night stay data the offers screen
// used to be built on. Offers hang a discount on a tour; see offers-data.ts.

export type ItineraryDay = {
  day: number;
  title: string;
  // Places visited that day, rendered as chips under the day title.
  stops: string[];
  description: string;
  // Only set where the day ends somewhere worth naming.
  overnight?: string;
};

export type Tour = {
  key: string;
  name: string;
  // Short label under the operator name — "Grand tour", "Short break".
  tagline: string;
  summary: string;
  // Display form of the journey, e.g. "Riyadh — Jeddah".
  route: string;
  days: number;
  nights: number;
  kind: 'Multi-day' | 'Day trip';
  // Per person, in the app currency. A plain number; screens run it through
  // formatPrice.
  fromPrice: number;
  rating: number;
  reviews: string;
  // A single photograph, used only by the offer cards. The detail screen shows
  // the route instead, so a tour needs no gallery.
  cardImage: string;
  // The tour's route artwork, shown as the hero on the detail screen. Drop a
  // new PNG in assets/images/tours and point this at it.
  mapImage: number;
  // The chip row on the detail page.
  usuallyIncluded: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
};

// Booking terms are Agoua's, not any one tour's, so they live once here rather
// than being copied onto every entry.
export const TERMS_INTRO =
  'By requesting a quotation or confirming a booking with Agoua Travel, you agree to the following terms.';

export const TOUR_TERMS: string[] = [
  'All prices are quoted in Saudi Riyals (SAR) unless another currency is clearly stated in writing, and are subject to change without prior notice.',
  'Quotations are subject to availability at the time of confirmation. We do not hold inventory against a proposal unless we confirm otherwise in writing.',
  'Tour prices, inclusions, and rooming basis apply as described in your confirmed itinerary or invoice. Special conditions from airlines, hotels, or local suppliers may apply.',
  'A booking is confirmed only once you receive written confirmation from Agoua Travel and any required deposit or payment has been received as agreed.',
  'Hotel rooms, room categories, and views are subject to availability at the time the booking is made with the property.',
  'We do not guarantee airline seats, hotel rooms, or other services until they are ticketed, voucher-issued, or confirmed by the supplier. Final availability is known only when we complete the reservation.',
  'Peak-season, holiday, or event surcharges may apply where required by suppliers; these will be advised before confirmation where possible.',
  'Any extra costs due to flight delays, cancellations, schedule changes, denied boarding, or extended stays are the traveller’s responsibility. Agoua Travel is not liable for such expenses but will provide reasonable assistance where we can.',
];

export const OPERATOR = 'Agoua';

export const TOURS: Tour[] = [
  {
    key: 'ksa-grand-tour',
    name: 'The Kingdom of Saudi Arabia Grand Tour',
    tagline: 'Grand tour',
    summary:
      'A complete introduction to Saudi Arabia covering Riyadh heritage, Ushaiqer, Jubbah rock art, AlUla and Hegra, then Yanbu and Jeddah.',
    route: 'Riyadh — Jeddah',
    days: 10,
    nights: 9,
    kind: 'Multi-day',
    fromPrice: 4900,
    rating: 4.9,
    reviews: '210',
    cardImage: 'https://picsum.photos/seed/agoua-tour-grand-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Meals', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival Riyadh',
        stops: ['Riyadh'],
        description: 'Arrive and settle in Riyadh hotel with free time.',
      },
      {
        day: 2,
        title: 'Riyadh Historical Tour',
        stops: ['Murabba Palace', 'Masmak', 'Dira Souq', 'National Museum'],
        description: 'Explore Riyadh heritage sites and traditional market areas.',
      },
      {
        day: 3,
        title: 'Ushaiqer and Buraydah',
        stops: ['Ushaiqer', 'Buraydah'],
        description: 'Visit the mud village lanes, then continue to Qassim and date market.',
      },
      {
        day: 4,
        title: 'Jubbah and Hail',
        stops: ['Jubbah', 'Hail'],
        description: 'Discover UNESCO-listed rock art at Jubbah before overnight in Hail.',
        overnight: 'Hail',
      },
      {
        day: 5,
        title: 'Hail to AlUla',
        stops: ['Hail', 'AlUla'],
        description: 'Drive south to AlUla and walk heritage village and old market areas.',
      },
      {
        day: 6,
        title: 'AlUla and Hegra',
        stops: ['AlUla', 'Hegra'],
        description: 'Visit Hegra UNESCO tombs and Nabataean historical landscapes.',
      },
      {
        day: 7,
        title: 'AlUla to Yanbu',
        stops: ['AlUla', 'Yanbu'],
        description: 'Transfer to Yanbu with optional evening market depending on opening.',
      },
      {
        day: 8,
        title: 'Yanbu to Jeddah',
        stops: ['Yanbu', 'Jeddah'],
        description: 'Optional island cruise and snorkelling, then continue to Jeddah.',
      },
      {
        day: 9,
        title: 'Jeddah Historical',
        stops: ['Al Balad', 'Nassif House', 'Corniche'],
        description: 'Explore old Jeddah, fish market, and waterfront highlights.',
      },
      {
        day: 10,
        title: 'Departure Jeddah',
        stops: ['Jeddah'],
        description: 'Breakfast and departure transfer arrangements.',
      },
    ],
    inclusions: [
      'All transportation with A/C bus.',
      "All nights' accommodation B/B at 3 *** hotel.",
      'Dinners at local restaurants.',
      'English guide at sites.',
      'Entrance fees in Saudi for (Dadan, Ikmah & Hegra).',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'Drinks during meals.',
      'All Lunches.',
      'Airport transfers upon arrival and departure.',
      'Island cruise trip in Yanbu at day 8 morning.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
  {
    key: 'alula-hegra',
    name: 'AlUla and Hegra Discovery',
    tagline: 'Heritage escape',
    summary:
      'Four nights in the oasis valley, taking in Hegra, Dadan and Jabal Ikmah alongside the sandstone country around Sharaan.',
    route: 'AlUla — AlUla',
    days: 5,
    nights: 4,
    kind: 'Multi-day',
    fromPrice: 2650,
    rating: 4.8,
    reviews: '164',
    cardImage: 'https://picsum.photos/seed/agoua-tour-alula-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Meals', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival AlUla',
        stops: ['AlUla'],
        description: 'Arrive and transfer to the hotel, with an evening walk through Old Town.',
        overnight: 'AlUla',
      },
      {
        day: 2,
        title: 'Hegra and Dadan',
        stops: ['Hegra', 'Dadan', 'Jabal Ikmah'],
        description:
          'Nabataean tombs at Hegra, the Dadanite capital, and the inscription canyon at Ikmah.',
      },
      {
        day: 3,
        title: 'Elephant Rock and Sharaan',
        stops: ['Elephant Rock', 'Sharaan Nature Reserve'],
        description: 'Sandstone formations by day and a desert sunset in the reserve.',
      },
      {
        day: 4,
        title: 'Oasis and Old Town',
        stops: ['AlUla Oasis', 'Old Town', 'Maraya'],
        description: 'Walk the palm oasis trail, then the heritage lanes and the mirrored hall.',
      },
      {
        day: 5,
        title: 'Departure AlUla',
        stops: ['AlUla'],
        description: 'Breakfast and transfer to AlUla airport.',
      },
    ],
    inclusions: [
      'All transportation with A/C vehicle.',
      "All nights' accommodation B/B at 4 **** hotel.",
      'English guide at sites.',
      'Entrance fees for Hegra, Dadan and Jabal Ikmah.',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'Domestic flights to and from AlUla.',
      'All Lunches and Dinners.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
  {
    key: 'riyadh-heritage',
    name: 'Riyadh Heritage Short Break',
    tagline: 'Short break',
    summary:
      'Two nights in the capital covering Masmak, the National Museum, Dira Souq and the mud-brick city at At-Turaif.',
    route: 'Riyadh — Riyadh',
    days: 3,
    nights: 2,
    kind: 'Multi-day',
    fromPrice: 1450,
    rating: 4.6,
    reviews: '318',
    cardImage: 'https://picsum.photos/seed/agoua-tour-riyadh-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival Riyadh',
        stops: ['Riyadh'],
        description: 'Arrive, settle into the hotel, and an evening at the Boulevard.',
        overnight: 'Riyadh',
      },
      {
        day: 2,
        title: 'Old Riyadh',
        stops: ['Masmak', 'Dira Souq', 'National Museum', 'Murabba Palace'],
        description: 'The fortress, the old souq, and the museum galleries in one full day.',
      },
      {
        day: 3,
        title: 'Diriyah and departure',
        stops: ['At-Turaif', 'Diriyah'],
        description: 'The UNESCO mud-brick quarter in the morning, then departure transfer.',
      },
    ],
    inclusions: [
      'All transportation with A/C vehicle.',
      "All nights' accommodation B/B at 4 **** hotel.",
      'English guide at sites.',
      'Entrance fees for At-Turaif and the National Museum.',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'All Lunches and Dinners.',
      'Airport transfers upon arrival and departure.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
  {
    key: 'red-sea-jeddah',
    name: 'Red Sea and Jeddah',
    tagline: 'Coast and heritage',
    summary:
      'Old Jeddah and the Corniche paired with the reefs and islands off Yanbu, five nights on the Red Sea coast.',
    route: 'Jeddah — Yanbu',
    days: 6,
    nights: 5,
    kind: 'Multi-day',
    fromPrice: 3100,
    rating: 4.7,
    reviews: '142',
    cardImage: 'https://picsum.photos/seed/agoua-tour-redsea-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Meals', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival Jeddah',
        stops: ['Jeddah'],
        description: 'Arrive and settle in, with free time on the Corniche.',
        overnight: 'Jeddah',
      },
      {
        day: 2,
        title: 'Al Balad heritage',
        stops: ['Al Balad', 'Nassif House', 'Fish Market'],
        description: 'Coral-stone houses, roshan balconies and the morning fish market.',
      },
      {
        day: 3,
        title: 'Jeddah to Yanbu',
        stops: ['Jeddah', 'Yanbu'],
        description: 'Coastal drive north, arriving in Yanbu for the evening market.',
        overnight: 'Yanbu',
      },
      {
        day: 4,
        title: 'Red Sea day',
        stops: ['Yanbu', 'Sharm Yanbu'],
        description: 'Island cruise and snorkelling over the reefs, weather permitting.',
      },
      {
        day: 5,
        title: 'Yanbu to Jeddah',
        stops: ['Yanbu', 'Jeddah'],
        description: 'Return south with a stop for lunch on the coast road.',
      },
      {
        day: 6,
        title: 'Departure Jeddah',
        stops: ['Jeddah'],
        description: 'Breakfast and departure transfer arrangements.',
      },
    ],
    inclusions: [
      'All transportation with A/C bus.',
      "All nights' accommodation B/B at 4 **** hotel.",
      'English guide at sites.',
      'Island cruise and snorkelling equipment in Yanbu.',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'Drinks during meals.',
      'All Lunches.',
      'Airport transfers upon arrival and departure.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
  {
    key: 'taif-abha',
    name: 'Taif and Abha Highlands',
    tagline: 'Mountain route',
    summary:
      'Rose farms and escarpment roads in Taif, then the Asir highlands, Rijal Almaa and the hanging village at Habala.',
    route: 'Taif — Abha',
    days: 5,
    nights: 4,
    kind: 'Multi-day',
    fromPrice: 2400,
    rating: 4.7,
    reviews: '96',
    cardImage: 'https://picsum.photos/seed/agoua-tour-taif-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Meals', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival Taif',
        stops: ['Taif'],
        description: 'Arrive in the summer capital, with an afternoon at the rose farms.',
        overnight: 'Taif',
      },
      {
        day: 2,
        title: 'Taif highlands',
        stops: ['Al Shafa', 'Al Hada', 'Shubra Palace'],
        description: 'Escarpment viewpoints, the cable car, and the old royal residence.',
      },
      {
        day: 3,
        title: 'Taif to Abha',
        stops: ['Taif', 'Abha'],
        description: 'Long mountain drive south along the Asir range.',
        overnight: 'Abha',
      },
      {
        day: 4,
        title: 'Abha and Rijal Almaa',
        stops: ['Rijal Almaa', 'Habala', 'Abha'],
        description: 'The painted stone village, the cliff settlement, and Abha old town.',
      },
      {
        day: 5,
        title: 'Departure Abha',
        stops: ['Abha'],
        description: 'Breakfast and transfer to Abha airport.',
      },
    ],
    inclusions: [
      'All transportation with A/C vehicle.',
      "All nights' accommodation B/B at 4 **** hotel.",
      'Dinners at local restaurants.',
      'English guide at sites.',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'Domestic flights.',
      'All Lunches.',
      'Cable car tickets at Al Hada.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
  {
    key: 'al-ahsa-eastern',
    name: 'Al Ahsa and the Eastern Province',
    tagline: 'Oasis route',
    summary:
      'Three nights on the Gulf coast and in the world’s largest palm oasis, taking in Qaisariah Souq and Al Qarah Mountain.',
    route: 'Dammam — Al Ahsa',
    days: 4,
    nights: 3,
    kind: 'Multi-day',
    fromPrice: 1900,
    rating: 4.5,
    reviews: '88',
    cardImage: 'https://picsum.photos/seed/agoua-tour-ahsa-1/900/620',
    mapImage: require('@/assets/images/tours/ksa-grand-tour.png'),
    usuallyIncluded: ['Hotel', 'Transport', 'Sightseeing'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival Dammam',
        stops: ['Dammam', 'Corniche'],
        description: 'Arrive on the Gulf coast with an evening along the Corniche.',
        overnight: 'Dammam',
      },
      {
        day: 2,
        title: 'Al Ahsa oasis',
        stops: ['Al Ahsa', 'Qaisariah Souq', 'Jawatha Mosque'],
        description: 'The UNESCO oasis, the covered souq, and the earliest mosque in the east.',
        overnight: 'Al Ahsa',
      },
      {
        day: 3,
        title: 'Caves and desert',
        stops: ['Al Qarah Mountain', 'Yellow Lake'],
        description: 'Cool limestone caves in the morning and desert lakes in the afternoon.',
      },
      {
        day: 4,
        title: 'Departure Dammam',
        stops: ['Dammam'],
        description: 'Breakfast and departure transfer arrangements.',
      },
    ],
    inclusions: [
      'All transportation with A/C vehicle.',
      "All nights' accommodation B/B at 4 **** hotel.",
      'English guide at sites.',
      'Entrance fees for Al Qarah caves.',
      'All Taxes.',
    ],
    exclusions: [
      'Visa cost to Saudi.',
      'All Lunches and Dinners.',
      'Airport transfers upon arrival and departure.',
      'Tips.',
      'Any personal expenses.',
      'Anything not mentioned in the Include items.',
    ],
  },
];

export function findTour(key: string | undefined): Tour | undefined {
  if (!key) return undefined;
  return TOURS.find((tour) => tour.key === key);
}

// "10 Days / 9 Nights", the form the itinerary header and the cards both use.
export function formatDuration(tour: Pick<Tour, 'days' | 'nights'>) {
  return `${tour.days} Days / ${tour.nights} Nights`;
}
