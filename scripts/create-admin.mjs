/**
 * Creates the first backoffice user, or promotes an existing one.
 *
 * This exists because the backoffice cannot bootstrap itself. `requireAdmin()`
 * demands two things: a Supabase Auth session, and a row in `admins`. The RLS
 * policy on `admins` only lets an admin write to it, so the very first row can
 * never be created from the panel — it needs the service-role key, which lives
 * on a developer machine and never ships to the app.
 *
 *   node scripts/create-admin.mjs <email> [password]
 *
 * Omit the password and one is generated and printed once. Re-running with an
 * existing email does not fail: it reuses the account, updates the password if
 * you passed one, and makes sure the `admins` row is there.
 */

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPECTED_REF = 'zqdtjbjybefomumkbwmd';

if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Same guard as the seed: this repo must never write to another client's
// project. The GymSmartAccess projects live in a different Supabase account.
if (!URL.includes(EXPECTED_REF)) {
  console.error(`Refusing to run: expected project ${EXPECTED_REF}, got ${URL}`);
  process.exit(1);
}

const [email, passwordArg] = process.argv.slice(2);

if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/create-admin.mjs <email> [password]');
  process.exit(1);
}

const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

/**
 * Generated passwords are shown once in a terminal and typed by hand, so the
 * alphabet matters more than raw density. base64url was the wrong choice: it
 * emits `-` and `_` and mixes characters that are indistinguishable in most
 * terminal fonts (l/I/1, O/0), which turns a correct password into a failed
 * login with no way to tell the two apart.
 *
 * 20 characters from an unambiguous 32-symbol alphabet is 100 bits — more than
 * enough — and grouping them makes the string possible to read aloud.
 */
function generatePassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(20);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);

  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join('')).join('-');
}

/**
 * Supabase has no get-user-by-email, so the list is paged through. Fine at this
 * scale, and it keeps the script idempotent instead of failing on a re-run.
 */
async function findUserByEmail(target) {
  const wanted = target.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === wanted);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const password = passwordArg ?? generatePassword();
const generated = !passwordArg;

let user = await findUserByEmail(email);

if (user) {
  console.log(`user already exists: ${email}`);
  if (passwordArg) {
    const { error } = await db.auth.admin.updateUserById(user.id, { password });
    if (error) throw new Error(`updateUser: ${error.message}`);
    console.log('  password updated');
  }
} else {
  // `email_confirm: true` skips the confirmation mail: there is no inbox flow
  // to complete for an account created from a developer machine, and an
  // unconfirmed user cannot sign in.
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  user = data.user;
  console.log(`user created: ${email}`);
}

// Upsert rather than insert: promoting someone who is already an admin should
// be a no-op, not an error.
const { error: adminError } = await db
  .from('admins')
  .upsert({ user_id: user.id }, { onConflict: 'user_id' });

if (adminError) throw new Error(`admins: ${adminError.message}`);

const { count } = await db.from('admins').select('*', { count: 'exact', head: true });

console.log(`admin row ready (${count} admin${count === 1 ? '' : 's'} total)`);
console.log(`\n  email:    ${email}`);
if (generated) {
  console.log(`  password: ${password}`);
  console.log('\n  Shown once — store it now. Re-run with a password argument to change it.');
}
console.log('\nSign in at /admin/login');
