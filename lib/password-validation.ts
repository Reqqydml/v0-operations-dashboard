export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 // 0=Weak, 1=Fair, 2=Strong, 3=Very Strong
  label: 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  color: 'red' | 'amber' | 'blue' | 'green'
}

export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

const PASSWORD_MIN_LENGTH = 8
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
const UPPERCASE_REGEX = /[A-Z]/
const NUMBER_REGEX = /[0-9]/

export function validatePasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: UPPERCASE_REGEX.test(password),
    hasNumber: NUMBER_REGEX.test(password),
    hasSpecialChar: SPECIAL_CHAR_REGEX.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const requirements = validatePasswordRequirements(password)
  return (
    requirements.minLength &&
    requirements.hasUppercase &&
    requirements.hasNumber &&
    requirements.hasSpecialChar
  )
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = validatePasswordRequirements(password)
  const metRequirements = Object.values(requirements).filter(Boolean).length

  let score: PasswordStrength['score'] = 0
  let label: PasswordStrength['label'] = 'Weak'
  let color: PasswordStrength['color'] = 'red'

  if (metRequirements >= 4 && password.length >= 12) {
    score = 3
    label = 'Very Strong'
    color = 'green'
  } else if (metRequirements === 4) {
    score = 2
    label = 'Strong'
    color = 'blue'
  } else if (metRequirements >= 2) {
    score = 1
    label = 'Fair'
    color = 'amber'
  } else {
    score = 0
    label = 'Weak'
    color = 'red'
  }

  return { score, label, color }
}
