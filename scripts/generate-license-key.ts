// scripts/generate-license-key.ts
// M015: Generate a license key + its SHA-256 hash for Supabase insertion.
// Run with: bun run scripts/generate-license-key.ts

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars

function generatePayload(length: number): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values)
    .map((v) => ALPHABET[v % ALPHABET.length])
    .join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const args = process.argv.slice(2);
  const emailIdx = args.indexOf("--email");
  const email = emailIdx !== -1 ? args[emailIdx + 1] : null;

  // Generate 3 blocks of 8 chars each = 24-char payload
  const block1 = generatePayload(8);
  const block2 = generatePayload(8);
  const block3 = generatePayload(8);
  const rawKey = `INFL-${block1}-${block2}-${block3}`;

  // Hash for DB storage (always uppercase the key before hashing for consistency)
  const keyHash = await sha256Hex(rawKey.toUpperCase());

  console.log("=".repeat(60));
  console.log("  InfoLib License Key Generator (Bun Version)");
  console.log("=".repeat(60));
  console.log();
  console.log("  RAW KEY (give to customer ONCE):");
  console.log(`  ${rawKey}`);
  console.log();
  console.log("  SHA-256 HASH (stored in Supabase):");
  console.log(`  ${keyHash}`);
  console.log();
  console.log("  SQL INSERT:");
  console.log(`  INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, notes)`);
  console.log(`  VALUES ('${keyHash}', ${email ? `'${email}'` : "NULL"}, 'v1.0', true, 2, 'Generated ${new Date().toISOString()}');`);
  console.log();
  console.log("=".repeat(60));
}

main();
