'use client'

import React from 'react'
import { Button } from '@maison/ui'
import { Star, Upload, X } from 'lucide-react'
import { Label } from '@maison/ui'
import { cn } from '@maison/shared'
import OptimizedImage from '../OptimizedImage'

import { Commentaire } from '@/types/index'

interface CommentEditFormProps {
  editForm: Commentaire
  setEditForm: (val: Commentaire) => void
  onSave: () => void
  onCancel: () => void
  onImageUpload: (files: FileList | null) => void
  onRemoveImage: (index: number) => void
  isUploading: boolean
}

export const CommentEditForm = ({
  editForm,
  setEditForm,
  onSave,
  onCancel,
  onImageUpload,
  onRemoveImage,
  isUploading
}: CommentEditFormProps) => {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
      <input
        type="text"
        value={editForm.nom}
        onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
        className="w-full px-3 py-2 border rounded-md"
        placeholder="Votre nom"
      />
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={cn("w-5 h-5 cursor-pointer", star <= editForm.rating ? "fill-dore text-dore" : "text-gray-300")}
            onClick={() => setEditForm({...editForm, rating: star})}
          />
        ))}
      </div>

      <textarea
        value={editForm.commentaire}
        onChange={(e) => setEditForm({...editForm, commentaire: e.target.value})}
        className="w-full h-24 px-3 py-2 border rounded-md"
        placeholder="Votre commentaire"
      />

      <div className="space-y-2">
        <Label>Images ({editForm.images.length}/6)</Label>
        <div className="flex flex-wrap gap-2">
          {editForm.images.map((img: string, i: number) => (
            <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
              <OptimizedImage src={img} alt="Preview" fill objectFit="cover" />
              <button onClick={() => onRemoveImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
            </div>
          ))}
          {editForm.images.length < 6 && (
            <label className="w-16 h-16 border-2 border-dashed flex items-center justify-center cursor-pointer rounded">
              <Upload className="w-4 h-4" />
              <input type="file" multiple className="hidden" onChange={(e) => onImageUpload(e.target.files)} disabled={isUploading} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} className="bg-dore text-charbon hover:bg-dore/90" disabled={isUploading}>Sauvegarder</Button>
        <Button onClick={onCancel} variant="outline" disabled={isUploading}>Annuler</Button>
      </div>
    </div>
  )
}
