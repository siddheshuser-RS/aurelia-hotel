#!/usr/bin/env node
/**
 * Aurelia – Secure secrets generator
 *
 * Usage:
 *   node scripts/generate-secrets.js           # print only
 *   node scripts/generate-secrets.js --write   # write to ./.env (refuses to overwrite)
 *   node scripts/generate-secrets.js --force   # overwrite existing .env (DANGEROUS)
 *
 * Generated secrets:
 *   - DB_SA_PASSWORD       (24 chars, SQL Server complexity rules, shell-safe)
 *   - JWT_SECRET           (64-char hex = 256 bits of entropy)
 *   - SEED_ADMIN_PASSWORD  (20 chars, complex)
 *
 * IMPORTANT
 *   • .env is gitignored. NEVER commit it.
 *   • Use DIFFERENT secrets per environment (local / staging / prod).
 *   • Rotate quarterly, or immediately if ever exposed.
 *   • For CI/CD use GitHub Actions Secrets. For Azure use Key Vault.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2));
const WRITE = args.has('--write') || args.has('--force');
const FORCE = args.has('--force');

// ── helpers ──────────────────────────────────────────────────────────────────
function jwtSecret() {
  // 32 random bytes -> 64 hex chars. Hex is safe inside any shell / .env / YAML.
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Strong password using ONLY symbols that are safe inside:
 *   - shell / PowerShell
 *   - .env files
 *   - YAML (docker-compose)
 *   - SQL Server connection strings  ( ; : = / ? & must be avoided )
 * Allowed symbols:  !@#%^*-_+
 * Guarantees at least one of each required class (SQL Server policy compliant).
 */
function strongPassword(length = 24) {
  if (length < 12) throw new Error('length must be >= 12');
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#%^*-_+';

  const pick = (set) => set[crypto.randomInt(0, set.length)];

  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const all = upper + lower + digits + symbols;
  while (chars.length < length) chars.push(pick(all));

  // crypto-secure Fisher–Yates shuffle (Math.random would be a footgun for secrets)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// ── generate ─────────────────────────────────────────────────────────────────
const secrets = {
  DB_SA_PASSWORD: strongPassword(24),
  JWT_SECRET: jwtSecret(),
  SEED_ADMIN_PASSWORD: strongPassword(20),
};

const envBody = `# =============================================================================
# Aurelia – LOCAL secrets (auto-generated)
# Generated: ${new Date().toISOString()}
#
# ⚠  NEVER COMMIT THIS FILE. It is gitignored for a reason.
# ⚠  Different secrets for different machines / environments.
# =============================================================================

# ── Required ─────────────────────────────────────────────────────────────────
DB_SA_PASSWORD=${secrets.DB_SA_PASSWORD}
JWT_SECRET=${secrets.JWT_SECRET}

SEED_ADMIN_EMAIL=admin@aurelia.local
SEED_ADMIN_PASSWORD=${secrets.SEED_ADMIN_PASSWORD}

# ── Optional overrides (uncomment as needed) ─────────────────────────────────
# JWT_EXPIRES_IN=7d
# BCRYPT_ROUNDS=10
# MAX_UPLOAD_MB=5
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
# NEXT_SERVER_API_PROXY_TARGET=http://backend:5001
# ALLOWED_ORIGINS=
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
`;

// ── output ───────────────────────────────────────────────────────────────────
console.log('\n📋 SECURE SECRETS GENERATOR');
console.log('='.repeat(60));
console.log('\n🔐 DB_SA_PASSWORD      :', secrets.DB_SA_PASSWORD);
console.log('🔐 JWT_SECRET          :', secrets.JWT_SECRET);
console.log('🔐 SEED_ADMIN_PASSWORD :', secrets.SEED_ADMIN_PASSWORD);

if (WRITE) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath) && !FORCE) {
    console.error(`\n❌ Refusing to overwrite existing ${envPath}`);
    console.error('   Re-run with --force if you really want to replace it.');
    process.exit(1);
  }
  fs.writeFileSync(envPath, envBody, { mode: 0o600 });
  console.log(`\n✅ Wrote ${envPath} (permissions 600 where supported)`);
} else {
  console.log('\nℹ  Re-run with --write to save these into ./.env automatically.');
}

console.log('\n💾 Where to store secrets:');
console.log('   LOCAL  : ./.env                       (gitignored)');
console.log('   CI/CD  : GitHub → Settings → Secrets and variables → Actions');
console.log('   AZURE  : Azure Key Vault + Managed Identity (later in the roadmap)');

console.log('\n⚠  SECURITY REMINDERS');
console.log('   ✅ Different secrets per environment');
console.log('   ✅ Rotate quarterly (or immediately if exposed)');
console.log('   ❌ Never commit .env');
console.log('   ❌ Never log or echo secrets');
console.log('   ❌ Never paste secrets into chat / tickets / screenshots');
console.log('\n' + '='.repeat(60) + '\n');
