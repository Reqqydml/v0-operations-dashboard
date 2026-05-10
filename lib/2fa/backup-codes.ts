// Generate 10 backup codes (8 characters each)
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    const code = generateSingleBackupCode()
    codes.push(code)
  }
  
  return codes
}

// Generate a single backup code
function generateSingleBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Format as XXXX-XXXX for better readability
  return `${code.substring(0, 4)}-${code.substring(4, 8)}`
}

// Verify a backup code
export function verifyBackupCode(code: string, backupCodes: { code: string; used: boolean }[]): boolean {
  const cleanCode = code.replace(/\s|-/g, '').toUpperCase()
  
  for (const bc of backupCodes) {
    const bcClean = bc.code.replace(/\s|-/g, '').toUpperCase()
    if (bcClean === cleanCode && !bc.used) {
      return true
    }
  }
  
  return false
}

// Mark a backup code as used
export function markBackupCodeAsUsed(
  code: string,
  backupCodes: { code: string; used: boolean }[]
): { code: string; used: boolean }[] {
  const cleanCode = code.replace(/\s|-/g, '').toUpperCase()
  
  return backupCodes.map((bc) => {
    const bcClean = bc.code.replace(/\s|-/g, '').toUpperCase()
    if (bcClean === cleanCode) {
      return { ...bc, used: true }
    }
    return bc
  })
}

// Convert backup codes to storage format
export function backupCodesToStorage(codes: string[]): { code: string; used: boolean }[] {
  return codes.map((code) => ({
    code,
    used: false,
  }))
}
