import { calculatePasswordStrength, validatePasswordRequirements, PasswordStrength } from '@/lib/password-validation'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password)
  const requirements = validatePasswordRequirements(password)

  const strengthColors = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  }

  const strengthTextColors = {
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
  }

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Password Strength</label>
          <span className={`text-xs font-medium ${strengthTextColors[strength.color]}`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= strength.score ? strengthColors[strength.color] : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Password Requirements:</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <RequirementItem
              label="At least 8 characters"
              met={requirements.minLength}
            />
            <RequirementItem
              label="Uppercase letter (A-Z)"
              met={requirements.hasUppercase}
            />
            <RequirementItem
              label="Number (0-9)"
              met={requirements.hasNumber}
            />
            <RequirementItem
              label="Special character (!@#$...)"
              met={requirements.hasSpecialChar}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  label: string
  met: boolean
}

function RequirementItem({ label, met }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      )}
      <span className={`text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}
