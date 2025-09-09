export interface StrategyPrompt {
  prompt: string;
  variables: string[];
  constraints?: {
    maxWords?: number;
    tone?: string;
    noFabrication?: boolean;
  };
}

export interface StrategyLibrary {
  [sectionType: string]: {
    [strategyId: string]: StrategyPrompt;
  };
}

export interface StrategyRequest {
  sectionId: string;
  sectionType: 'title' | 'summary' | 'experience' | 'skills';
  strategyId: string;
  currentContent: string;
  jdText?: string;
  constraints?: Record<string, any>;
}

export interface StrategyResponse {
  sectionId: string;
  suggestion: string;
  rationale?: string;
  strategyId: string;
  wordCount?: number;
}
