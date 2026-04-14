import { Product, CartItem } from '@maison/domain'
import { trackEvent, trackCustom } from './meta'
import * as GTM from '../gtm'

/**
 * Analytics payload for a product (Meta Pixel format)
 */
interface MetaProductPayload {
  content_ids?: string[]
  content_name?: string
  content_type?: string
  value?: number
  currency?: string
  categorie?: string
  contents?: Array<{ id: string; quantity: number; item_price?: number }>
  [key: string]: unknown
}

interface MetaCheckoutPayload {
  contents: Array<{ id: string; name?: string; quantity: number; item_price?: number }>
  value: number
  order_id?: string
  tax?: number
  shipping?: number
  [key: string]: unknown
}

export function trackViewContent(p: MetaProductPayload) {
  trackEvent('ViewContent', p)
  GTM.gtmViewItem({
    id: p.content_ids?.[0] ?? '',
    name: p.content_name ?? '',
    price: p.value ?? 0,
    category: p.categorie ?? 'General',
  } as Product)
}

export function trackAddToCart(p: MetaProductPayload) {
  trackEvent('AddToCart', p)
  GTM.gtmAddToCart({
    id: p.content_ids?.[0] ?? '',
    name: p.content_name ?? '',
    price: p.value ?? 0,
    quantity: p.contents?.[0]?.quantity ?? 1,
    category: p.categorie ?? null,
  } as CartItem)
}

export function trackInitiateCheckout(d: MetaCheckoutPayload) {
  trackEvent('InitiateCheckout', d)
  const items: CartItem[] = d.contents.map((i) => ({
    id: i.id,
    name: i.name ?? `Product ${i.id}`,
    price: i.item_price ?? 0,
    quantity: i.quantity,
    image_url: null,
  })) as CartItem[]
  GTM.gtmBeginCheckout(items, d.value)
}

export function trackPurchase(d: MetaCheckoutPayload) {
  trackEvent('Purchase', d)
  const items: CartItem[] = d.contents.map((i) => ({
    id: i.id,
    name: i.name ?? `Product ${i.id}`,
    price: i.item_price ?? 0,
    quantity: i.quantity,
    image_url: null,
  })) as CartItem[]
  GTM.gtmPurchase({ id: d.order_id ?? '', value: d.value, tax: d.tax, shipping: d.shipping, items })
}

export function trackSearch(searchString: string) {
  trackEvent('Search', { search_string: searchString })
  GTM.gtmSearch(searchString)
}

export function trackViewCategory(categoryName: string, products: Product[] = []) {
  trackCustom('ViewCategory', { content_name: categoryName, content_category: categoryName })
  GTM.gtmViewItemList(categoryName, products)
}
