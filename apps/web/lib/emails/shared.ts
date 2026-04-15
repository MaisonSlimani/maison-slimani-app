export const priceFormatter = new Intl.NumberFormat('fr-MA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number) => `${priceFormatter.format(value)} DH`

export const commonStyles = `
    body { font-family: 'Playfair Display', serif; background-color: #f8f5f0; color: #1a1612; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #d4a574; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1612 0%, #2d2419 100%); color: #f8f5f0; padding: 30px; text-align: center; }
    .header .dore { color: #d4a574; }
    .content { padding: 30px; font-size: 16px; line-height: 1.6; }
    .section { margin-bottom: 25px; }
    .section h2 { font-size: 18px; color: #1a1612; border-bottom: 2px solid #d4a574; padding-bottom: 10px; margin-bottom: 15px; }
    .footer { background-color: #f8f5f0; padding: 20px 30px; text-align: center; font-size: 14px; color: #2d2419; border-top: 1px solid #e8e3d9; }
`
