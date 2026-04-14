import { core } from './core'

export const trackProductViewed = (product: {
    id: string
    name: string
    category: string
    price: number
    inStock: boolean
}) => {
    core.track('Product Viewed', {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price,
        in_stock: product.inStock,
    })
}

export const trackProductClicked = (product: { id: string; name: string; position?: number }) => {
    core.track('Product Clicked', {
        product_id: product.id,
        product_name: product.name,
        position: product.position,
    })
}

export const trackProductListViewed = (listName: string, products: { id: string; name?: string }[]) => {
    core.track('Product List Viewed', {
        list_name: listName,
        products_count: products.length,
        products: products.slice(0, 10).map((p, idx) => ({
            product_id: p.id,
            product_name: p.name,
            position: idx + 1,
        })),
    })
}

export const trackSizeSelected = (product: { id: string; name: string }, size: string) => {
    core.track('Product Size Selected', {
        product_id: product.id,
        product_name: product.name,
        size,
    })
}
