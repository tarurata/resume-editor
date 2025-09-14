# URL Navigation Features

This document describes the advanced navigation features implemented for the resume editor, including URL parameters for direct access to specific sections and modes.

## Features

### URL Parameters

The editor now supports the following URL parameters:

- `section` - Direct navigation to a specific section
- `mode` - Set the editor mode (edit or print)
- `jd` - Pre-load a job description

### Supported URL Formats

```
/editor/[resumeId]?section=summary
/editor/[resumeId]?mode=print
/editor/[resumeId]?jd=company123
/editor/[resumeId]?section=summary&mode=print&jd=company123
```

### Section Navigation

#### Supported Sections

- `title` - Resume title
- `summary` - Professional summary
- `skills` - Skills list
- `experience-0` - First experience entry
- `experience-1` - Second experience entry
- `experience-N` - Nth experience entry

#### Examples

```
# Navigate to summary section
/editor/resume123?section=summary

# Navigate to first experience
/editor/resume123?section=experience-0

# Navigate to skills section
/editor/resume123?section=skills
```

### Mode Navigation

#### Edit Mode (Default)
```
/editor/resume123
/editor/resume123?mode=edit
```

#### Print Mode
```
/editor/resume123?mode=print
```

### Job Description Pre-loading

```
/editor/resume123?jd=Software%20Engineer%20at%20Tech%20Corp
```

## Components

### URLStateManager

Handles URL state synchronization and browser navigation.

**Features:**
- Parses URL parameters on page load
- Updates URL when state changes
- Handles browser back/forward navigation
- Validates URL parameters
- Provides error handling

### SectionNavigation

Provides section navigation controls within the editor.

**Features:**
- Previous/Next section navigation
- Section dropdown selector
- Section counter
- Breadcrumb display
- Mobile-responsive compact view

### URL Utilities

Utility functions for URL parameter management.

**Functions:**
- `parseURLParams()` - Parse URL search parameters
- `paramsToState()` - Convert params to state with defaults
- `stateToSearchParams()` - Convert state to search parameters
- `validateURLParams()` - Validate URL parameters
- `createDeepLink()` - Create shareable deep links
- `getSectionDisplayName()` - Get human-readable section names
- `getAvailableSections()` - Get available sections for a resume

## Usage Examples

### Creating Deep Links

```typescript
import { createDeepLink } from '@/lib/urlUtils'

// Create a deep link to summary section
const deepLink = createDeepLink(
  'https://yourapp.com',
  'resume123',
  { section: 'summary', mode: 'edit', jd: null }
)
// Result: https://yourapp.com/editor/resume123?section=summary
```

### Programmatic Navigation

```typescript
import { useURLState } from '@/components/editor/URLStateManager'

function MyComponent() {
  const { urlState, updateURLState } = useURLState('resume123')
  
  const navigateToSection = (sectionId: string) => {
    updateURLState({
      ...urlState,
      section: sectionId
    })
  }
}
```

### URL Parameter Validation

```typescript
import { validateURLParams } from '@/lib/urlUtils'

const params = { section: 'invalid-section', mode: 'print' }
const validation = validateURLParams(params)

if (!validation.valid) {
  console.error('Invalid parameters:', validation.errors)
}
```

## Browser Navigation

The implementation supports full browser navigation:

- **Back Button** - Returns to previous section/mode
- **Forward Button** - Advances to next section/mode
- **Bookmarking** - URLs can be bookmarked and shared
- **Refresh** - Page state is preserved on refresh

## Error Handling

Invalid URL parameters are handled gracefully:

- Invalid section IDs show error messages
- Invalid modes default to 'edit'
- Malformed parameters are logged and ignored
- User-friendly error displays

## Performance Considerations

- URL updates use `replaceState` to avoid history pollution
- State changes are debounced to prevent excessive URL updates
- Browser navigation events are properly cleaned up
- Minimal re-renders through careful state management

## Testing

Comprehensive test coverage includes:

- URL parameter parsing and validation
- State conversion and synchronization
- Deep link generation
- Error handling scenarios
- Browser navigation simulation

Run tests with:
```bash
npm test -- --testPathPattern=urlUtils.test.ts
```

## Future Enhancements

Potential future improvements:

- URL parameter for specific experience entries
- Query parameter for search/filter states
- URL state persistence across sessions
- Advanced sharing options with pre-filled forms
