"""
Custom exceptions for Resume Editor API
"""

from fastapi import HTTPException
from typing import Optional


class ResumeEditorException(Exception):
    """Base exception for Resume Editor"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(ResumeEditorException):
    """Validation error"""
    def __init__(self, message: str):
        super().__init__(message, 400)


class NotFoundError(ResumeEditorException):
    """Resource not found error"""
    def __init__(self, resource: str, resource_id: str):
        message = f"{resource} with ID {resource_id} not found"
        super().__init__(message, 404)


class ConflictError(ResumeEditorException):
    """Resource conflict error"""
    def __init__(self, message: str):
        super().__init__(message, 409)


class DatabaseError(ResumeEditorException):
    """Database operation error"""
    def __init__(self, message: str):
        super().__init__(message, 500)


def handle_exception(e: Exception) -> HTTPException:
    """Convert custom exceptions to HTTP exceptions"""
    if isinstance(e, ResumeEditorException):
        return HTTPException(status_code=e.status_code, detail=e.message)
    elif isinstance(e, ValueError):
        return HTTPException(status_code=400, detail=str(e))
    elif isinstance(e, KeyError):
        return HTTPException(status_code=400, detail=f"Missing required field: {str(e)}")
    else:
        return HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
