import mixpanel from 'mixpanel-browser'

export type MixpanelEvent = string;

export interface EventProperties {
    [key: string]: unknown
}

export class MixpanelCore {
    private initialized = false
    private sessionStartTime: number | null = null

    init() {
        if (this.initialized || typeof window === 'undefined') return

        const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
        if (!token) return

        mixpanel.init(token, {
            debug: false,
            track_pageview: false,
            persistence: 'localStorage',
            api_host: 'https://api-eu.mixpanel.com',
            loaded: () => console.log('✅ Mixpanel initialized'),
        })

        this.initialized = true
        this.identifyUser()
        this.registerSuperProperties()
        this.trackSessionStart()
    }

    private identifyUser() {
        let visitorId = localStorage.getItem('visitor_id')
        if (!visitorId) {
            visitorId = `vis_${crypto.randomUUID()}`
            localStorage.setItem('visitor_id', visitorId)
        }
        mixpanel.identify(visitorId)
    }

    private registerSuperProperties() {
        mixpanel.register({
            device_type: this.getDeviceType(),
            browser: this.getBrowser(),
            app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV,
        })
    }

    private trackSessionStart() {
        this.sessionStartTime = Date.now()
        this.track('Session Started', { landing_page: window.location.pathname })
    }

    track(eventName: MixpanelEvent, properties?: EventProperties) {
        if (!this.initialized) return
        mixpanel.track(eventName, {
            ...properties,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
        })
    }

    setUserProfile(profile: Record<string, unknown>) {
        if (!this.initialized) return
        mixpanel.people.set(profile)
    }

    private getDeviceType(): string {
        const ua = navigator.userAgent
        if (/mobile/i.test(ua)) return 'mobile'
        if (/tablet|ipad/i.test(ua)) return 'tablet'
        return 'desktop'
    }

    private getBrowser(): string {
        const ua = navigator.userAgent
        if (ua.includes('Edg')) return 'Edge'
        if (ua.includes('Chrome')) return 'Chrome'
        if (ua.includes('Safari')) return 'Safari'
        if (ua.includes('Firefox')) return 'Firefox'
        return 'Other'
    }
}

export const core = new MixpanelCore()
