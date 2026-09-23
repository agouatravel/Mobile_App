// Account shapes and the validation behind the sign-in / sign-up forms.
//
// Everything here is pure: no state, no storage, no network. The screens read
// these rules and the provider enforces them, so the two can never disagree
// about what a valid password is.

export type AuthProvider = 'password' | 'google' | 'apple';

// The providers that hand back an identity instead of asking for a password.
export type OAuthProvider = Exclude<AuthProvider, 'password'>;

export const OAUTH_LABELS: Record<OAuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

export type Account = {
  // Agoua's own member ID. Shown after sign-up because it is the second thing
  // you can log in with, alongside the email.
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: AuthProvider;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// One field rather than two, because the form does not ask which of the two you
// typed — it works that out from the shape of what you entered.
export type SignInInput = {
  identifier: string;
  password: string;
};

// Step 1 of the reset flow. Only the email, because the whole point of the
// flow is that you cannot prove who you are with a password.
export type ResetRequestInput = { email: string };

// Step 3. The confirmation field is part of the input rather than local screen
// state, so "they don't match" is validated by the same rules as everything
// else instead of by an `if` in the form.
export type NewPasswordInput = { password: string; confirm: string };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const PASSWORD_MIN = 8;

export const CODE_LENGTH = 6;

// Deliberately loose. A stricter pattern rejects addresses that are perfectly
// valid (new TLDs, plus-addressing, quoted locals), and the only check that
// actually proves an address works is sending mail to it.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function looksLikeEmail(value: string) {
  return EMAIL.test(value.trim());
}

// Member IDs are compared and stored upper-case, so "ag-7k2m4" and "AG-7K2M4"
// are the same account. Emails get the same treatment.
export function normaliseIdentifier(value: string) {
  return value.trim().toLowerCase();
}

export function validateSignUp(input: SignUpInput): FieldErrors<SignUpInput> {
  const errors: FieldErrors<SignUpInput> = {};

  if (!input.firstName.trim()) errors.firstName = 'Enter your first name';
  if (!input.lastName.trim()) errors.lastName = 'Enter your last name';

  if (!input.email.trim()) errors.email = 'Enter your email';
  else if (!looksLikeEmail(input.email)) errors.email = "That doesn't look like an email address";

  if (!input.password) errors.password = 'Choose a password';
  else if (input.password.length < PASSWORD_MIN) {
    errors.password = `At least ${PASSWORD_MIN} characters`;
  }

  return errors;
}

export function validateSignIn(input: SignInInput): FieldErrors<SignInInput> {
  const errors: FieldErrors<SignInInput> = {};

  if (!input.identifier.trim()) errors.identifier = 'Enter your email or member ID';
  if (!input.password) errors.password = 'Enter your password';

  return errors;
}

export function validateResetRequest(input: ResetRequestInput): FieldErrors<ResetRequestInput> {
  const errors: FieldErrors<ResetRequestInput> = {};

  if (!input.email.trim()) errors.email = 'Enter your email';
  else if (!looksLikeEmail(input.email)) errors.email = "That doesn't look like an email address";

  return errors;
}

// Returns a message rather than a FieldErrors map: the code is one value on its
// own screen, so there is no second field for an error to belong to.
export function validateCode(code: string) {
  if (!code) return 'Enter the code we emailed you';
  if (code.length < CODE_LENGTH) return `The code is ${CODE_LENGTH} digits`;
  return undefined;
}

export function validateNewPassword(input: NewPasswordInput): FieldErrors<NewPasswordInput> {
  const errors: FieldErrors<NewPasswordInput> = {};

  if (!input.password) errors.password = 'Choose a password';
  else if (input.password.length < PASSWORD_MIN) {
    errors.password = `At least ${PASSWORD_MIN} characters`;
  }

  // Only worth saying once the first field is valid — telling someone their
  // confirmation doesn't match a password that is itself too short is noise.
  if (!input.confirm) errors.confirm = 'Repeat your new password';
  else if (input.confirm !== input.password) errors.confirm = "Those don't match";

  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>) {
  return Object.keys(errors).length > 0;
}

// Ambiguous glyphs are left out: a member ID gets read off a screen and typed
// back in, and 0/O and 1/I/L are where that goes wrong.
const ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeMemberId() {
  let body = '';
  for (let i = 0; i < 6; i += 1) {
    body += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  }
  return `AG-${body}`;
}

// Digits only, unlike a member ID: this one is typed from a phone's
// notification shade under a countdown, and a numeric keypad is faster and
// harder to fumble than a full keyboard.
export function makeResetCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

// "sam.rivera@gmail.com" → "sa••••••@gmail.com". Enough to recognise the
// address you meant, not enough to be worth shoulder-surfing off a screen.
export function maskEmail(email: string) {
  const at = email.indexOf('@');
  if (at < 1) return email;

  const local = email.slice(0, at);
  const kept = local.slice(0, Math.min(2, local.length - 1));
  return `${kept}${'•'.repeat(Math.max(local.length - kept.length, 1))}${email.slice(at)}`;
}

export function fullName(account: Account) {
  return `${account.firstName} ${account.lastName}`.trim();
}

export function initials(account: Account) {
  const first = account.firstName.trim()[0] ?? '';
  const last = account.lastName.trim()[0] ?? '';
  return `${first}${last}`.toUpperCase();
}
