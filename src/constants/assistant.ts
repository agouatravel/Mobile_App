import { cheapestStays, searchCatalogue, type SearchHit } from '@/constants/search';

// The assistant's answers, worked out on the device from the app's own
// catalogue. There is no model behind this and nothing leaves the phone: it
// reads the question for what it is about, then puts the matching destinations,
// stays and services in front of it.
//
// That is a deliberate stopping point, not a stub left half-finished. Every
// reply it can give is one it can stand behind, because all of them are drawn
// from the same static catalogue the rest of the app renders. `askAssistant` is
// the single seam — a real endpoint would replace this one function and the
// screen above it would not change.

export type AssistantReply = {
  text: string;
  /** Places in the app the answer points at. Rendered as tappable rows. */
  links: SearchHit[];
};

// The suggestion chips, and what each one actually asks.
//
// The label is a topic and the prompt is a whole question, because those are
// two different jobs: a chip has to be readable at a glance in a row of five,
// and the thing it sends has to be specific enough to answer.
//
// Every prompt here is one a guest can ask and this catalogue can answer. That
// is a real constraint rather than a stylistic one — a curated shortcut that
// dead-ends on "I could not find that" is worse than no shortcut, so nowhere
// Agoua does not sell appears in this list, however good an example it would
// have made.
export type AiSuggestion = {
  key: string;
  label: string;
  prompt: string;
};

export const AI_SUGGESTIONS: AiSuggestion[] = [
  { key: 'plan', label: '✈️ Plan a trip', prompt: 'Plan a trip to Bali' },
  { key: 'hotel', label: '🏨 Find a hotel', prompt: 'Find me a beach stay' },
  { key: 'visa', label: '🛂 Visa requirements', prompt: 'Do I need a visa for Italy?' },
  {
    key: 'explore',
    label: '📍 Explore destinations',
    prompt: 'What is the best time to visit Santorini?',
  },
  { key: 'deals', label: '💰 Find the best deals', prompt: 'Help me plan a budget trip' },
];

// How long the assistant takes before answering. The work itself is instant,
// and a reply landing in the same frame as the question reads as a lookup
// rather than as a considered answer — which is what it is, but the jumpiness
// is what the reader notices, not the honesty.
export const ASSISTANT_LATENCY = 550;

// The most rows an answer will carry. The reply is a signpost, not a results
// page — the screens it points at are where the full lists live.
const MAX_LINKS = 3;

// Words that would only drag noise into the catalogue lookup. Kept to the ones
// that actually collide with something in the data: "for" and "the" match
// nothing, but "best", "find" and "trip" all brush against real entries.
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'you', 'are', 'can', 'was', 'with', 'from', 'that', 'this', 'what',
  'where', 'when', 'which', 'how', 'who', 'why', 'need', 'want', 'find', 'show', 'get',
  'give', 'help', 'best', 'good', 'nice', 'some', 'any', 'there', 'here', 'about', 'trip',
  'trips', 'travel', 'have', 'has', 'should', 'would', 'could', 'please', 'thanks', 'look',
  'looking', 'going', 'take', 'make', 'more', 'most', 'like', 'just', 'also', 'over',
  'under', 'into', 'than', 'then', 'them', 'they', 'your', 'mine', 'ours', 'visit',
]);

// What a question is about, and how the answer opens. Ordered: the first topic
// whose cues appear wins, so the specific ones — a visa, a car — sit above the
// broad ones that would otherwise swallow them.
const TOPICS: { key: string; cues: string[]; lead: string }[] = [
  {
    key: 'visa',
    cues: ['visa', 'visas', 'passport', 'permit', 'entry', 'idp', 'licence', 'license'],
    lead: 'Visas are one of the things Agoua handles end to end. Pick a country in the visa list and it shows what it costs, how long it takes, and what you have to send.',
  },
  {
    key: 'car',
    cues: ['car', 'cars', 'drive', 'driving', 'rental', 'hire'],
    lead: 'Car rental sits under services, and an international driving permit can be arranged beside it rather than as a separate errand.',
  },
  {
    key: 'flight',
    cues: ['flight', 'flights', 'fly', 'flying', 'airline', 'airport'],
    lead: 'Flights are sold inside the packages rather than on their own, so the fare is priced together with the stay.',
  },
  {
    key: 'budget',
    cues: ['cheap', 'cheapest', 'budget', 'affordable', 'cost', 'costs', 'price', 'prices', 'spend', 'sar'],
    lead: 'Everything carries a price per night and a price per week, so a longer stay is usually the one worth comparing. These are the least expensive:',
  },
  {
    key: 'season',
    cues: ['weather', 'warm', 'hot', 'cold', 'sunny', 'rain', 'season', 'december', 'january',
      'february', 'march', 'june', 'july', 'august', 'september', 'october', 'november',
      'summer', 'winter', 'spring', 'autumn', 'time'],
    lead: 'Every destination page carries the current weather and which way it is heading, which is the quickest way to check a month before committing to it.',
  },
  {
    key: 'coast',
    cues: ['beach', 'beaches', 'island', 'islands', 'coast', 'sea', 'sand', 'reef', 'diving'],
    lead: 'The coastal side of the catalogue — these are the ones on the water:',
  },
  {
    key: 'high',
    cues: ['mountain', 'mountains', 'hike', 'hiking', 'ski', 'skiing', 'snow', 'alps', 'trek', 'altitude'],
    lead: 'The high ones, where the walking is the point:',
  },
  {
    key: 'stay',
    cues: ['stay', 'stays', 'hotel', 'hotels', 'villa', 'villas', 'room', 'rooms', 'night',
      'nights', 'accommodation', 'resort', 'cabin', 'cabins', 'suite', 'suites', 'lodge'],
    lead: 'Here are the stays that match. Each one is priced per night and per week:',
  },
  {
    key: 'plan',
    cues: ['plan', 'planning', 'itinerary', 'holiday', 'vacation', 'days'],
    lead: 'Agoua sells a trip whole rather than in pieces — the flights, the stay and the transfers priced together — so planning here starts with where, and for how long. This is what fits:',
  },
  {
    key: 'greeting',
    cues: ['hi', 'hello', 'hey', 'salam', 'morning', 'evening'],
    lead: 'Tell me where you are thinking of going, or what you need sorted before you do, and I will point you straight at it.',
  },
];

const FOUND = 'Here is what Agoua has for that:';

const NOTHING =
  'I could not find that one. Try a destination by name — Bali, Santorini, Kyoto — or a service like visas, car rental or packages.';

// Words worth looking up, longest first. Longer words are the specific ones —
// "santorini" before "sea" — so the first hit is the one most likely to be what
// was actually meant.
function terms(prompt: string) {
  const words = prompt.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  return [...new Set(words)]
    .filter((word) => !STOP_WORDS.has(word))
    .sort((a, b) => b.length - a.length);
}

// The catalogue lookup, run a word at a time rather than on the whole sentence.
// `searchCatalogue` matches substrings, and no entry in the app contains a whole
// question — so passing the sentence straight through would find nothing at all.
function linksFor(prompt: string) {
  const seen = new Set<string>();
  const found: SearchHit[] = [];

  for (const term of terms(prompt)) {
    for (const hit of searchCatalogue(term, MAX_LINKS)) {
      if (seen.has(hit.key)) continue;
      seen.add(hit.key);
      found.push(hit);
      if (found.length === MAX_LINKS) return found;
    }
  }

  return found;
}

export function askAssistant(prompt: string): AssistantReply {
  const asked = prompt.toLowerCase();
  let links = linksFor(prompt);

  const topic = TOPICS.find((entry) =>
    entry.cues.some((cue) => new RegExp(`\\b${cue}\\b`).test(asked))
  );

  // Asking about money is the one case where the words are guaranteed to find
  // nothing — no stay in the catalogue is called "cheap" — while the catalogue
  // itself has a perfectly good answer sitting in its prices.
  if (topic?.key === 'budget' && links.length === 0) links = cheapestStays();

  // A topic with nothing to point at still has something to say: where visas
  // are handled is an answer on its own. A question with no topic and no
  // matches has neither, and says so rather than inventing one.
  if (!topic) return { text: links.length > 0 ? FOUND : NOTHING, links };

  return { text: topic.lead, links };
}
