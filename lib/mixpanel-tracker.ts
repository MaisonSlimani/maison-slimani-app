import mixpanel from 'mixpanel-browser'

/**
 * Comprehensive Mixpanel Analytics Tracker for E-commerce
 * Tracks ALL events an admin needs to know about their website
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MixpanelEvent =
    // Page & Navigation
    | 'Page Viewed'
    | 'Session Started'
    | 'Category Viewed'
    | 'Filter Applied'

    // Product Events
    | 'Product Viewed'
    | 'Product Clicked'
    | 'Product List Viewed'
    | 'Product Shared'
    | 'Product Image Zoomed'
    | 'Product Size Selected'
    | 'Product Color Selected'

    // Cart Events
    | 'Product Added to Cart'
    | 'Product Removed from Cart'
    | 'Cart Quantity Updated'
    | 'Cart Viewed'
    | 'Cart Cleared'

    // Wishlist Events
    | 'Product Added to Wishlist'
    | 'Product Removed from Wishlist'
    | 'Wishlist Viewed'

    // Checkout Funnel
    | 'Checkout Started'
    | 'Checkout Step Viewed'
    | 'Checkout Step Completed'
    | 'Payment Info Entered'
    | 'Order Completed'
    | 'Order Failed'

    // Search Events
    | 'Search Performed'
    | 'Search Results Viewed'
    | 'Search Result Clicked'
    | 'Zero Results Search'

    // User Engagement
    | 'Scroll Depth Reached'
    | 'Time on Page'
    | 'External Link Clicked'
    | 'Social Share Clicked'
    | 'Email Subscribed'

    // Errors & Issues
    | 'Error Occurred'
    | '404 Page Viewed'
    | 'Out of Stock Viewed'
    | 'Slow Page Load'
    | 'Form Validation Error'

    // Reviews & Feedback
    | 'Review Submitted'
    | 'Review Helpful Clicked'
    | 'Contact Form Submitted'

    // Admin-Specific (if tracking admin actions)
    | 'Admin Login'
    | 'Admin Action Performed'

interface EventProperties {
    [key: string]: any
}

// ============================================================================
// MIXPANEL TRACKER CLASS
// ============================================================================

class MixpanelTracker {
    private initialized = false
    private sessionStartTime: number | null = null

    /**
     * Initialize Mixpanel (call once on app load)
     */
    init() {
        if (this.initialized || typeof window === 'undefined') return

        const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
        if (!token) {
            console.warn('⚠️ Mixpanel token not found. Analytics disabled.')
            return
        }

        mixpanel.init(token, {
            debug: false, // Disable to suppress ad blocker errors in dev console
            track_pageview: false, // Manual control
            persistence: 'localStorage',
            ignore_dnt: false, // Respect Do Not Track
            ip: false, // Don't track IP (privacy)
            api_host: 'https://api-eu.mixpanel.com', // EU data residency
            record_sessions_percent: 40, // Record 40% of user sessions
            record_mask_text_class: "mask-text",
            record_block_class: "block-recording",
            record_mask_text_selector: ".mask-text",
            record_block_selector: ".block-recording",
            loaded: (mixpanel) => {
                console.log('✅ Mixpanel initialized')
            },
        })

        this.initialized = true
        this.identifyUser()
        this.registerSuperProperties()
        this.trackSessionStart()
    }

    /**
     * Identify anonymous user with persistent ID
     */
    private identifyUser() {
        let visitorId = localStorage.getItem('visitor_id')
        if (!visitorId) {
            visitorId = `vis_${crypto.randomUUID()}`
            localStorage.setItem('visitor_id', visitorId)
        }
        mixpanel.identify(visitorId)
    }

    /**
     * Register properties sent with every event
     */
    private registerSuperProperties() {
        const utmParams = this.getUTMParams()

        mixpanel.register({
            // Device & Browser
            device_type: this.getDeviceType(),
            browser: this.getBrowser(),
            browser_version: this.getBrowserVersion(),
            os: this.getOS(),
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,

            // Traffic Source
            ...utmParams,
            initial_referrer: document.referrer || 'Direct',

            // App Context
            app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV,
        })
    }

    /**
     * Track session start
     */
    private trackSessionStart() {
        this.sessionStartTime = Date.now()

        const lastSessionTime = localStorage.getItem('last_session_time')
        const now = Date.now()
        const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

        // New session if > 30 min since last activity
        if (!lastSessionTime || now - parseInt(lastSessionTime, 10) > SESSION_TIMEOUT) {
            this.track('Session Started', {
                referrer: document.referrer,
                landing_page: window.location.pathname,
            })
        }

        localStorage.setItem('last_session_time', now.toString())
    }

    /**
     * Track an event
     */
    track(eventName: MixpanelEvent, properties?: EventProperties) {
        if (!this.initialized) {
            console.warn('Mixpanel not initialized')
            return
        }

        mixpanel.track(eventName, {
            ...properties,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            page_path: window.location.pathname,
        })

        // Update last activity
        localStorage.setItem('last_session_time', Date.now().toString())
    }

    // ============================================================================
    // PAGE & NAVIGATION TRACKING
    // ============================================================================

    trackPageView(pageUrl?: string, pageTitle?: string) {
        this.track('Page Viewed', {
            page_url: pageUrl || window.location.pathname,
            page_title: pageTitle || document.title,
            referrer: document.referrer,
        })
    }

    trackCategoryView(category: string, productsShown: number) {
        this.track('Category Viewed', {
            category_name: category,
            products_shown: productsShown,
        })
    }

    trackFilterApplied(filterType: string, filterValue: string) {
        this.track('Filter Applied', {
            filter_type: filterType,
            filter_value: filterValue,
        })
    }

    // ============================================================================
    // PRODUCT TRACKING
    // ============================================================================

    trackProductViewed(product: {
        id: string
        name: string
        category: string
        price: number
        inStock: boolean
        images?: number
        rating?: number
    }) {
        this.track('Product Viewed', {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            price: product.price,
            in_stock: product.inStock,
            images_count: product.images || 0,
            rating: product.rating,
        })
    }

    trackProductClicked(product: { id: string; name: string; position?: number; list?: string }) {
        this.track('Product Clicked', {
            product_id: product.id,
            product_name: product.name,
            position: product.position,
            list_name: product.list,
        })
    }

    trackProductListViewed(listName: string, products: any[], category?: string) {
        this.track('Product List Viewed', {
            list_name: listName,
            category: category,
            products_count: products.length,
            products: products.slice(0, 10).map((p, idx) => ({
                product_id: p.id,
                product_name: p.nom || p.name,
                position: idx + 1,
            })),
        })
    }

    trackProductShared(product: { id: string; name: string }, platform: string) {
        this.track('Product Shared', {
            product_id: product.id,
            product_name: product.name,
            share_platform: platform,
        })
    }

    trackProductImageZoomed(product: { id: string; name: string }, imageIndex: number) {
        this.track('Product Image Zoomed', {
            product_id: product.id,
            product_name: product.name,
            image_index: imageIndex,
        })
    }

    trackSizeSelected(product: { id: string; name: string }, size: string) {
        this.track('Product Size Selected', {
            product_id: product.id,
            product_name: product.name,
            size: size,
        })
    }

    trackColorSelected(product: { id: string; name: string }, color: string) {
        this.track('Product Color Selected', {
            product_id: product.id,
            product_name: product.name,
            color: color,
        })
    }

    // ============================================================================
    // CART TRACKING
    // ============================================================================

    trackAddToCart(product: {
        id: string
        name: string
        category: string
        price: number
        quantity: number
        size?: string
        color?: string
    }) {
        this.track('Product Added to Cart', {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            size: product.size,
            color: product.color,
            cart_value: product.price * product.quantity,
        })
    }

    trackRemoveFromCart(product: { id: string; name: string; price: number; quantity: number }) {
        this.track('Product Removed from Cart', {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            quantity: product.quantity,
        })
    }

    trackCartQuantityUpdated(product: { id: string; name: string }, oldQuantity: number, newQuantity: number) {
        this.track('Cart Quantity Updated', {
            product_id: product.id,
            product_name: product.name,
            old_quantity: oldQuantity,
            new_quantity: newQuantity,
            quantity_change: newQuantity - oldQuantity,
        })
    }

    trackCartViewed(cartItems: any[], cartValue: number) {
        this.track('Cart Viewed', {
            num_items: cartItems.length,
            cart_value: cartValue,
            items: cartItems.map(item => ({
                product_id: item.id,
                product_name: item.nom || item.name,
                quantity: item.quantity,
                price: item.prix || item.price,
            })),
        })
    }

    trackCartCleared() {
        this.track('Cart Cleared', {})
    }

    // ============================================================================
    // WISHLIST TRACKING
    // ============================================================================

    trackAddToWishlist(product: { id: string; name: string; price: number }) {
        this.track('Product Added to Wishlist', {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
        })
    }

    trackRemoveFromWishlist(product: { id: string; name: string }) {
        this.track('Product Removed from Wishlist', {
            product_id: product.id,
            product_name: product.name,
        })
    }

    trackWishlistViewed(itemsCount: number) {
        this.track('Wishlist Viewed', {
            items_count: itemsCount,
        })
    }

    // ============================================================================
    // CHECKOUT FUNNEL TRACKING
    // ============================================================================

    trackCheckoutStarted(cartItems: any[], cartValue: number) {
        this.track('Checkout Started', {
            num_items: cartItems.length,
            cart_value: cartValue,
            items: cartItems.map(item => ({
                product_id: item.id,
                product_name: item.nom || item.name,
                quantity: item.quantity,
                price: item.prix || item.price,
            })),
        })
    }

    trackCheckoutStepViewed(step: number, stepName: string) {
        this.track('Checkout Step Viewed', {
            step_number: step,
            step_name: stepName,
        })
    }

    trackCheckoutStepCompleted(step: number, stepName: string) {
        this.track('Checkout Step Completed', {
            step_number: step,
            step_name: stepName,
        })
    }

    trackPaymentInfoEntered(paymentMethod: string) {
        this.track('Payment Info Entered', {
            payment_method: paymentMethod,
        })
    }

    trackOrderCompleted(order: {
        id: string
        total: number
        numItems: number
        items: any[]
        paymentMethod?: string
        shippingMethod?: string
    }) {
        this.track('Order Completed', {
            order_id: order.id,
            total: order.total,
            num_items: order.numItems,
            payment_method: order.paymentMethod || 'COD',
            shipping_method: order.shippingMethod || 'Standard',
            items: order.items.map(item => ({
                product_id: item.id,
                product_name: item.nom || item.name,
                quantity: item.quantity,
                price: item.prix || item.price,
            })),
        })

        // Track revenue
        mixpanel.people.track_charge(order.total)
        mixpanel.people.increment('lifetime_orders', 1)
        mixpanel.people.increment('lifetime_revenue', order.total)
    }

    trackOrderFailed(reason: string, cartValue: number) {
        this.track('Order Failed', {
            failure_reason: reason,
            cart_value: cartValue,
        })
    }

    // ============================================================================
    // SEARCH TRACKING
    // ============================================================================

    trackSearch(query: string, resultsCount: number) {
        this.track('Search Performed', {
            query: query,
            results_count: resultsCount,
        })

        // Track zero-result searches separately for visibility
        if (resultsCount === 0) {
            this.track('Zero Results Search', {
                query: query,
            })
        }
    }

    trackSearchResultsViewed(query: string, resultsCount: number) {
        this.track('Search Results Viewed', {
            query: query,
            results_count: resultsCount,
        })
    }

    trackSearchResultClicked(query: string, product: { id: string; name: string }, position: number) {
        this.track('Search Result Clicked', {
            query: query,
            product_id: product.id,
            product_name: product.name,
            position: position,
        })
    }

    // ============================================================================
    // ENGAGEMENT TRACKING
    // ============================================================================

    trackScrollDepth(depth: number) {
        if (depth === 25 || depth === 50 || depth === 75 || depth === 100) {
            this.track('Scroll Depth Reached', {
                depth_percentage: depth,
            })
        }
    }

    trackTimeOnPage(seconds: number) {
        if (seconds >= 30) { // Only track if > 30 seconds
            this.track('Time on Page', {
                duration_seconds: seconds,
                page_url: window.location.pathname,
            })
        }
    }

    trackExternalLinkClicked(url: string, linkText: string) {
        this.track('External Link Clicked', {
            url: url,
            link_text: linkText,
        })
    }

    trackSocialShareClicked(platform: string) {
        this.track('Social Share Clicked', {
            platform: platform,
        })
    }

    trackEmailSubscribed(email: string) {
        this.track('Email Subscribed', {})

        // Set user profile
        this.setUserProfile({
            $email: email,
            subscribed_to_email: true,
        })
    }

    // ============================================================================
    // ERROR & ISSUE TRACKING
    // ============================================================================

    trackError(errorType: string, errorMessage: string, context?: any) {
        this.track('Error Occurred', {
            error_type: errorType,
            error_message: errorMessage,
            ...context,
        })
    }

    track404(url: string) {
        this.track('404 Page Viewed', {
            page_url: url,
            referrer: document.referrer,
        })
    }

    trackOutOfStockViewed(product: { id: string; name: string; price: number }) {
        this.track('Out of Stock Viewed', {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            potential_revenue_loss: product.price,
        })
    }

    trackSlowPageLoad(loadTime: number) {
        if (loadTime > 3000) { // > 3 seconds
            this.track('Slow Page Load', {
                load_time_ms: loadTime,
                page_url: window.location.pathname,
            })
        }
    }

    trackFormValidationError(formName: string, fieldName: string, errorMessage: string) {
        this.track('Form Validation Error', {
            form_name: formName,
            field_name: fieldName,
            error_message: errorMessage,
        })
    }

    // ============================================================================
    // REVIEWS & FEEDBACK
    // ============================================================================

    trackReviewSubmitted(product: { id: string; name: string }, rating: number, hasComment: boolean) {
        this.track('Review Submitted', {
            product_id: product.id,
            product_name: product.name,
            rating: rating,
            has_comment: hasComment,
        })
    }

    trackReviewHelpful(reviewId: string, helpful: boolean) {
        this.track('Review Helpful Clicked', {
            review_id: reviewId,
            helpful: helpful,
        })
    }

    trackContactFormSubmitted(topic: string) {
        this.track('Contact Form Submitted', {
            topic: topic,
        })
    }

    // ============================================================================
    // USER PROFILE TRACKING
    // ============================================================================

    /**
     * Set user profile properties (for identified users after order)
     */
    setUserProfile(properties: {
        $email?: string
        $name?: string
        $phone?: string
        [key: string]: any
    }) {
        if (!this.initialized) return

        mixpanel.people.set(properties)

        // If email provided, also set as identifier
        if (properties.$email) {
            mixpanel.alias(properties.$email)
        }
    }

    /**
     * Increment a user property (e.g., total_orders)
     */
    incrementUserProperty(property: string, value: number = 1) {
        if (!this.initialized) return
        mixpanel.people.increment(property, value)
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

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

    private getBrowserVersion(): string {
        const ua = navigator.userAgent
        const match = ua.match(/(Chrome|Safari|Firefox|Edg)\/(\d+)/)
        return match ? match[2] : 'Unknown'
    }

    private getOS(): string {
        const ua = navigator.userAgent
        if (ua.includes('Windows')) return 'Windows'
        if (ua.includes('Mac')) return 'macOS'
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
        if (ua.includes('Android')) return 'Android'
        if (ua.includes('Linux')) return 'Linux'
        return 'Other'
    }

    private getUTMParams() {
        const urlParams = new URLSearchParams(window.location.search)
        return {
            utm_source: urlParams.get('utm_source') || undefined,
            utm_medium: urlParams.get('utm_medium') || undefined,
            utm_campaign: urlParams.get('utm_campaign') || undefined,
            utm_content: urlParams.get('utm_content') || undefined,
            utm_term: urlParams.get('utm_term') || undefined,
        }
    }

    /**
     * Reset user (on logout)
     */
    reset() {
        if (!this.initialized) return
        mixpanel.reset()
        localStorage.removeItem('visitor_id')
    }

    /**
     * Get session duration
     */
    getSessionDuration(): number {
        if (!this.sessionStartTime) return 0
        return Math.floor((Date.now() - this.sessionStartTime) / 1000)
    }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const tracker = new MixpanelTracker()
