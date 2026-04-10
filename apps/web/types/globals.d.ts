/**
 * Global browser API declarations for third-party scripts
 * (Meta Pixel, PWA standalone mode, Sound API)
 */

type FacebookPixelFunction = (
  action: 'track' | 'trackCustom' | 'init',
  event: string,
  params?: Record<string, unknown>
) => void

interface Navigator {
  standalone?: boolean
}

interface Window {
  fbq?: FacebookPixelFunction
}
