// Reservations desk. Stored in E.164 so it can be handed straight to a
// `tel:` URL, and formatted for display separately — the two forms are not
// interchangeable and dialling the pretty one fails on some Android dialers.
export const SUPPORT_PHONE = '+966500000000';

// Groups the national number for display: +966 50 000 0000.
export function formatPhone(phone: string = SUPPORT_PHONE) {
  const match = /^\+(\d{1,3})(\d{2})(\d{3})(\d{4})$/.exec(phone);
  if (!match) return phone;

  const [, country, carrier, head, tail] = match;
  return `+${country} ${carrier} ${head} ${tail}`;
}
