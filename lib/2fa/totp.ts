import { createHmac } from 'crypto'

// Generate a random TOTP secret (base32 encoded)
export function generateTOTPSecret(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

// Verify a TOTP code given a secret
export function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const cleanToken = token.replace(/\s/g, '')
  
  if (!/^\d{6}$/.test(cleanToken)) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  const timeStep = 30
  const digits = 6

  for (let i = -window; i <= window; i++) {
    const counter = Math.floor((now + i * timeStep) / timeStep)
    const code = generateTOTPCode(secret, counter, digits)
    
    if (code === cleanToken) {
      return true
    }
  }

  return false
}

// Generate TOTP code for a given counter
function generateTOTPCode(secret: string, counter: number, digits: number = 6): string {
  const hmac = createHmac('sha1', base32Decode(secret))
  const buffer = Buffer.alloc(8)
  
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter & 0xff
    counter = counter >> 8
  }

  hmac.update(buffer)
  const digest = hmac.digest()
  const offset = digest[digest.length - 1] & 0xf
  const code = (
    (digest[offset] & 0x7f) << 24 |
    (digest[offset + 1] & 0xff) << 16 |
    (digest[offset + 2] & 0xff) << 8 |
    (digest[offset + 3] & 0xff)
  ) % Math.pow(10, digits)

  return code.toString().padStart(digits, '0')
}

// Base32 decode
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const encoded_upper = encoded.toUpperCase()
  let bits = 0
  let value = 0
  const output: number[] = []

  for (let i = 0; i < encoded_upper.length; i++) {
    const index = alphabet.indexOf(encoded_upper[i])
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${encoded_upper[i]}`)
    }
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bits -= 8
      output.push((value >> bits) & 0xff)
    }
  }

  return Buffer.from(output)
}

// Generate QR code URI for TOTP setup (compatible with Google Authenticator, etc.)
export function generateTOTPURI(secret: string, email: string, issuer: string = 'Hamduk Digital Hub'): string {
  const encodedEmail = encodeURIComponent(email)
  const encodedIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`
}
