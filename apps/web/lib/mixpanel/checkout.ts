import { core } from './core'

export const trackCheckoutStarted = (cartItems: { id: string; name?: string; quantity?: number; price?: number }[], cartValue: number) => {
    core.track('Checkout Started', {
        num_items: cartItems.length,
        cart_value: cartValue,
        items: cartItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
    })
}

export const trackCheckoutStepViewed = (step: number, stepName: string) => {
    core.track('Checkout Step Viewed', {
        step_number: step,
        step_name: stepName,
    })
}

export const trackOrderCompleted = (order: {
    id: string
    total: number
    numItems: number
    items: { id: string; name?: string; quantity?: number; price?: number }[]
    paymentMethod?: string
}) => {
    core.track('Order Completed', {
        order_id: order.id,
        total: order.total,
        num_items: order.numItems,
        payment_method: order.paymentMethod,
        items: order.items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
    })
}
