/**
 * HTML Diff Utility
 * Provides safe HTML diffing with proper sanitization and token-level comparison
 */

export interface DiffToken {
    type: 'unchanged' | 'added' | 'removed'
    content: string
    isHtml?: boolean
}

export interface DiffOptions {
    ignoreWhitespace?: boolean
    ignoreCase?: boolean
    maxContext?: number
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.textContent = html
    return temp.innerHTML
}

/**
 * Tokenizes HTML content into meaningful units
 */
export function tokenizeHtml(html: string): string[] {
    // Split by HTML tags and text content
    const tokens: string[] = []
    let current = html
    let lastIndex = 0

    // Match HTML tags, text content, and whitespace
    const regex = /<[^>]*>|[\s]+|[^\s<]+/g
    let match

    while ((match = regex.exec(current)) !== null) {
        if (match.index > lastIndex) {
            // Add any text between matches
            const text = current.slice(lastIndex, match.index)
            if (text.trim()) {
                tokens.push(text)
            }
        }

        tokens.push(match[0])
        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < current.length) {
        const text = current.slice(lastIndex)
        if (text.trim()) {
            tokens.push(text)
        }
    }

    return tokens
}

/**
 * Normalizes whitespace in text content
 */
export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

/**
 * Checks if a token is HTML
 */
export function isHtmlToken(token: string): boolean {
    return token.startsWith('<') && token.endsWith('>')
}

/**
 * Checks if a token is whitespace
 */
export function isWhitespaceToken(token: string): boolean {
    return /^\s+$/.test(token)
}

/**
 * Creates a word-level diff for text content
 */
export function createTextDiff(original: string, current: string, options: DiffOptions = {}): DiffToken[] {
    const { ignoreWhitespace = false, ignoreCase = false } = options

    let origText = original
    let currText = current

    if (ignoreCase) {
        origText = origText.toLowerCase()
        currText = currText.toLowerCase()
    }

    if (ignoreWhitespace) {
        origText = normalizeWhitespace(origText)
        currText = normalizeWhitespace(currText)
    }

    const originalWords = origText.split(/(\s+)/)
    const currentWords = currText.split(/(\s+)/)

    const diff: DiffToken[] = []
    let i = 0, j = 0

    while (i < originalWords.length || j < currentWords.length) {
        const origWord = originalWords[i] || ''
        const currWord = currentWords[j] || ''

        if (origWord === currWord) {
            diff.push({ type: 'unchanged', content: original.split(/(\s+)/)[i] || '' })
            i++
            j++
        } else if (origWord === '') {
            diff.push({ type: 'added', content: current.split(/(\s+)/)[j] || '' })
            j++
        } else if (currWord === '') {
            diff.push({ type: 'removed', content: original.split(/(\s+)/)[i] || '' })
            i++
        } else {
            // Look ahead for matches
            let found = false
            const maxLookahead = Math.min(5, currentWords.length - j)

            for (let k = 1; k <= maxLookahead; k++) {
                if (originalWords[i] === currentWords[j + k]) {
                    // Add all words between j and j+k as added
                    for (let l = j; l < j + k; l++) {
                        diff.push({ type: 'added', content: current.split(/(\s+)/)[l] || '' })
                    }
                    j += k
                    found = true
                    break
                }
            }

            if (!found) {
                diff.push({ type: 'removed', content: original.split(/(\s+)/)[i] || '' })
                diff.push({ type: 'added', content: current.split(/(\s+)/)[j] || '' })
                i++
                j++
            }
        }
    }

    return diff
}

/**
 * Creates an HTML diff with proper token-level comparison
 */
export function createHtmlDiff(original: string, current: string, options: DiffOptions = {}): DiffToken[] {
    const { ignoreWhitespace = false } = options

    // Tokenize both HTML strings
    const originalTokens = tokenizeHtml(original)
    const currentTokens = tokenizeHtml(current)

    const diff: DiffToken[] = []
    let i = 0, j = 0

    while (i < originalTokens.length || j < currentTokens.length) {
        const origToken = originalTokens[i] || ''
        const currToken = currentTokens[j] || ''

        if (origToken === currToken) {
            diff.push({
                type: 'unchanged',
                content: origToken,
                isHtml: isHtmlToken(origToken)
            })
            i++
            j++
        } else if (origToken === '') {
            diff.push({
                type: 'added',
                content: currToken,
                isHtml: isHtmlToken(currToken)
            })
            j++
        } else if (currToken === '') {
            diff.push({
                type: 'removed',
                content: origToken,
                isHtml: isHtmlToken(origToken)
            })
            i++
        } else if (isHtmlToken(origToken) && isHtmlToken(currToken)) {
            // Both are HTML tokens - compare as-is
            diff.push({ type: 'removed', content: origToken, isHtml: true })
            diff.push({ type: 'added', content: currToken, isHtml: true })
            i++
            j++
        } else if (isHtmlToken(origToken)) {
            // Original is HTML, current is text
            diff.push({ type: 'removed', content: origToken, isHtml: true })
            diff.push({ type: 'added', content: currToken, isHtml: false })
            i++
            j++
        } else if (isHtmlToken(currToken)) {
            // Current is HTML, original is text
            diff.push({ type: 'removed', content: origToken, isHtml: false })
            diff.push({ type: 'added', content: currToken, isHtml: true })
            i++
            j++
        } else {
            // Both are text tokens - use text diff algorithm
            const textDiff = createTextDiff(origToken, currToken, options)
            diff.push(...textDiff.map(token => ({ ...token, isHtml: false })))
            i++
            j++
        }
    }

    return diff
}

/**
 * Renders diff tokens as HTML with proper escaping
 */
export function renderDiffTokens(tokens: DiffToken[]): string {
    return tokens.map(token => {
        const escapedContent = token.isHtml ? token.content : sanitizeHtml(token.content)

        switch (token.type) {
            case 'added':
                return `<span class="diff-added">${escapedContent}</span>`
            case 'removed':
                return `<span class="diff-removed">${escapedContent}</span>`
            case 'unchanged':
            default:
                return escapedContent
        }
    }).join('')
}

/**
 * Main function to generate HTML diff
 */
export function generateHtmlDiff(original: string, current: string, options: DiffOptions = {}): string {
    const diff = createHtmlDiff(original, current, options)
    return renderDiffTokens(diff)
}
