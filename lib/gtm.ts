type GTMEvent = {
    event: string
    ecommerce?: any
    [key: string]: any
}

declare global {
    interface Window {
        dataLayer: GTMEvent[]
    }
}

/**
 * Standardize product object for GA4
 */
export const mapProductToGTM = (product: any, index?: number) => {
    return {
        item_id: product.id,
        item_name: product.nom || product.content_name,
        price: product.prix || product.value,
        quantity: product.quantity || 1,
        item_category: product.categorie || product.category,
        item_list_name: product.list_name, // e.g., "Search Results", "Category"
        index: index // Position in list
    }
}

/**
 * Push event to GTM dataLayer
 */
export const pushToDataLayer = (event: GTMEvent) => {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push(event)
    }
}

/**
 * GA4: view_item
 * Triggered when a user views a product details page
 */
export const gtmViewItem = (product: any) => {
    pushToDataLayer({
        event: 'view_item',
        ecommerce: {
            currency: 'MAD',
            value: product.prix,
            items: [mapProductToGTM(product)]
        }
    })
}

/**
 * GA4: add_to_cart
 * Triggered when a user adds a product to cart
 */
export const gtmAddToCart = (product: any) => {
    pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
            currency: 'MAD',
            value: (product.prix || 0) * (product.quantity || 1),
            items: [mapProductToGTM(product)]
        }
    })
}

/**
 * GA4: view_cart
 * Triggered when a user views their cart
 */
export const gtmViewCart = (cartItems: any[], totalValue: number) => {
    pushToDataLayer({
        event: 'view_cart',
        ecommerce: {
            currency: 'MAD',
            value: totalValue,
            items: cartItems.map((item, idx) => mapProductToGTM(item, idx))
        }
    })
}

/**
 * GA4: begin_checkout
 * Triggered when a user starts the checkout process
 */
export const gtmBeginCheckout = (cartItems: any[], totalValue: number) => {
    pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
            currency: 'MAD',
            value: totalValue,
            items: cartItems.map((item, idx) => mapProductToGTM(item, idx))
        }
    })
}

/**
 * GA4: add_payment_info
 * Triggered when a user submits payment info (or moves to payment step)
 */
export const gtmAddPaymentInfo = (cartItems: any[], totalValue: number, paymentType: string) => {
    pushToDataLayer({
        event: 'add_payment_info',
        ecommerce: {
            currency: 'MAD',
            value: totalValue,
            payment_type: paymentType,
            items: cartItems.map((item, idx) => mapProductToGTM(item, idx))
        }
    })
}

/**
 * GA4: purchase
 * Triggered when a purchase is confirmed
 */
export const gtmPurchase = (order: {
    id: string
    value: number
    tax?: number
    shipping?: number
    items: any[]
}) => {
    pushToDataLayer({
        event: 'purchase',
        ecommerce: {
            transaction_id: order.id,
            value: order.value,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
            currency: 'MAD',
            items: order.items.map((item, idx) => mapProductToGTM(item, idx))
        }
    })
}

/**
 * GA4: add_to_wishlist
 */
export const gtmAddToWishlist = (product: any) => {
    pushToDataLayer({
        event: 'add_to_wishlist',
        ecommerce: {
            currency: 'MAD',
            value: product.prix,
            items: [mapProductToGTM(product)]
        }
    })
}

/**
 * GA4: search
 */
export const gtmSearch = (searchTerm: string) => {
    pushToDataLayer({
        event: 'search',
        ecommerce: {
            search_term: searchTerm
        }
    })
}

/**
 * GA4: view_item_list (View Category)
 */
export const gtmViewItemList = (categoryName: string, products: any[]) => {
    pushToDataLayer({
        event: 'view_item_list',
        ecommerce: {
            item_list_name: categoryName,
            items: products.slice(0, 10).map((p, idx) => mapProductToGTM(p, idx)) // Limit to first 10 to avoid huge payloads
        }
    })
}
