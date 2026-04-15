import { Product, CartItem } from '@maison/domain'

/**
 * A product-like object that can be mapped to a GA4 GTM item.
 * Standardizes access to clean Domain properties.
 * Refactored to remove all legacy French fallback fields.
 */
export interface GTMProductInput {
  id: string
  name?: string
  price?: number
  quantity?: number
  category?: string | null
  list_name?: string
}

type GTMEvent = {
    event: string
    ecommerce?: {
        currency?: string
        value?: number
        items?: ReturnType<typeof mapProductToGTM>[]
        transaction_id?: string
        tax?: number
        shipping?: number
        item_list_name?: string
        payment_type?: string
        search_term?: string
    }
    [key: string]: unknown
}

declare global {
    interface Window {
        dataLayer: GTMEvent[]
    }
}

/**
 * Standardize product object for GA4
 */
export const mapProductToGTM = (product: GTMProductInput, index?: number) => {
    return {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity ?? 1,
        item_category: product.category,
        item_list_name: product.list_name,
        index,
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
 */
export const gtmViewItem = (product: Product) => {
    pushToDataLayer({
        event: 'view_item',
        ecommerce: {
            currency: 'MAD',
            value: product.price,
            items: [mapProductToGTM(product)]
        }
    })
}

/**
 * GA4: add_to_cart
 */
export const gtmAddToCart = (product: CartItem) => {
    pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
            currency: 'MAD',
            value: (product.price || 0) * (product.quantity || 1),
            items: [mapProductToGTM(product)]
        }
    })
}

/**
 * GA4: view_cart
 */
export const gtmViewCart = (cartItems: CartItem[], totalValue: number) => {
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
 */
export const gtmBeginCheckout = (cartItems: CartItem[], totalValue: number) => {
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
 */
export const gtmAddPaymentInfo = (cartItems: CartItem[], totalValue: number, paymentType: string) => {
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
 */
export const gtmPurchase = (order: {
    id: string
    value: number
    tax?: number
    shipping?: number
    items: CartItem[]
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
export const gtmAddToWishlist = (product: Product | CartItem) => {
    pushToDataLayer({
        event: 'add_to_wishlist',
        ecommerce: {
            currency: 'MAD',
            value: product.price,
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
export const gtmViewItemList = (categoryName: string, products: Product[]) => {
    pushToDataLayer({
        event: 'view_item_list',
        ecommerce: {
            item_list_name: categoryName,
            items: products.slice(0, 10).map((p, idx) => mapProductToGTM(p, idx))
        }
    })
}
