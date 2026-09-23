import { TOURS, formatDuration, type Tour } from '@/constants/tours-data';

// An offer is a discount hung on a tour that already exists, so it stores only
// what is genuinely new. Name, route, duration, imagery and the undiscounted
// price all come from TOURS via `key` — which is also what /offer resolves by,
// so every offer card opens a real tour.
export type Offer = {
  key: Tour['key'];
  // Percent off the per-person price.
  discount: number;
  endsInDays: number;
  // The featured offers get the hero + pair treatment at the top of the
  // screen; every offer, featured or not, still appears in the filtered list
  // below — otherwise picking a duration would hide the offer that happens to
  // be the hero.
  featured: boolean;
  // What the discount adds on top of the tour's own inclusions. These are the
  // deal, not the tour, which is why they live here and not in tours-data.
  perks: string[];
  // The offer's own small print, on top of Agoua's standing TOUR_TERMS.
  terms: string[];
  // Which EXPLORE_PLACES entry this offer belongs to, so a destination screen
  // can show the tours running there. Named explicitly rather than matched
  // against the route string. Undefined until Explore carries Saudi
  // destinations.
  placeKey?: string;
};

export const OFFERS: Offer[] = [
  {
    key: 'ksa-grand-tour',
    discount: 15,
    endsInDays: 6,
    featured: true,
    perks: ['Free Riyadh airport transfer', 'Upgraded AlUla hotel', 'Hegra guided entry'],
    terms: ['Minimum 2 travellers', 'Departures until 30 Nov', 'Single supplement applies'],
  },
  {
    key: 'alula-hegra',
    discount: 22,
    endsInDays: 4,
    featured: true,
    perks: ['Sharaan sunset drive', 'Maraya entry', 'Daily breakfast'],
    terms: ['Minimum 2 travellers', 'Excludes AlUla Moments season'],
  },
  {
    key: 'red-sea-jeddah',
    discount: 18,
    endsInDays: 9,
    featured: true,
    perks: ['Island cruise included', 'Snorkelling gear', 'Al Balad walking tour'],
    terms: ['Minimum 2 travellers', 'Cruise weather-dependent', 'Non-refundable'],
  },
  {
    key: 'riyadh-heritage',
    discount: 12,
    endsInDays: 2,
    featured: false,
    perks: ['At-Turaif guided entry', 'Boulevard evening', 'Late checkout'],
    terms: ['Minimum 2 travellers', 'Free cancellation up to 7 days'],
  },
  {
    key: 'taif-abha',
    discount: 25,
    endsInDays: 11,
    featured: false,
    perks: ['Rose farm visit', 'Rijal Almaa entry', 'Dinners included'],
    terms: ['Minimum 4 travellers', 'Mountain roads subject to weather'],
  },
  {
    key: 'al-ahsa-eastern',
    discount: 20,
    endsInDays: 3,
    featured: false,
    perks: ['Al Qarah caves entry', 'Qaisariah Souq walk', 'Airport pickup'],
    terms: ['Minimum 2 travellers', 'Non-refundable'],
  },
];

export type ResolvedOffer = Offer &
  Tour & {
    // Per-person price before and after the discount, both plain numbers —
    // screens run them through formatPrice.
    was: number;
    now: number;
    // What the discount is worth per person, so screens do not repeat the
    // subtraction.
    saving: number;
    // "10 Days / 9 Nights", precomputed because every card shows it.
    duration: string;
  };

// Joins each offer to its tour and does the price maths, so the screens never
// have to. Offers whose key no longer matches a tour are dropped rather than
// rendered half-empty.
export function resolveOffers(): ResolvedOffer[] {
  return OFFERS.flatMap((offer) => {
    const tour = TOURS.find((entry) => entry.key === offer.key);
    if (!tour) return [];

    const now = Math.round(tour.fromPrice * (1 - offer.discount / 100));

    return [
      {
        ...tour,
        ...offer,
        was: tour.fromPrice,
        now,
        saving: tour.fromPrice - now,
        duration: formatDuration(tour),
      },
    ];
  });
}

// Single-offer lookup for the detail screen. Resolving the whole list to pick
// one out of it is cheap at this size and keeps the price maths in one place.
export function findOffer(key: string | undefined): ResolvedOffer | undefined {
  if (!key) return undefined;
  return resolveOffers().find((offer) => offer.key === key);
}

// Every offer running at one Explore destination, biggest saving first.
export function offersForPlace(placeKey: string | undefined): ResolvedOffer[] {
  if (!placeKey) return [];
  return sortOffers(
    resolveOffers().filter((offer) => offer.placeKey === placeKey),
    'Biggest discount'
  );
}

// The list's chip rail. Tours are grouped by how long they run rather than by
// terrain — that is the first thing anyone filters a tour catalogue by.
export const ALL_FILTER = 'All' as const;

export const DURATION_FILTERS = ['Up to 4 days', '5 to 7 days', '8 days or more'] as const;

export type DurationFilter = (typeof DURATION_FILTERS)[number];

export type OfferFilter = typeof ALL_FILTER | DurationFilter;

export const OFFER_FILTERS: readonly OfferFilter[] = [ALL_FILTER, ...DURATION_FILTERS];

export const OFFER_SORTS = ['Biggest discount', 'Lowest price', 'Ending soon', 'Longest tour'] as const;

export type OfferSort = (typeof OFFER_SORTS)[number];

// Returns a new array — the caller memoises the result, and sorting the
// resolved list in place would reorder it for every other consumer.
export function sortOffers(offers: ResolvedOffer[], sort: OfferSort): ResolvedOffer[] {
  const sorted = [...offers];

  switch (sort) {
    case 'Lowest price':
      return sorted.sort((a, b) => a.now - b.now);
    case 'Ending soon':
      return sorted.sort((a, b) => a.endsInDays - b.endsInDays);
    case 'Longest tour':
      return sorted.sort((a, b) => b.days - a.days);
    case 'Biggest discount':
    default:
      return sorted.sort((a, b) => b.discount - a.discount);
  }
}

export function filterOffers(offers: ResolvedOffer[], filter: OfferFilter): ResolvedOffer[] {
  switch (filter) {
    case 'Up to 4 days':
      return offers.filter((offer) => offer.days <= 4);
    case '5 to 7 days':
      return offers.filter((offer) => offer.days >= 5 && offer.days <= 7);
    case '8 days or more':
      return offers.filter((offer) => offer.days >= 8);
    default:
      return offers;
  }
}

// "Ends today" / "Ends tomorrow" read better than "Ends in 0 days" at the
// point where the urgency actually matters.
export function formatExpiry(days: number) {
  if (days <= 0) return 'Ends today';
  if (days === 1) return 'Ends tomorrow';
  return `Ends in ${days} days`;
}
