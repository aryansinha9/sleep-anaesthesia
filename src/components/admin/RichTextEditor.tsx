'use client'

import Link from '@tiptap/extension-link'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// Restricted rich text: H2/H3 (full variant only), bold, italic, lists, links.
// No colours, fonts, images, tables, embeds or raw HTML. Pasted content is
// reduced to this schema by the editor, and sanitised again on the server.
export function RichTextEditor({ id, value, onChange, variant, invalid, describedBy }: {
  id: string; value: string; onChange: (html: string, textLength: number) => void; variant: 'full' | 'basic'; invalid?: boolean; describedBy?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: variant === 'full' ? { levels: [2, 3] } : false,
        code: false, codeBlock: false, blockquote: false, horizontalRule: false, strike: false, underline: false,
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto', 'tel'], HTMLAttributes: { rel: null, target: null } }),
    ],
    content: value,
    editorProps: { attributes: { id, 'aria-multiline': 'true', role: 'textbox', ...(describedBy ? { 'aria-describedby': describedBy } : {}), ...(invalid ? { 'aria-invalid': 'true' } : {}) } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML(), editor.getText().length),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? {
      h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }), bold: e.isActive('bold'), italic: e.isActive('italic'),
      ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), link: e.isActive('link'),
    } : null,
  })

  if (!editor) return <div className="rte"><div className="ProseMirror" /></div>
  const chain = () => editor.chain().focus()
  const btn = (label: string, title: string, active: boolean | undefined, run: () => void) => (
    <button type="button" title={title} aria-label={title} aria-pressed={!!active} onMouseDown={(e) => e.preventDefault()} onClick={run}>{label}</button>
  )
  function setLink() {
    const current = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Link address (a page on this site like /contact, or a full https:// address). Leave blank to remove the link.', current || '')
    if (url === null) return
    const clean = url.trim()
    if (!clean) { chain().extendMarkRange('link').unsetLink().run(); return }
    if (!/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(clean)) { window.alert('Links must start with /, https://, mailto: or tel:'); return }
    chain().extendMarkRange('link').setLink({ href: clean }).run()
  }
  return (
    <div className="rte">
      <div className="rte-bar" role="toolbar" aria-label="Formatting">
        {variant === 'full' && btn('H2', 'Heading', state?.h2, () => chain().toggleHeading({ level: 2 }).run())}
        {variant === 'full' && btn('H3', 'Subheading', state?.h3, () => chain().toggleHeading({ level: 3 }).run())}
        {btn('B', 'Bold', state?.bold, () => chain().toggleBold().run())}
        {btn('I', 'Italic', state?.italic, () => chain().toggleItalic().run())}
        {btn('• List', 'Bulleted list', state?.ul, () => chain().toggleBulletList().run())}
        {btn('1. List', 'Numbered list', state?.ol, () => chain().toggleOrderedList().run())}
        {btn('Link', 'Add or edit link', state?.link, setLink)}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
