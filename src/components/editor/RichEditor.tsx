'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { SectionId } from '@/types/resume'
import { useEffect, useState } from 'react'

interface RichEditorProps {
    content: string
    onChange: (content: string) => void
    selectedSection: SectionId | null
}

export function RichEditor({ content, onChange, selectedSection }: RichEditorProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            BulletList,
            ListItem,
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    })

    // Update editor content when content prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!isMounted || !editor) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    const getSectionTitle = (sectionId: SectionId | null): string => {
        if (!sectionId) return 'Select a section to edit'

        switch (sectionId) {
            case 'title':
                return 'Title'
            case 'summary':
                return 'Summary'
            case 'skills':
                return 'Skills'
            default:
                if (sectionId.startsWith('experience-')) {
                    const index = parseInt(sectionId.split('-')[1])
                    return `Experience ${index + 1}`
                }
                return 'Unknown Section'
        }
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900">
                    {getSectionTitle(selectedSection)}
                </h3>
                <div className="flex items-center space-x-2">
                    {/* Toolbar */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''
                                }`}
                            title="Bold"
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''
                                }`}
                            title="Italic"
                        >
                            <em>I</em>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''
                                }`}
                            title="Bullet List"
                        >
                            •
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        {selectedSection && (
                            <span>
                                {editor.storage.characterCount?.characters() || 0} characters
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs">
                            Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+B</kbd> for bold
                        </span>
                        <span className="text-xs">
                            Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+I</kbd> for italic
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
