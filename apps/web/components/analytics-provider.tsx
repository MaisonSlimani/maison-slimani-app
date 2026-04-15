'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { tracker } from '@/lib/mixpanel-tracker'

/**
 * Analytics Provider Component
 * - Initializes Mixpanel on app load
 * - Tracks page views on route changes
 * - Tracks scroll depth
 * - Tracks time on page
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Initialize Mixpanel once on mount
    useEffect(() => {
        tracker.init()
    }, [])

    // Track page views on route change
    useEffect(() => {
        tracker.trackPageView()
    }, [pathname, searchParams])

    // Track scroll depth
    useEffect(() => {
        let maxScroll = 0
        const trackedDepths = new Set<number>()

        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop

            const scrollPercentage = Math.round(
                ((scrollTop + windowHeight) / documentHeight) * 100
            )

            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage
            }

            // Track at 25%, 50%, 75%, 100%
            const milestones = [25, 50, 75, 100]
            milestones.forEach(depth => {
                if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
                    tracker.trackScrollDepth(depth)
                    trackedDepths.add(depth)
                }
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [pathname])

    // Track time on page
    useEffect(() => {
        const startTime = Date.now()

        return () => {
            const duration = Math.floor((Date.now() - startTime) / 1000)
            tracker.trackTimeOnPage(duration)
        }
    }, [pathname])

    // Track page load performance
    useEffect(() => {
        if (typeof window !== 'undefined' && window.performance) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart

            if (loadTime > 0) {
                tracker.trackSlowPageLoad(loadTime)
            }
        }
    }, [pathname])

    // Track JavaScript errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            tracker.trackError('javascript', event.message, {
                stack: event.error?.stack?.substring(0, 500), // Truncate for privacy
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
            })
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            tracker.trackError('promise_rejection', String(event.reason), {
                page_url: window.location.pathname,
            })
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [])

    return <>{children}</>
}
