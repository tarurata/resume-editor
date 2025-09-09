import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_strategy_edit_title_extract():
    """Test title extraction strategy"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "title_0",
        "sectionType": "title",
        "strategyId": "extract-from-jd",
        "currentContent": "Software Developer",
        "jdText": "We're looking for a Senior Software Engineer - Full Stack to join our team..."
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["sectionId"] == "title_0"
    assert data["strategyId"] == "extract-from-jd"
    assert "Senior Software Engineer" in data["suggestion"]
    assert data["wordCount"] > 0

def test_strategy_edit_summary_rewrite_short():
    """Test summary rewrite with word cap"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "summary_0",
        "sectionType": "summary",
        "strategyId": "rewrite-short",
        "currentContent": "I am a software engineer with many years of experience in various technologies",
        "jdText": "We're looking for a passionate Software Engineer..."
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["sectionType"] == "summary"
    assert data["strategyId"] == "rewrite-short"
    assert data["wordCount"] <= 50  # Should respect word cap

def test_strategy_edit_experience_quantify():
    """Test experience quantification strategy"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "experience_0",
        "sectionType": "experience",
        "strategyId": "quantify",
        "currentContent": "Led development of microservices architecture",
        "jdText": "We need someone who can build scalable systems serving millions of users..."
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["sectionType"] == "experience"
    assert data["strategyId"] == "quantify"
    assert "2M+" in data["suggestion"] or "40%" in data["suggestion"]  # Should have metrics

def test_strategy_edit_skills_map_jd():
    """Test skills mapping to job description"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "skills_0",
        "sectionType": "skills",
        "strategyId": "map-jd",
        "currentContent": "JavaScript, Python, Java, C++, HTML, CSS",
        "jdText": "We need React, Node.js, TypeScript, AWS, PostgreSQL..."
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["sectionType"] == "skills"
    assert data["strategyId"] == "map-jd"
    assert "JavaScript" in data["suggestion"]
    assert "React" in data["suggestion"]

def test_strategy_edit_empty_jd():
    """Test handling of empty job description"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "title_0",
        "sectionType": "title",
        "strategyId": "extract-from-jd",
        "currentContent": "Software Developer",
        "jdText": ""  # Empty JD
    })
    
    # Should still work with mock implementation
    assert response.status_code == 200

def test_strategy_edit_short_jd():
    """Test handling of short job description"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "title_0",
        "sectionType": "title",
        "strategyId": "extract-from-jd",
        "currentContent": "Software Developer",
        "jdText": "Software Engineer"  # Too short
    })
    
    # Should still work with mock implementation
    assert response.status_code == 200

def test_strategy_edit_invalid_strategy():
    """Test handling of invalid strategy"""
    response = client.post("/api/v1/edit/strategy", json={
        "sectionId": "title_0",
        "sectionType": "title",
        "strategyId": "invalid-strategy",
        "currentContent": "Software Developer",
        "jdText": "We're looking for a Software Engineer..."
    })
    
    # Should still work with mock implementation (fallback)
    assert response.status_code == 200
    data = response.json()
    assert "invalid-strategy" in data["suggestion"]

if __name__ == "__main__":
    pytest.main([__file__])
