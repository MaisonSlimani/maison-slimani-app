import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'

export const EDITOR_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'text-dore hover:underline' },
  }),
  Color,
  TextStyle.configure({ HTMLAttributes: { style: null } }),
  Image.configure({
    HTMLAttributes: {
      class: 'rounded-xl max-w-full my-6 mx-auto shadow-sm border border-border/40 object-cover',
    },
  }),
]

export const EDITOR_CLASSES = (className: string = '') => [
  'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
  'prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold',
  'prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-4 prose-h1:mb-2',
  'prose-h2:text-xl prose-h2:font-bold prose-h2:mt-3 prose-h2:mb-2',
  'prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-2 prose-h3:mb-1',
  'prose-p:text-foreground prose-p:leading-relaxed',
  'prose-strong:text-foreground prose-strong:font-semibold',
  'prose-ul:text-foreground prose-ol:text-foreground',
  'prose-li:text-foreground',
  'prose-a:text-dore',
  'prose-img:rounded-xl prose-img:mx-auto prose-img:max-w-full prose-img:my-6 prose-img:shadow-sm prose-img:border prose-img:border-border/40',
  className
].join(' ')
