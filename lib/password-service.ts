"use client";

import { createClient } from "@/lib/supabase/client";
import { encryptPassword, decryptPassword } from "@/lib/encryption";

export type PasswordCategory =
  | "Social"
  | "Bank"
  | "Learning"
  | "Business"
  | "Government"
  | "Technology";

export interface PasswordEntry {
  id: string;
  user_id: string;
  service_name: string;
  username: string;
  encrypted_password: string;
  website: string | null;
  category: PasswordCategory;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecryptedPasswordEntry extends Omit<PasswordEntry, "encrypted_password"> {
  password: string;
}

// Get master key from session storage (set during login)
export function getMasterKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("vault_master_key");
}

export function setMasterKey(key: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("vault_master_key", key);
  }
}

export function clearMasterKey(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("vault_master_key");
  }
}

// Generate a random vault key (32 bytes, base64). Used once per user, stored in DB.
function generateRandomVaultKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Fetch the user's vault key from the DB (or create one if createIfMissing).
 * Returns true if vault key was set, false if no row and not creating (existing user: use login password).
 * Passwords are tied to the account (vault key), not the login password, so changing password keeps access.
 */
export async function fetchVaultKeyAndSet(createIfMissing = false): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: row, error: selectError } = await supabase
    .from("user_vault_keys")
    .select("encryption_key")
    .eq("user_id", user.id)
    .maybeSingle();

  // If table doesn't exist or error (e.g. RLS), return false so login can use password as key
  if (selectError) {
    return false;
  }

  if (row?.encryption_key) {
    setMasterKey(row.encryption_key);
    return true;
  }

  if (createIfMissing) {
    const vaultKey = generateRandomVaultKey();
    const { error: insertError } = await supabase
      .from("user_vault_keys")
      .insert({ user_id: user.id, encryption_key: vaultKey });
    if (insertError) {
      throw new Error("No se pudo crear la clave de la bóveda. Vuelve a intentar.");
    }
    setMasterKey(vaultKey);
    return true;
  }

  return false;
}

export async function fetchPasswords(): Promise<DecryptedPasswordEntry[]> {
  const supabase = createClient();
  const masterKey = getMasterKey();

  if (!masterKey) {
    throw new Error("Master key not found. Please log in again.");
  }

  const { data, error } = await supabase
    .from("passwords")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Decrypt passwords client-side (vault key is tied to account, not login password)
  const decryptedData: DecryptedPasswordEntry[] = await Promise.all(
    (data || []).map(async (entry: PasswordEntry) => {
      const decryptedPassword = await decryptPassword(
        entry.encrypted_password,
        masterKey
      );
      const { encrypted_password, ...rest } = entry;
      return {
        ...rest,
        password: decryptedPassword,
      };
    })
  );

  return decryptedData;
}

export async function createPassword(
  data: {
    service_name: string;
    username: string;
    password: string;
    website?: string;
    category: PasswordCategory;
    notes?: string;
  }
): Promise<DecryptedPasswordEntry> {
  const supabase = createClient();
  const masterKey = getMasterKey();

  if (!masterKey) {
    throw new Error("Master key not found. Please log in again.");
  }

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error("Not authenticated");
  }

  // Encrypt password client-side before sending to server
  const encryptedPassword = await encryptPassword(data.password, masterKey);

  const { data: newEntry, error } = await supabase
    .from("passwords")
    .insert({
      user_id: user.user.id,
      service_name: data.service_name,
      email: data.username,
      username: data.username,
      encrypted_password: encryptedPassword,
      website: data.website || null,
      category: data.category,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { encrypted_password, ...rest } = newEntry;
  return {
    ...rest,
    password: data.password,
  };
}

export async function updatePassword(
  id: string,
  data: {
    service_name?: string;
    username?: string;
    password?: string;
    website?: string;
    category?: PasswordCategory;
    notes?: string;
  }
): Promise<DecryptedPasswordEntry> {
  const supabase = createClient();
  const masterKey = getMasterKey();

  if (!masterKey) {
    throw new Error("Master key not found. Please log in again.");
  }

  const updateData: Record<string, unknown> = {};

  if (data.service_name !== undefined) updateData.service_name = data.service_name;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.website !== undefined) updateData.website = data.website || null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  // Only encrypt password if it's being updated
  if (data.password !== undefined) {
    updateData.encrypted_password = await encryptPassword(data.password, masterKey);
  }

  const { data: updatedEntry, error } = await supabase
    .from("passwords")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Decrypt the password for the returned entry
  const decryptedPassword = await decryptPassword(
    updatedEntry.encrypted_password,
    masterKey
  );

  const { encrypted_password, ...rest } = updatedEntry;
  return {
    ...rest,
    password: decryptedPassword,
  };
}

export async function deletePassword(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("passwords").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
