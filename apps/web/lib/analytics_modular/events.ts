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
  contents: Array<{ id: string; nom?: string; quantity: number; item_price?: number }>
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
    nom: p.content_name ?? '',
    prix: p.value ?? 0,
    categorie: p.categorie ?? 'General',
  } as Product)
}

export function trackAddToCart(p: MetaProductPayload) {
  trackEvent('AddToCart', p)
  GTM.gtmAddToCart({
    id: p.content_ids?.[0] ?? '',
    nom: p.content_name ?? '',
    prix: p.value ?? 0,
    quantite: p.contents?.[0]?.quantity ?? 1,
    categorie: p.categorie ?? null,
  } as CartItem)
}

export function trackInitiateCheckout(d: MetaCheckoutPayload) {
  trackEvent('InitiateCheckout', d)
  const items: CartItem[] = d.contents.map((i) => ({
    id: i.id,
    nom: i.nom ?? `Product ${i.id}`,
    prix: i.item_price ?? 0,
    quantite: i.quantity,
    image_url: null,
  }))
  GTM.gtmBeginCheckout(items, d.value)
}

export function trackPurchase(d: MetaCheckoutPayload) {
  trackEvent('Purchase', d)
  const items: CartItem[] = d.contents.map((i) => ({
    id: i.id,
    nom: i.nom ?? `Product ${i.id}`,
    prix: i.item_price ?? 0,
    quantite: i.quantity,
    image_url: null,
  }))
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
