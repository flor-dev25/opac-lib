// supabase/functions/verify-license/index.ts
// M015 S01-T03: License Verification Edge Function

import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** SHA-256 hex hash of a string */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** JSON response helper */
function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/** Core request handler */
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  try {
    const { license_key, machine_id, machine_label } = await req.json();

    if (!license_key || !machine_id) {
      return jsonResponse(200, { error: "missing_fields" });
    }

    // 1. Hash the incoming key
    const keyHash = await sha256Hex(license_key.trim().toUpperCase());

    // 2. Connect with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
      return jsonResponse(200, { error: "server_config_missing" });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 3. Look up license by hash
    const { data: license, error: lookupError } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key_hash", keyHash)
      .single();

    if (lookupError || !license) {
      return jsonResponse(200, { error: "invalid_key" });
    }

    // 4. Check revocation
    if (!license.is_active) {
      return jsonResponse(200, { error: "revoked" });
    }

    // 5. Check expiry
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return jsonResponse(200, { error: "expired" });
    }

    // 6. Check if this machine already activated this key
    const { data: existingActivation } = await supabase
      .from("activations")
      .select("id")
      .eq("license_id", license.id)
      .eq("machine_id", machine_id)
      .single();

    if (existingActivation) {
      await supabase
        .from("activations")
        .update({ last_validated_at: new Date().toISOString() })
        .eq("id", existingActivation.id);

      return jsonResponse(200, { status: "already_yours" });
    }

    // 7. Count other activations (exclude current machine)
    const { count } = await supabase
      .from("activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", license.id);

    if ((count ?? 0) >= license.max_activations) {
      return jsonResponse(200, { error: "max_activations_reached" });
    }

    // 8. Create new activation
    const { error: insertError } = await supabase.from("activations").insert({
      license_id: license.id,
      machine_id: machine_id,
      machine_label: machine_label || null,
      activated_at: new Date().toISOString(),
      last_validated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Activation insert failed:", insertError);
      return jsonResponse(200, { error: "activation_failed" });
    }

    return jsonResponse(200, { status: "activated" });
  } catch (err) {
    console.error("verify-license error:", err);
    return jsonResponse(200, { error: "internal_error" });
  }
}

// Supabase Edge Function Entry Point (Deno)
Deno.serve(handleRequest);
