import { createHash } from 'crypto'

// Generate a device fingerprint based on user-agent and other browser properties
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
  ]

  const combined = components.join('|')
  return createHash('sha256').update(combined).digest('hex')
}

// Generate a human-readable device name from user-agent
export function generateDeviceName(): string {
  if (typeof window === 'undefined') {
    return 'Unknown Device'
  }

  const ua = navigator.userAgent
  let browserName = 'Unknown Browser'
  let osName = 'Unknown OS'

  // Browser detection
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari'
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome'
  } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
    browserName = 'Edge'
  }

  // OS detection
  if (ua.indexOf('Windows') > -1) {
    osName = 'Windows'
  } else if (ua.indexOf('Mac') > -1) {
    osName = 'macOS'
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux'
  } else if (ua.indexOf('iPhone') > -1) {
    osName = 'iOS'
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android'
  }

  return `${browserName} on ${osName}`
}
