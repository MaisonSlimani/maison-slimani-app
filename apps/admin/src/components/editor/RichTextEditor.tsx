'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { cn } from '@maison/shared'
import { useCallback, useEffect, useState } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { EditorLinkDialog } from './EditorLinkDialog'
import { EDITOR_EXTENSIONS, EDITOR_CLASSES } from './EditorConfig'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
}

export default function RichTextEditor({
  content = '', onChange, placeholder = 'Start typing...', className = '', editable = true,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EDITOR_EXTENSIONS,
    content,
    editable,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      transformPastedHTML: (html) => html,
      attributes: { class: EDITOR_CLASSES(className), placeholder },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const handleLinkSubmit = useCallback(() => {
    if (!editor) return
    if (!linkUrl.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run()
    setLinkDialogOpen(false); setLinkUrl('')
  }, [editor, linkUrl])

  if (!editor) return (
    <div className="border border-border rounded-lg p-8 text-center bg-muted/30">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Chargement...</p>
    </div>
  )

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-background', className)}>
      <EditorToolbar editor={editor} onLinkClick={() => { setLinkUrl(editor.getAttributes('link').href || ''); setLinkDialogOpen(true) }} />
      <EditorContent editor={editor} className="min-h-[300px]" />
      <EditorLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} linkUrl={linkUrl} setLinkUrl={setLinkUrl} onSubmit={handleLinkSubmit} />
    </div>
  )
}
