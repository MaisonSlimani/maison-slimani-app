# Rich Text Editor Component

A comprehensive rich text editor component built with TipTap for the admin dashboard.

## Installation

Before using this component, you need to install the required dependencies:

```bash
cd admin-app
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-code-block-lowlight @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header lowlight
```

## Features

- ✅ **To-do list** - Task list with checkboxes
- ✅ **Toggle list** - Collapsible lists using HTML details/summary
- ✅ **Code block** - Syntax highlighted code blocks
- ✅ **Table** - Insert and edit tables
- ✅ **Quote** - Blockquotes
- ✅ **Callout** - Info, warning, success, and error callouts
- ✅ **Block equation** - Mathematical equations
- ✅ **Headings** - H1, H2, H3 toggle buttons
- ✅ **Columns** - 2, 3, 4, and 5 column layouts
- ✅ **Text formatting** - Bold, italic, strikethrough, inline code
- ✅ **Lists** - Bullet lists, ordered lists
- ✅ **Undo/Redo** - Full history support

## Usage

```tsx
import RichTextEditor from '@/components/editor/RichTextEditor'

function MyComponent() {
  const [content, setContent] = useState('')

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  )
}
```

## Props

- `content?: string` - Initial HTML content
- `onChange?: (content: string) => void` - Callback when content changes (returns HTML)
- `placeholder?: string` - Placeholder text
- `className?: string` - Additional CSS classes
- `editable?: boolean` - Whether the editor is editable (default: true)

## Output Format

The editor outputs HTML that can be stored in your database and rendered on the frontend. Make sure to sanitize the HTML before rendering it to prevent XSS attacks.

