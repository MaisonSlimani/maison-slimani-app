import { Editor } from '@tiptap/react'
import { Button } from '@maison/ui'
import { LucideIcon, Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon, Undo, Redo } from 'lucide-react'
import { cn } from '@maison/shared'

interface TBProps { click: () => void; icon: LucideIcon; active?: boolean; disabled?: boolean; title?: string }
const TB = ({ click, icon: Icon, active, disabled, title }: TBProps) => (
  <Button type="button" variant="ghost" size="sm" onClick={click} disabled={disabled} title={title} className={cn('h-8 w-8 p-0', active && 'bg-muted')}><Icon className="h-4 w-4" /></Button>
)

export function EditorToolbar({ editor, onLinkClick }: { editor: Editor; onLinkClick: () => void }) {
  const h = (level: 1 | 2 | 3) => (
    <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className={cn('h-8 px-2 text-xs', editor.isActive('heading', { level }) && 'bg-muted')}>
      {level === 1 ? <Heading1 className="h-3 w-3 mr-1" /> : level === 2 ? <Heading2 className="h-3 w-3 mr-1" /> : <Heading3 className="h-3 w-3 mr-1" />} H{level}
    </Button>
  )

  return (
    <div className="border-b border-border bg-muted/50 p-2 flex flex-wrap items-center gap-1">
      <TB click={() => editor.chain().focus().toggleBold().run()} icon={Bold} active={editor.isActive('bold')} disabled={!editor.can().chain().focus().toggleBold().run()} />
      <TB click={() => editor.chain().focus().toggleItalic().run()} icon={Italic} active={editor.isActive('italic')} disabled={!editor.can().chain().focus().toggleItalic().run()} />
      <TB click={() => editor.chain().focus().toggleUnderline().run()} icon={UnderlineIcon} active={editor.isActive('underline')} />
      <TB click={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} active={editor.isActive('strike')} disabled={!editor.can().chain().focus().toggleStrike().run()} />
      <div className="h-6 w-[1px] bg-border mx-1" />
      {h(1)}{h(2)}{h(3)}
      <div className="h-6 w-[1px] bg-border mx-1" />
      <TB click={() => editor.chain().focus().toggleBulletList().run()} icon={List} active={editor.isActive('bulletList')} title="Bullet" />
      <TB click={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} active={editor.isActive('orderedList')} title="Ordered" />
      <div className="h-6 w-[1px] bg-border mx-1" />
      <TB click={onLinkClick} icon={LinkIcon} active={editor.isActive('link')} />
      <div className="h-6 w-[1px] bg-border mx-1" />
      <TB click={() => editor.chain().focus().undo().run()} icon={Undo} disabled={!editor.can().chain().focus().undo().run()} />
      <TB click={() => editor.chain().focus().redo().run()} icon={Redo} disabled={!editor.can().chain().focus().redo().run()} />
    </div>
  )
}
