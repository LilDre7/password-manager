// Client-side encryption using Web Crypto API
// Passwords are encrypted before being sent to the database

const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16
const ITERATIONS = 100000

// Derive a cryptographic key from user's master password
async function deriveKey(
  masterPassword: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

// Encrypt a plaintext password
export async function encryptPassword(
  plaintext: string,
  masterPassword: string
): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(masterPassword, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  // Combine salt + iv + ciphertext and encode as base64
  const combined = new Uint8Array(
    salt.length + iv.length + new Uint8Array(encrypted).length
  )
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

// Decrypt an encrypted password
export async function decryptPassword(
  encryptedBase64: string,
  masterPassword: string
): Promise<string> {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split("")
      .map((c) => c.charCodeAt(0))
  )

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(masterPassword, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

// Store the master password hash in memory (not persisted)
let masterPasswordKey: string | null = null

export function setMasterPassword(password: string) {
  masterPasswordKey = password
}

export function getMasterPassword(): string | null {
  return masterPasswordKey
}

export function clearMasterPassword() {
  masterPasswordKey = null
}
