/**
 * Haptic Feedback Utility for Luxury Experience
 * 
 * Provides subtle tactile feedback on supported devices (mobile)
 * Falls back silently on unsupported devices
 */

type VibrationPattern = number | number[]

const canVibrate = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Trigger a vibration pattern if supported
 */
const vibrate = (pattern: VibrationPattern): boolean => {
  if (canVibrate()) {
    return navigator.vibrate(pattern)
  }
  return false
}

/**
 * Haptic feedback patterns for different interactions
 */
export const haptics = {
  /**
   * Light tap - for button presses, nav taps
   */
  light: () => vibrate(10),

  /**
   * Medium tap - for selections, toggles
   */
  medium: () => vibrate(25),

  /**
   * Heavy tap - for important actions
   */
  heavy: () => vibrate(40),

  /**
   * Success pattern - for add to cart, successful actions
   */
  success: () => vibrate([10, 30, 10]),

  /**
   * Error pattern - for form errors, failed actions
   */
  error: () => vibrate([40, 20, 40]),

  /**
   * Selection change - for changing options
   */
  selection: () => vibrate(15),

  /**
   * Impact - for pull-to-refresh threshold, important moments
   */
  impact: () => vibrate(50),

  /**
   * Double tap feedback
   */
  double: () => vibrate([10, 50, 10]),

  /**
   * Custom pattern
   */
  custom: (pattern: VibrationPattern) => vibrate(pattern),
}

/**
 * Hook-friendly haptic trigger that can be used in event handlers
 * Usage: onClick={() => { hapticFeedback('light'); doSomething(); }}
 */
export const hapticFeedback = (
  type: keyof Omit<typeof haptics, 'custom'> = 'light'
): void => {
  haptics[type]()
}

export default haptics

