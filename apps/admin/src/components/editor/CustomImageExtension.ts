import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from './ImageNodeView'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { width, style, ...rest } = HTMLAttributes
    const styles = [
      `width: ${width || '100%'}`,
      'height: auto',
      'max-width: 100%',
      'display: block',
      'margin: 1.5rem auto',
    ]
    if (style) styles.push(style)

    return ['img', { ...rest, style: styles.join('; ') }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})
