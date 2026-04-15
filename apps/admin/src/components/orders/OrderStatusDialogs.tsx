import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@maison/ui'

interface OrderStatusDialogsProps {
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  onDelete: () => void
  
  expedierDialogOpen: boolean
  setExpedierDialogOpen: (open: boolean) => void
  onExpedier: () => void
  
  annulerDialogOpen: boolean
  setAnnulerDialogOpen: (open: boolean) => void
  onAnnuler: () => void
  
  livreeDialogOpen: boolean
  setLivreeDialogOpen: (open: boolean) => void
  onLivree: () => void
}

export function OrderStatusDialogs({
  deleteDialogOpen, setDeleteDialogOpen, onDelete,
  expedierDialogOpen, setExpedierDialogOpen, onExpedier,
  annulerDialogOpen, setAnnulerDialogOpen, onAnnuler,
  livreeDialogOpen, setLivreeDialogOpen, onLivree
}: OrderStatusDialogsProps) {
  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={expedierDialogOpen} onOpenChange={setExpedierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'expédition</AlertDialogTitle>
            <AlertDialogDescription>Marquer cette commande comme expédiée ? Un email sera envoyé au client.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onExpedier} className="bg-blue-600 hover:bg-blue-700">Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={annulerDialogOpen} onOpenChange={setAnnulerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir annuler cette commande ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onAnnuler} className="bg-red-600 hover:bg-red-700">Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={livreeDialogOpen} onOpenChange={setLivreeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la livraison</AlertDialogTitle>
            <AlertDialogDescription>Marquer cette commande comme livrée ? Cette action finalise la commande.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onLivree} className="bg-green-600 hover:bg-green-700">Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
