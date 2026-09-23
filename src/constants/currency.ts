// Prices are stored as plain numbers everywhere and formatted through here, so
// the app's currency is one constant rather than a hunt through string
// literals. Grouping is done by hand rather than via toLocaleString because
// Intl support varies by Hermes build.

// U+FDFC RIAL SIGN. Its bidi class is AL (Arabic Letter) — a *strong* RTL
// character. When it opens the string it is the first strong character in the
// run, so the bidi algorithm resolves the paragraph direction to RTL and lays
// the whole line out right-to-left, which renders "﷼558/night" as
// "558/night﷼". A U+200E after the sign is not enough: that fixes what
// follows it, not the direction the paragraph resolved to. So the sign is
// bracketed by left-to-right marks — the leading one makes L the first strong
// character and pins the paragraph LTR, the trailing one keeps the digits from
// being taken as Arabic numbers.
export const CURRENCY = '﷼';
const LTR_MARK = '‎';

export function formatPrice(amount: number) {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${LTR_MARK}${CURRENCY}${LTR_MARK}${grouped}`;
}
