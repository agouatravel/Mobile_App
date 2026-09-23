import { looksLikeEmail, type FieldErrors } from '@/constants/auth';

// The visa booking request and the rules behind its form.
//
// Everything here is pure: no state, no storage, no network. The form reads
// these rules and nothing else decides what a valid request is — the same split
// constants/auth.ts makes for sign-in and sign-up, and `looksLikeEmail` is
// borrowed from there rather than a second pattern being written that could
// disagree with it about the same address.

export type BookingInput = {
  fullName: string;
  email: string;
  phone: string;
  /** Free text rather than a picker — see validateBooking. */
  travelDate: string;
  travellers: string;
  notes: string;
};

export const EMPTY_BOOKING: BookingInput = {
  fullName: '',
  email: '',
  phone: '',
  travelDate: '',
  travellers: '1',
  notes: '',
};

export const MAX_TRAVELLERS = 20;

// Digits, spaces and the punctuation people actually type into a phone field,
// with an optional leading +. Deliberately loose about length: national number
// lengths differ, and the desk calls the number back anyway — a stricter rule
// mostly rejects correct foreign numbers.
const PHONE = /^\+?[\d\s()-]{7,}$/;

// Day, month and a four-digit year, in the order the region writes them. Slash
// or dash, one or two digits for day and month.
const DATE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;

// Whether a date is real, and not in the past.
//
// Typed rather than picked: a native date picker is a dependency and a platform
// difference for one field, and the desk confirms the date on the call anyway.
// That makes the parsing this function's job — a regex alone would accept
// 31/02/2027, and a booking dated last year is a typo worth catching before the
// form is sent rather than after.
export function parseTravelDate(value: string): Date | null {
  const match = DATE.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);
  // Rolls over on an impossible day (February 31st becomes March 3rd), so
  // comparing the parts back is what rejects it.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function isPast(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function validateBooking(input: BookingInput): FieldErrors<BookingInput> {
  const errors: FieldErrors<BookingInput> = {};

  const name = input.fullName.trim();
  if (!name) errors.fullName = 'Enter the traveller’s full name';
  // A single word is almost always a half-filled field rather than a real
  // mononym, and the visa application needs the name as it appears in the
  // passport.
  else if (!name.includes(' ')) errors.fullName = 'Enter both given and family names';

  if (!input.email.trim()) errors.email = 'Enter an email address';
  else if (!looksLikeEmail(input.email)) errors.email = 'Enter a valid email address';

  const phone = input.phone.trim();
  if (!phone) errors.phone = 'Enter a contact number';
  else if (!PHONE.test(phone)) errors.phone = 'Enter a valid contact number';

  const date = input.travelDate.trim();
  if (!date) errors.travelDate = 'Enter your travel date';
  else {
    const parsed = parseTravelDate(date);
    if (!parsed) errors.travelDate = 'Use DD/MM/YYYY';
    else if (isPast(parsed)) errors.travelDate = 'Travel date is in the past';
  }

  const travellers = Number(input.travellers.trim());
  if (!input.travellers.trim()) errors.travellers = 'How many travellers?';
  else if (!Number.isInteger(travellers) || travellers < 1) {
    errors.travellers = 'Enter a whole number, 1 or more';
  } else if (travellers > MAX_TRAVELLERS) {
    errors.travellers = `Call the desk for groups over ${MAX_TRAVELLERS}`;
  }

  // `notes` is never validated — it is the optional field, and the only one the
  // desk reads rather than processes.

  return errors;
}

// Excludes I, O, 0 and 1, the same way makeMemberId does: this reference gets
// read down a phone line, and those four are the pairs people mishear.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// `AG-BK-XXXXXX`, sharing the account ID's `AG-` prefix with `BK` marking it a
// booking, so a reference read out to the desk is identifiable as one without
// being asked what it is.
export function makeBookingReference() {
  let body = '';
  for (let i = 0; i < 6; i += 1) {
    body += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `AG-BK-${body}`;
}

// What the price line on the form adds up to. Kept here rather than in the
// screen so the figure shown beside the submit button and the figure quoted in
// the confirmation cannot be worked out two different ways.
export function bookingTotal(unitPrice: number, travellers: string) {
  const count = Number(travellers.trim());
  if (!Number.isInteger(count) || count < 1) return unitPrice;
  return unitPrice * Math.min(count, MAX_TRAVELLERS);
}
