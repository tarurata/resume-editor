import { 
  parseURLParams, 
  paramsToState, 
  stateToSearchParams, 
  validateURLParams, 
  createDeepLink,
  hasURLParamsChanged,
  getSectionDisplayName,
  getAvailableSections
} from '../urlUtils'

describe('urlUtils', () => {
  describe('parseURLParams', () => {
    it('should parse valid URL parameters', () => {
      const searchParams = new URLSearchParams('section=summary&mode=print&jd=test123')
      const result = parseURLParams(searchParams)
      
      expect(result).toEqual({
        section: 'summary',
        mode: 'print',
        jd: 'test123'
      })
    })

    it('should handle empty parameters', () => {
      const searchParams = new URLSearchParams('')
      const result = parseURLParams(searchParams)
      
      expect(result).toEqual({})
    })

    it('should handle partial parameters', () => {
      const searchParams = new URLSearchParams('section=title')
      const result = parseURLParams(searchParams)
      
      expect(result).toEqual({
        section: 'title'
      })
    })
  })

  describe('paramsToState', () => {
    it('should convert params to state with defaults', () => {
      const params = { section: 'summary', mode: 'print' as const, jd: 'test123' }
      const result = paramsToState(params)
      
      expect(result).toEqual({
        section: 'summary',
        mode: 'print',
        jd: 'test123'
      })
    })

    it('should use defaults for missing params', () => {
      const params = {}
      const result = paramsToState(params)
      
      expect(result).toEqual({
        section: null,
        mode: 'edit',
        jd: null
      })
    })
  })

  describe('stateToSearchParams', () => {
    it('should convert state to search params', () => {
      const state = { section: 'summary', mode: 'print' as const, jd: 'test123' }
      const result = stateToSearchParams(state)
      
      expect(result.get('section')).toBe('summary')
      expect(result.get('mode')).toBe('print')
      expect(result.get('jd')).toBe('test123')
    })

    it('should omit default values', () => {
      const state = { section: null, mode: 'edit' as const, jd: null }
      const result = stateToSearchParams(state)
      
      expect(result.get('section')).toBeNull()
      expect(result.get('mode')).toBeNull()
      expect(result.get('jd')).toBeNull()
    })
  })

  describe('validateURLParams', () => {
    it('should validate correct parameters', () => {
      const params = { section: 'summary', mode: 'print' as const, jd: 'test123' }
      const result = validateURLParams(params)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid section', () => {
      const params = { section: 'invalid-section' }
      const result = validateURLParams(params)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid section ID: invalid-section')
    })

    it('should reject invalid mode', () => {
      const params = { mode: 'invalid-mode' as any }
      const result = validateURLParams(params)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Invalid mode: invalid-mode. Must be 'print' or 'edit'")
    })

    it('should reject too long job description', () => {
      const params = { jd: 'a'.repeat(1001) }
      const result = validateURLParams(params)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Job description parameter too long (max 1000 characters)')
    })

    it('should accept valid experience sections', () => {
      const params = { section: 'experience-0' }
      const result = validateURLParams(params)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('createDeepLink', () => {
    it('should create deep link with parameters', () => {
      const state = { section: 'summary', mode: 'print' as const, jd: 'test123' }
      const result = createDeepLink('https://example.com', 'resume123', state)
      
      expect(result).toBe('https://example.com/editor/resume123?section=summary&mode=print&jd=test123')
    })

    it('should create deep link without parameters', () => {
      const state = { section: null, mode: 'edit' as const, jd: null }
      const result = createDeepLink('https://example.com', 'resume123', state)
      
      expect(result).toBe('https://example.com/editor/resume123')
    })
  })

  describe('hasURLParamsChanged', () => {
    it('should detect changes', () => {
      const current = { section: 'title', mode: 'edit' as const, jd: null }
      const newParams = { section: 'summary', mode: 'edit' as const, jd: null }
      
      expect(hasURLParamsChanged(current, newParams)).toBe(true)
    })

    it('should detect no changes', () => {
      const current = { section: 'title', mode: 'edit' as const, jd: null }
      const newParams = { section: 'title', mode: 'edit' as const, jd: null }
      
      expect(hasURLParamsChanged(current, newParams)).toBe(false)
    })
  })

  describe('getSectionDisplayName', () => {
    it('should return correct display names', () => {
      expect(getSectionDisplayName('title')).toBe('Title')
      expect(getSectionDisplayName('summary')).toBe('Summary')
      expect(getSectionDisplayName('skills')).toBe('Skills')
      expect(getSectionDisplayName('experience-0')).toBe('Experience 1')
      expect(getSectionDisplayName('experience-2')).toBe('Experience 3')
    })
  })

  describe('getAvailableSections', () => {
    it('should return available sections for resume', () => {
      const resume = {
        title: 'Test Title',
        summary: 'Test Summary',
        skills: ['Skill 1', 'Skill 2'],
        experience: [
          { role: 'Developer', organization: 'Company 1', startDate: '2020-01', endDate: '2021-01', bullets: [] },
          { role: 'Senior Developer', organization: 'Company 2', startDate: '2021-01', endDate: null, bullets: [] }
        ]
      }
      
      const result = getAvailableSections(resume)
      
      expect(result).toEqual(['title', 'summary', 'skills', 'experience-0', 'experience-1'])
    })

    it('should handle resume without experience', () => {
      const resume = {
        title: 'Test Title',
        summary: 'Test Summary',
        skills: ['Skill 1']
      }
      
      const result = getAvailableSections(resume)
      
      expect(result).toEqual(['title', 'summary', 'skills'])
    })
  })
})
