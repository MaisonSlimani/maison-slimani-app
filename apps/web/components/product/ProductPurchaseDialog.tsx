'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@maison/ui'
import { Button } from '@maison/ui'
import { Product, ProductVariation } from '@maison/domain'
import { PurchaseSelections } from './PurchaseSelections'

interface ProductPurchaseDialogProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
  produit: Product
  selectedColor: string
  setSelectedColor: (val: string) => void
  selectedSize: string
  setSelectedSize: (val: string) => void
  quantity: number
  setQuantity: (val: number) => void
  sizesAvailable: string[] // Changed name to match parent usage if needed
  onConfirm: (buyNow: boolean) => void
  isAddingToCart: boolean
}

const ProductPurchaseDialog = ({
  showModal, setShowModal, produit,
  selectedColor, setSelectedColor,
  selectedSize, setSelectedSize,
  quantity, setQuantity,
  sizesAvailable, onConfirm, isAddingToCart
}: ProductPurchaseDialogProps) => {
  const variations = produit.colors as ProductVariation[] | null;
  const hasColorsSelected = !produit.hasColors || !!selectedColor;
  const hasSizeSelected = (produit.sizes?.length || 0) <= 0 || !!selectedSize;
  const canPurchase = !isAddingToCart && hasColorsSelected && hasSizeSelected;

  return (
    <Dialog open={!!showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{produit.name}</DialogTitle>
          <DialogDescription>
            {produit.hasColors ? 'Sélectionnez couleur, taille et quantité' : 'Sélectionnez taille et quantité'}
          </DialogDescription>
        </DialogHeader>

        <PurchaseSelections 
          hasColors={!!produit.hasColors} 
          variations={variations}
          selectedColor={selectedColor} 
          setSelectedColor={setSelectedColor}
          availableSizes={sizesAvailable} 
          selectedSize={selectedSize} 
          setSelectedSize={setSelectedSize}
          quantity={quantity} 
          setQuantity={setQuantity}
          _produit={produit} // Using normalized product
        />

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline"
            className="flex-1 h-12 text-lg border-2" 
            onClick={() => onConfirm(false)}
            disabled={!canPurchase}
          >
            {isAddingToCart ? "..." : "Panier"}
          </Button>
          <Button 
            className="flex-[2] h-12 bg-dore text-charbon hover:bg-dore/90 text-lg font-serif" 
            onClick={() => onConfirm(true)}
            disabled={!canPurchase}
          >
            {isAddingToCart ? "..." : "Achat Immédiat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProductPurchaseDialog
