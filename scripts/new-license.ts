import { crypto } from "bun";

function generateKey(): string {
  const segment = () =>
    Array.from({ length: 8 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
    ).join("");
  return `INFL-${segment()}-${segment()}-${segment()}`;
}

async function hashKey(key: string): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(key);
  return hasher.digest("hex");
}

const key = generateKey();
const hash = await hashKey(key);

console.log(`
============================================================
  🚀 InfoLib Seamless License Provisioning
============================================================

  1. NEW LICENSE KEY (Give this to the user):
     \x1b[1;32m${key}\x1b[0m

  2. SEAMLESS ACTIVATION (Copy & Paste this into your Terminal):
     \x1b[1;36mnpx supabase db query --linked "INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, notes) VALUES ('${hash}', 'dev@gjc.edu.ph', 'v1.0', true, 1, 'Seamless Dev Key');"\x1b[0m

  3. MANUAL SQL (If step 2 fails):
     INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, notes)
     VALUES ('${hash}', 'dev@gjc.edu.ph', 'v1.0', true, 1, 'Manual Dev Key');

============================================================
`);

// Mark file as module for top-level await
export {};

