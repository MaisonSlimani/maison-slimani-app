import { core } from './core'

export const trackAddToCart = (product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
    size?: string
}) => {
    core.track('Product Added to Cart', {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        size: product.size,
        cart_value: product.price * product.quantity,
    })
}

export const trackRemoveFromCart = (product: { 
    id: string; 
    name: string; 
    price: number; 
    quantity?: number 
}) => {
    core.track('Product Removed from Cart', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.quantity,
    })
}

export const trackAddToWishlist = (product: { id: string; name: string; price: number }) => {
    core.track('Product Added to Wishlist', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
    })
}
