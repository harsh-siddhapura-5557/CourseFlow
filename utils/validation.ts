/**
 * Client-side validation for auth. Keeps rules aligned across login/register
 * and avoids shipping slightly different regexes per screen.
 */

const EMAIL_MAX = 254;
const USERNAME_MIN = 3;
const USERNAME_MAX = 32;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

/** Practical email check (ASCII-oriented; good UX without full RFC 5322). */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Username for registration: letters, numbers, underscore, dot, hyphen. */
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** Login identifier when user types a username (no @). */
const LOGIN_USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateEmail(value: string): string | null {
  const t = value.trim();
  if (!t) return "Email is required";
  if (t.length > EMAIL_MAX) return "Email is too long";
  if (!EMAIL_PATTERN.test(t)) return "Please enter a valid email address";
  return null;
}

export function validateRegisterUsername(value: string): string | null {
  const t = value.trim();
  if (!t) return "Username is required";
  if (t.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (t.length > USERNAME_MAX) return `Username must be at most ${USERNAME_MAX} characters`;
  if (!USERNAME_PATTERN.test(t)) {
    return "Use only letters, numbers, dots, underscores, or hyphens";
  }
  return null;
}

export function validateRegisterPassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`;
  }
  if (value.length > PASSWORD_MAX) return "Password is too long";
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return "Include at least one letter and one number";
  }
  return null;
}

/** Login field accepts email (validated) or username (pattern only). */
export function validateLoginIdentifier(value: string): string | null {
  const t = value.trim();
  if (!t) return "Username or email is required";
  if (t.includes("@")) {
    return validateEmail(t);
  }
  if (t.length > USERNAME_MAX) return "Username is too long";
  if (!LOGIN_USERNAME_PATTERN.test(t)) {
    return "Use only letters, numbers, dots, underscores, or hyphens";
  }
  return null;
}
