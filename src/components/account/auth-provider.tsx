import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  OAUTH_LABELS,
  looksLikeEmail,
  makeMemberId,
  makeResetCode,
  normaliseIdentifier,
  type Account,
  type OAuthProvider,
  type SignInInput,
  type SignUpInput,
} from '@/constants/auth';

// THIS IS A MOCK. There is no auth backend behind the app yet, so accounts live
// in memory for the life of the process and are gone on reload. It exists so
// the screens are built against a real async boundary rather than against
// setState calls scattered through the form — swapping in Firebase, Supabase,
// or your own API means reimplementing the three functions below and nothing
// else. Nothing outside this file knows how sign-in actually happens.
//
// What a real implementation has to add, none of which is faked here:
//   - password hashing, and never holding the password in memory as it is here
//   - a persisted session (no storage library is installed yet)
//   - real Google OAuth; see `signInWithGoogle`

type StoredAccount = Account & { password: string };

export type AuthResult = { ok: true } | { ok: false; message: string };

// A reset always reports success, so there is no `ok: false` to return here —
// see `requestPasswordReset`. `devCode` is the mock standing in for the email
// nobody can send; a real implementation returns nothing at all.
export type ResetRequestResult = { devCode: string | null };

type AuthContextValue = {
  account: Account | null;
  busy: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (input: SignInInput) => Promise<AuthResult>;
  signInWithProvider: (provider: OAuthProvider) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<ResetRequestResult>;
  verifyResetCode: (email: string, code: string) => Promise<AuthResult>;
  resetPassword: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
};

// An outstanding reset. Keyed by normalised email in `resets` below.
type ResetTicket = {
  code: string;
  // Checked when the code is used rather than cleared by a timer: a timer
  // would keep the process awake and would still have to be reconciled against
  // the clock after a background/resume anyway.
  expiresAt: number;
  // Set by `verifyResetCode` and required by `resetPassword`, so the last step
  // cannot be reached by deep-linking straight to it with an unverified email.
  verified: boolean;
};

// Short enough that a code read off a screen and left there is not a standing
// key to the account; long enough to survive switching to a mail app and back.
const RESET_TTL_MS = 10 * 60 * 1000;

// Stand-in identities, one per provider. A real flow gets these back from the
// provider itself; keying them here means the same button twice lands on the
// same account rather than creating a second one.
const OAUTH_IDENTITIES: Record<OAuthProvider, Pick<Account, 'firstName' | 'lastName' | 'email'>> = {
  google: { firstName: 'Sample', lastName: 'Traveller', email: 'sample.traveller@gmail.com' },
  apple: { firstName: 'Sample', lastName: 'Traveller', email: 'sample.traveller@icloud.com' },
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Stands in for the server's user table. Module scope rather than state: it is
// the store, not something the UI renders, and putting it in state would make
// every registration re-render the tree.
const accounts: StoredAccount[] = [];

// Outstanding password resets, one per email. Module scope for the same reason
// as `accounts`: it is store, not view state.
const resets = new Map<string, ResetTicket>();

function findAccount(identifier: string) {
  const needle = normaliseIdentifier(identifier);
  return accounts.find(
    (entry) => normaliseIdentifier(entry.email) === needle || normaliseIdentifier(entry.id) === needle
  );
}

// Enough delay to see the button's busy state resolve, so the form is built and
// checked against an interaction that takes time — a real request will.
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 450));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);

  const signUp = useCallback(async (input: SignUpInput): Promise<AuthResult> => {
    setBusy(true);
    await settle();

    try {
      if (findAccount(input.email)) {
        return { ok: false, message: 'That email already has an account. Try logging in.' };
      }

      const created: StoredAccount = {
        id: makeMemberId(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        provider: 'password',
        password: input.password,
      };

      accounts.push(created);
      setAccount(created);
      return { ok: true };
    } finally {
      setBusy(false);
    }
  }, []);

  const signIn = useCallback(async (input: SignInInput): Promise<AuthResult> => {
    setBusy(true);
    await settle();

    try {
      const found = findAccount(input.identifier);

      // A provider account has no password to check against, so it must not
      // fall through to the comparison below — otherwise the placeholder stored
      // for it would be a password someone could type.
      if (found && found.provider !== 'password') {
        const label = OAUTH_LABELS[found.provider];
        return { ok: false, message: `That account uses ${label}. Use the ${label} button above.` };
      }

      // One message for both remaining cases on purpose: saying which of the
      // two was wrong tells an attacker which emails and IDs are registered.
      if (!found || found.password !== input.password) {
        const kind = looksLikeEmail(input.identifier) ? 'email' : 'member ID';
        return { ok: false, message: `That ${kind} and password don't match an account.` };
      }

      setAccount(found);
      return { ok: true };
    } finally {
      setBusy(false);
    }
  }, []);

  // Not wired to either provider. Google needs `expo-auth-session`, a client ID
  // per platform from the Google Cloud console and a redirect scheme in
  // app.json; Apple needs `expo-apple-authentication` and a paid developer
  // account with Sign in with Apple enabled. None of that can be invented here,
  // so this returns a fixed identity and the rest of the flow is real.
  const signInWithProvider = useCallback(
    async (provider: OAuthProvider): Promise<AuthResult> => {
      setBusy(true);
      await settle();

      try {
        const identity = OAUTH_IDENTITIES[provider];

        const existing = findAccount(identity.email);
        if (existing) {
          setAccount(existing);
          return { ok: true };
        }

        const created: StoredAccount = {
          id: makeMemberId(),
          ...identity,
          provider,
          // Never compared: `signIn` turns provider accounts away before it
          // reaches the password check. Present only because the store's row
          // shape has the field.
          password: '',
        };

        accounts.push(created);
        setAccount(created);
        return { ok: true };
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // Reports the same thing whether or not the address is registered, matching
  // `signIn`'s single failure message: an endpoint that answers "no such
  // account" is a way to test which of a list of emails have one. The cost is
  // that someone who signed up with Google and forgot gets a code that never
  // arrives — a real backend would email them "you sign in with Google"
  // instead, which is the same non-answer to anyone who is not them.
  const requestPasswordReset = useCallback(async (email: string): Promise<ResetRequestResult> => {
    setBusy(true);
    await settle();

    try {
      const found = findAccount(email);
      if (!found || found.provider !== 'password') return { devCode: null };

      const code = makeResetCode();
      resets.set(normaliseIdentifier(found.email), {
        code,
        expiresAt: Date.now() + RESET_TTL_MS,
        verified: false,
      });

      return { devCode: code };
    } finally {
      setBusy(false);
    }
  }, []);

  const verifyResetCode = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      setBusy(true);
      await settle();

      try {
        const key = normaliseIdentifier(email);
        const ticket = resets.get(key);

        // Expiry is reported apart from a wrong code, unlike the sign-in
        // message: it tells you nothing about whether the account exists — you
        // already know a code was issued — and without it a correct code that
        // simply took too long looks like a typo you cannot find.
        if (ticket && ticket.expiresAt < Date.now()) {
          resets.delete(key);
          return { ok: false, message: 'That code has expired. Send yourself a new one.' };
        }

        if (!ticket || ticket.code !== code) {
          return { ok: false, message: "That code isn't right. Check it and try again." };
        }

        ticket.verified = true;
        return { ok: true };
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // Signs the account in on success. The alternative is bouncing back to a
  // login form to type a password chosen ten seconds ago, and having just
  // proved control of the mailbox is the same proof logging in would ask for.
  const resetPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setBusy(true);
      await settle();

      try {
        const key = normaliseIdentifier(email);
        const ticket = resets.get(key);
        const found = findAccount(email);

        if (!ticket?.verified || ticket.expiresAt < Date.now() || !found) {
          resets.delete(key);
          return { ok: false, message: 'That reset is no longer valid. Start again.' };
        }

        found.password = password;
        // One code, one reset. Leaving it behind would let the same code set a
        // new password again for the rest of its ten minutes.
        resets.delete(key);

        setAccount(found);
        return { ok: true };
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const signOut = useCallback(() => setAccount(null), []);

  const value = useMemo(
    () => ({
      account,
      busy,
      signUp,
      signIn,
      signInWithProvider,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      signOut,
    }),
    [
      account,
      busy,
      signUp,
      signIn,
      signInWithProvider,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
