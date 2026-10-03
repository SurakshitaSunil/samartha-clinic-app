import { supabase } from "./supabaseClient";

/**
 * This module handles loading/saving shared app data via Supabase.
 * Every key (patients, appointments, prescriptions, bills, clinic-settings,
 * custom-medicines) is stored as a single row in the `clinic_kv` table,
 * keyed by `key`, with the value stored directly as JSONB — so no manual
 * JSON.stringify/parse is needed.
 *
 * Every `loadShared(key, fallback)` / `saveShared(key, value)` call in
 * App.jsx reads and writes through this module.
 */

export async function loadShared(key, fallback) {
  try {
    const { data, error } = await supabase
      .from("clinic_kv")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return fallback;
    return data.value ?? fallback;
  } catch (err) {
    console.error(`Failed to load "${key}" from Supabase:`, err);
    return fallback;
  }
}

export async function saveShared(key, value) {
  try {
    const { error } = await supabase
      .from("clinic_kv")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      console.error(`Failed to save "${key}" to Supabase:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to save "${key}" to Supabase:`, err);
    return false;
  }
}

/**
 * Subscribes to live changes on the clinic_kv table so that when one
 * device saves data (e.g. reception books an appointment), other open
 * devices (e.g. the doctor's tablet) pick up the change automatically
 * without needing a manual refresh.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToClinicChanges(onChange) {
  const channel = supabase
    .channel("clinic-kv-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "clinic_kv" },
      (payload) => onChange(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
