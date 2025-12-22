/**
 * Rich Text Editor Component
 * A WYSIWYG editor built with Tiptap
 */

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Undo,
  Redo,
  ChevronDown,
} from 'lucide-react'
import { useState, useRef, useEffect as useEffectRef } from 'react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  darkMode?: boolean
}

interface MenuButtonProps {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title: string
  darkMode?: boolean
}

function MenuButton({ onClick, isActive, children, title, darkMode }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        darkMode
          ? isActive
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
          : isActive
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}

function MenuBar({ editor, darkMode }: { editor: Editor | null; darkMode?: boolean }) {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 p-2 border-b',
        darkMode ? 'border-white/10 bg-[#0d2628]' : 'border-gray-200 bg-gray-50'
      )}
    >
      {/* Text Formatting */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
        darkMode={darkMode}
      >
        <Bold className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
        darkMode={darkMode}
      >
        <Italic className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
        darkMode={darkMode}
      >
        <UnderlineIcon className="h-4 w-4" />
      </MenuButton>

      <div className={cn('w-px h-5 mx-1', darkMode ? 'bg-white/20' : 'bg-gray-300')} />

      {/* Headings */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        darkMode={darkMode}
      >
        <Heading1 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        darkMode={darkMode}
      >
        <Heading2 className="h-4 w-4" />
      </MenuButton>

      <div className={cn('w-px h-5 mx-1', darkMode ? 'bg-white/20' : 'bg-gray-300')} />

      {/* Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
        darkMode={darkMode}
      >
        <List className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
        darkMode={darkMode}
      >
        <ListOrdered className="h-4 w-4" />
      </MenuButton>

      <div className={cn('w-px h-5 mx-1', darkMode ? 'bg-white/20' : 'bg-gray-300')} />

      {/* Alignment */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
        darkMode={darkMode}
      >
        <AlignLeft className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
        darkMode={darkMode}
      >
        <AlignCenter className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
        darkMode={darkMode}
      >
        <AlignRight className="h-4 w-4" />
      </MenuButton>

      <div className={cn('w-px h-5 mx-1', darkMode ? 'bg-white/20' : 'bg-gray-300')} />

      {/* Block Quote & Link */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
        darkMode={darkMode}
      >
        <Quote className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={addLink}
        isActive={editor.isActive('link')}
        title="Add Link"
        darkMode={darkMode}
      >
        <LinkIcon className="h-4 w-4" />
      </MenuButton>

      <div className={cn('w-px h-5 mx-1', darkMode ? 'bg-white/20' : 'bg-gray-300')} />

      {/* Undo/Redo */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        darkMode={darkMode}
      >
        <Undo className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        darkMode={darkMode}
      >
        <Redo className="h-4 w-4" />
      </MenuButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  darkMode = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: darkMode ? 'text-[#dbf938] underline' : 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: darkMode
          ? 'before:content-[attr(data-placeholder)] before:text-white/40 before:float-left before:h-0 before:pointer-events-none'
          : 'before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
          darkMode
            ? 'prose-invert prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-em:text-white/90 prose-ul:text-white/90 prose-ol:text-white/90 prose-blockquote:text-white/70 prose-blockquote:border-white/30'
            : 'prose-headings:text-gray-900 prose-p:text-gray-700'
        ),
      },
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        darkMode ? 'bg-[#183c3f] border-[#1b5858]' : 'bg-white border-gray-300 shadow-sm',
        className
      )}
    >
      <MenuBar editor={editor} darkMode={darkMode} />
      <div className={cn(darkMode ? '' : 'bg-white')}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

