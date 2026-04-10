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
  onConfirm: () => void
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
        />

        <DialogFooter>
          <Button 
            className="w-full h-12 bg-dore text-charbon hover:bg-dore/90 text-lg font-serif" 
            onClick={onConfirm}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Ajout..." : "Confirmer l'ajout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProductPurchaseDialog
