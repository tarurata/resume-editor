from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.resume import EditRequest, EditResponse, StrategyEditRequest, StrategyEditResponse, Resume
from app.services.fact_checker import FactChecker
import uuid
from datetime import datetime
from app.core.security import get_current_user



from app.models.user import User

router = APIRouter()


@router.post("/edit", response_model=EditResponse)
async def edit_resume_section(edit_request: EditRequest, current_user: User = Depends(get_current_user)) -> EditResponse:
    """
    Edit a specific section of a resume.
    
    This endpoint allows editing individual sections of a resume with validation
    and change tracking. The edit can be accepted, rejected, or restored.
    """
    try:
        # Generate a unique change ID for tracking
        change_id = f"chg_{uuid.uuid4().hex[:10]}"
        
        # Initialize fact checker
        fact_checker = FactChecker()
        risk_flags = None
        
        # Perform fact-checking if resume data is provided
        if edit_request.resume:
            facts_inventory = fact_checker.build_facts_inventory(edit_request.resume)
            risk_flags = fact_checker.check_suggestion(edit_request.newContent, facts_inventory)
        
        # For now, we'll just return a success response with risk flags
        # In a real implementation, this would validate the edit and apply it
        response = EditResponse(
            success=True,
            message="Edit applied successfully",
            sectionId=edit_request.sectionId,
            updatedContent=edit_request.newContent,
            timestamp=datetime.utcnow(),
            changeId=change_id,
            riskFlags=risk_flags
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process edit: {str(e)}"
        )


@router.get("/edit/history/{section_id}", response_model=List[EditResponse])
async def get_section_history(section_id: str, current_user: User = Depends(get_current_user)) -> List[EditResponse]:
    """
    Get the edit history for a specific section.
    
    Returns a list of all edits made to the specified section, ordered by timestamp.
    """
    # This would typically query a database for the section's edit history
    # For now, return an empty list
    return []


@router.post("/edit/restore/{change_id}", response_model=EditResponse)
async def restore_edit(change_id: str, current_user: User = Depends(get_current_user)) -> EditResponse:
    """
    Restore a previous edit by its change ID.
    
    This allows reverting to a previous state of a section.
    """
    # This would typically restore the edit from the database
    # For now, return a placeholder response
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Restore functionality not yet implemented"
    )


@router.post("/strategy", response_model=StrategyEditResponse)
async def edit_with_strategy(strategy_request: StrategyEditRequest, current_user: User = Depends(get_current_user)) -> StrategyEditResponse:
    """
    Edit a resume section using AI strategy-based prompts.
    
    This endpoint applies strategy-specific prompts to generate suggestions
    for improving resume sections based on job descriptions.
    """
    try:
        # For now, we'll return a mock response
        # In a real implementation, this would:
        # 1. Load the strategy prompt library
        # 2. Validate the strategy exists
        # 3. Check JD requirements
        # 4. Call the LLM service
        # 5. Parse and return the response
        
        # Mock response based on strategy type
        mock_suggestion = generate_mock_suggestion(
            strategy_request.sectionType,
            strategy_request.strategyId,
            strategy_request.currentContent
        )
        
        response = StrategyEditResponse(
            sectionId=strategy_request.sectionId,
            suggestion=mock_suggestion,
            rationale=f"Applied {strategy_request.strategyId} strategy to {strategy_request.sectionType}",
            strategyId=strategy_request.strategyId,
            wordCount=len(mock_suggestion.split())
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process strategy edit: {str(e)}"
        )


def generate_mock_suggestion(section_type: str, strategy_id: str, current_content: str) -> str:
    """Generate mock suggestions for testing purposes"""
    
    if section_type == "title":
        if strategy_id == "extract-from-jd":
            return "Senior Software Engineer - Full Stack"
    
    elif section_type == "summary":
        if strategy_id == "rewrite-short":
            return "Experienced software engineer with 5+ years building scalable web applications using React, Node.js, and cloud technologies."
        elif strategy_id == "rewrite-medium":
            return "Results-driven software engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable web applications using React, Node.js, and cloud technologies. Strong background in agile methodologies and team leadership."
        elif strategy_id == "match-jd":
            return "Passionate software engineer with expertise in building scalable web applications. Experienced in React, Node.js, and TypeScript with a track record of contributing to mission-driven tech companies."
    
    elif section_type == "experience":
        if strategy_id == "quantify":
            return "Led development of microservices architecture serving 2M+ daily active users, improving system performance by 40%"
        elif strategy_id == "action-verbs":
            return "Spearheaded development of microservices architecture serving 1M+ daily active users"
        elif strategy_id == "achievements":
            return "Delivered microservices architecture serving 1M+ daily active users, resulting in 40% performance improvement"
    
    elif section_type == "skills":
        if strategy_id == "map-jd":
            return "Programming Languages: JavaScript, TypeScript, Python\nFrameworks: React, Node.js\nCloud & DevOps: AWS, Docker\nDatabase: PostgreSQL, MongoDB"
        elif strategy_id == "categorize":
            return "Programming Languages: JavaScript, TypeScript, Python\nFrameworks: React, Node.js, Express\nCloud & DevOps: AWS, Docker, Kubernetes\nDatabase: PostgreSQL, MongoDB\nAnalytics: Tableau, Power BI"
        elif strategy_id == "prioritize":
            return "Core Technologies: JavaScript, React, Node.js\nProgramming Languages: TypeScript, Python\nCloud & DevOps: AWS, Docker\nDatabase: PostgreSQL, MongoDB"
    
    # Default fallback
    return f"Improved {section_type} using {strategy_id} strategy"
