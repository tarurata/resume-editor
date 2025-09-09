# Risk Flags Documentation

## Overview

The fact-checking system analyzes edit suggestions against the user's existing resume data to identify potentially fabricated or unverifiable information. When risks are detected, the system returns risk flags in the `EditResponse.riskFlags` field.

## Risk Flag Types

### 1. `new_skill` - New Skills Not in Resume

**Description:** Skills mentioned in the suggestion that are not present in the original resume.

**Example:**
```json
{
  "new_skill": ["Django", "Machine Learning", "TensorFlow"]
}
```

**Frontend Display:**
- Show a warning icon (⚠️) next to the suggestion
- Display a tooltip or inline message: "New skills detected: Django, Machine Learning, TensorFlow"
- Consider highlighting the flagged skills in the suggestion text
- Provide an option to add these skills to the resume or remove them from the suggestion

### 2. `new_org` - New Organizations Not in Resume

**Description:** Organizations mentioned in the suggestion that are not present in the original resume.

**Example:**
```json
{
  "new_org": ["Google", "Microsoft", "Netflix"]
}
```

**Frontend Display:**
- Show a warning icon (⚠️) next to the suggestion
- Display a tooltip or inline message: "New organizations detected: Google, Microsoft, Netflix"
- Consider highlighting the flagged organizations in the suggestion text
- Provide an option to add these organizations to the resume or remove them from the suggestion

### 3. `unverifiable_metric` - Unverifiable Metrics

**Description:** Metrics, numbers, or claims in the suggestion that cannot be verified against the resume data.

**Example:**
```json
{
  "unverifiable_metric": ["team of 15", "increased revenue by 200%", "served 50M users"]
}
```

**Frontend Display:**
- Show a warning icon (⚠️) next to the suggestion
- Display a tooltip or inline message: "Unverifiable metrics detected: team of 15, increased revenue by 200%, served 50M users"
- Consider highlighting the flagged metrics in the suggestion text
- Provide guidance on how to verify or modify these claims

## Frontend Implementation Guidelines

### 1. Visual Indicators

```typescript
interface RiskFlagDisplay {
  icon: 'warning' | 'error' | 'info';
  color: 'yellow' | 'red' | 'blue';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
```

### 2. Risk Severity Levels

- **High:** Multiple risk types or many flagged items
- **Medium:** Single risk type with multiple items
- **Low:** Single risk type with few items

### 3. User Actions

For each risk flag type, provide these options:

1. **Accept Risk:** Proceed with the suggestion despite warnings
2. **Modify Suggestion:** Edit the suggestion to remove flagged items
3. **Add to Resume:** Add flagged skills/organizations to the resume
4. **Reject Suggestion:** Discard the suggestion entirely

### 4. Example UI Component

```typescript
interface RiskFlagsDisplayProps {
  riskFlags: RiskFlags;
  onAcceptRisk: () => void;
  onModifySuggestion: () => void;
  onAddToResume: (type: 'skill' | 'org', items: string[]) => void;
  onRejectSuggestion: () => void;
}

function RiskFlagsDisplay({ riskFlags, ...actions }: RiskFlagsDisplayProps) {
  const hasRisks = riskFlags.new_skill.length > 0 || 
                   riskFlags.new_org.length > 0 || 
                   riskFlags.unverifiable_metric.length > 0;

  if (!hasRisks) return null;

  return (
    <div className="risk-flags-warning">
      <div className="warning-header">
        <WarningIcon />
        <span>Potential Issues Detected</span>
      </div>
      
      {riskFlags.new_skill.length > 0 && (
        <div className="risk-item">
          <strong>New Skills:</strong> {riskFlags.new_skill.join(', ')}
          <button onClick={() => actions.onAddToResume('skill', riskFlags.new_skill)}>
            Add to Resume
          </button>
        </div>
      )}
      
      {riskFlags.new_org.length > 0 && (
        <div className="risk-item">
          <strong>New Organizations:</strong> {riskFlags.new_org.join(', ')}
          <button onClick={() => actions.onAddToResume('org', riskFlags.new_org)}>
            Add to Resume
          </button>
        </div>
      )}
      
      {riskFlags.unverifiable_metric.length > 0 && (
        <div className="risk-item">
          <strong>Unverifiable Metrics:</strong> {riskFlags.unverifiable_metric.join(', ')}
          <button onClick={actions.onModifySuggestion}>
            Modify Suggestion
          </button>
        </div>
      )}
      
      <div className="risk-actions">
        <button onClick={actions.onAcceptRisk} className="accept-risk">
          Accept Despite Warnings
        </button>
        <button onClick={actions.onRejectSuggestion} className="reject-suggestion">
          Reject Suggestion
        </button>
      </div>
    </div>
  );
}
```

## API Usage

### Request Example

```json
{
  "sectionId": "experience_0",
  "sectionType": "experience",
  "originalContent": "Led development of microservices architecture serving 1M+ daily active users",
  "newContent": "Led a team of 15 developers using Python, Django, and Machine Learning at Google to build AI-powered features serving 50M users",
  "rationale": "Enhanced the description with more details",
  "action": "accept",
  "resume": {
    // Complete resume data for fact-checking
  }
}
```

### Response Example

```json
{
  "success": true,
  "message": "Edit applied successfully",
  "sectionId": "experience_0",
  "updatedContent": "Led a team of 15 developers using Python, Django, and Machine Learning at Google to build AI-powered features serving 50M users",
  "timestamp": "2024-01-15T10:30:00Z",
  "changeId": "chg_1234567890",
  "riskFlags": {
    "new_skill": ["Django", "Machine Learning"],
    "new_org": ["Google"],
    "unverifiable_metric": ["team of 15", "50M users"]
  }
}
```

## Configuration

The fact-checking system can be configured with different similarity thresholds:

```python
# Strict mode - flags more potential issues
fact_checker = FactChecker(similarity_threshold=0.9)

# Lenient mode - flags fewer potential issues
fact_checker = FactChecker(similarity_threshold=0.7)
```

## Best Practices

1. **Always show risk flags** when they are present in the response
2. **Provide clear explanations** of what each risk flag means
3. **Offer actionable solutions** for each type of risk
4. **Allow users to make informed decisions** about whether to proceed
5. **Log risk flag usage** for analytics and system improvement
6. **Test with various resume types** to ensure accurate detection

## Testing

The system includes comprehensive unit tests covering:

- New skill detection
- New organization detection  
- Unverifiable metric detection
- Fuzzy matching for similar terms
- Edge cases (empty suggestions, etc.)
- Comprehensive risk scenarios

Run tests with:
```bash
python -m pytest tests/test_fact_checker.py -v
```
