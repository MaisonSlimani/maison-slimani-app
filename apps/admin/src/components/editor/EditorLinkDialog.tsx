import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@maison/ui'

interface EditorLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkUrl: string
  setLinkUrl: (url: string) => void
  onSubmit: () => void
}

export function EditorLinkDialog({
  open, onOpenChange, linkUrl, setLinkUrl, onSubmit
}: EditorLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un lien</DialogTitle>
          <DialogDescription>
            Entrez l'URL du lien. Laissez vide pour supprimer le lien existant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSubmit()
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSubmit}>
            {linkUrl.trim() ? 'Ajouter' : 'Supprimer le lien'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
