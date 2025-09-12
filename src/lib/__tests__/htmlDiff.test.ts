/**
 * Snapshot tests for HTML diff functionality
 */

import { generateHtmlDiff, createHtmlDiff, DiffOptions } from '../htmlDiff'

describe('HTML Diff Snapshot Tests', () => {
    describe('generateHtmlDiff', () => {
        it('should generate diff for simple text changes', () => {
            const original = 'Hello world'
            const current = 'Hello beautiful world'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should generate diff for HTML content changes', () => {
            const original = '<p>Hello <strong>world</strong></p>'
            const current = '<p>Hello <em>beautiful</em> <strong>world</strong></p>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should generate diff for list changes', () => {
            const original = '<ul><li>Item 1</li><li>Item 2</li></ul>'
            const current = '<ul><li>Item 1</li><li>New Item</li><li>Item 2</li></ul>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should generate diff for complex HTML structure changes', () => {
            const original = '<div><h2>Experience</h2><p>Worked at Company A</p></div>'
            const current = '<div><h2>Professional Experience</h2><p>Worked at Company A and Company B</p></div>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should handle whitespace changes when ignoreWhitespace is true', () => {
            const original = 'Hello    world'
            const current = 'Hello world'
            const options: DiffOptions = { ignoreWhitespace: true }
            const result = generateHtmlDiff(original, current, options)
            expect(result).toMatchSnapshot()
        })

        it('should show whitespace changes when ignoreWhitespace is false', () => {
            const original = 'Hello    world'
            const current = 'Hello world'
            const options: DiffOptions = { ignoreWhitespace: false }
            const result = generateHtmlDiff(original, current, options)
            expect(result).toMatchSnapshot()
        })

        it('should handle case sensitivity when ignoreCase is true', () => {
            const original = 'Hello World'
            const current = 'hello world'
            const options: DiffOptions = { ignoreCase: true }
            const result = generateHtmlDiff(original, current, options)
            expect(result).toMatchSnapshot()
        })

        it('should show case changes when ignoreCase is false', () => {
            const original = 'Hello World'
            const current = 'hello world'
            const options: DiffOptions = { ignoreCase: false }
            const result = generateHtmlDiff(original, current, options)
            expect(result).toMatchSnapshot()
        })

        it('should handle empty content', () => {
            const original = ''
            const current = '<p>New content</p>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should handle identical content', () => {
            const original = '<p>Same content</p>'
            const current = '<p>Same content</p>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should handle malformed HTML safely', () => {
            const original = '<p>Hello <unclosed>world</p>'
            const current = '<p>Hello <strong>world</strong></p>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should handle script tags safely', () => {
            const original = '<p>Hello world</p>'
            const current = '<p>Hello <script>alert("xss")</script>world</p>'
            const result = generateHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })
    })

    describe('createHtmlDiff', () => {
        it('should create token-level diff for HTML content', () => {
            const original = '<p>Hello <strong>world</strong></p>'
            const current = '<p>Hello <em>beautiful</em> <strong>world</strong></p>'
            const result = createHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should handle mixed HTML and text changes', () => {
            const original = 'Text before <span>HTML</span> text after'
            const current = 'Text before <div>HTML content</div> text after'
            const result = createHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })

        it('should preserve HTML structure in unchanged parts', () => {
            const original = '<div><h1>Title</h1><p>Content</p></div>'
            const current = '<div><h1>New Title</h1><p>Content</p></div>'
            const result = createHtmlDiff(original, current)
            expect(result).toMatchSnapshot()
        })
    })
})
