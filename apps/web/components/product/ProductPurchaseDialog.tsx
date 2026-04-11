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
  selectedCouleur: string
  setSelectedCouleur: (val: string) => void
  selectedTaille: string
  setSelectedTaille: (val: string) => void
  quantite: number
  setQuantite: (val: number) => void
  taillesDisponibles: string[]
  onConfirm: (buyNow: boolean) => void
  isAddingToCart: boolean
}

const ProductPurchaseDialog = ({
  showModal, setShowModal, produit,
  selectedCouleur, setSelectedCouleur,
  selectedTaille, setSelectedTaille,
  quantite, setQuantite,
  taillesDisponibles, onConfirm, isAddingToCart
}: ProductPurchaseDialogProps) => {
  const variations = produit.couleurs as ProductVariation[] | null;
  const hasColorsSelected = !produit.has_colors || !!selectedCouleur;
  const hasSizeSelected = (produit.tailles?.length || 0) <= 0 || !!selectedTaille;
  const canPurchase = !isAddingToCart && hasColorsSelected && hasSizeSelected;

  return (
    <Dialog open={!!showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{produit.nom}</DialogTitle>
          <DialogDescription>
            {produit.has_colors ? 'Sélectionnez couleur, taille et quantité' : 'Sélectionnez taille et quantité'}
          </DialogDescription>
        </DialogHeader>

        <PurchaseSelections 
          hasColors={!!produit.has_colors} variations={variations}
          selectedCouleur={selectedCouleur} setSelectedCouleur={setSelectedCouleur}
          taillesDisponibles={taillesDisponibles} selectedTaille={selectedTaille} setSelectedTaille={setSelectedTaille}
          quantite={quantite} setQuantite={setQuantite}
          _produit={produit}
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
