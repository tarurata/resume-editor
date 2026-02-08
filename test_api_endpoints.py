#!/usr/bin/env python3
"""
Test script for Resume Editor API endpoints
Run this script to test the database operation endpoints
"""

import requests
import json
from datetime import date

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

def test_personal_info_endpoints():
    """Test Personal Info CRUD endpoints"""
    print("Testing Personal Info endpoints...")
    
    # Test data
    user_id = "test_user_123"
    personal_info_data = {
        "user_id": user_id,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0123",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/johndoe",
        "portfolio_url": "https://johndoe.dev"
    }
    
    # Test POST
    response = requests.post(f"{BASE_URL}/personal-info/", json=personal_info_data)
    print(f"POST /personal-info/: {response.status_code}")
    if response.status_code == 201:
        print("✓ Personal info created successfully")
    else:
        print(f"✗ Error: {response.text}")
    
    # Test GET
    response = requests.get(f"{BASE_URL}/personal-info/{user_id}")
    print(f"GET /personal-info/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Personal info retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")
    
    # Test PUT
    update_data = {"phone": "+1-555-0456", "location": "New York, NY"}
    response = requests.put(f"{BASE_URL}/personal-info/{user_id}", json=update_data)
    print(f"PUT /personal-info/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Personal info updated successfully")
    else:
        print(f"✗ Error: {response.text}")

def test_education_endpoints():
    """Test Education Management endpoints"""
    print("\nTesting Education endpoints...")
    
    user_id = "test_user_123"
    education_data = {
        "user_id": user_id,
        "degree": "Bachelor of Science",
        "institution": "University of California",
        "field_of_study": "Computer Science",
        "graduation_date": "2020-06",
        "gpa": 3.8,
        "location": "Berkeley, CA"
    }
    
    # Test POST
    response = requests.post(f"{BASE_URL}/education/", json=education_data)
    print(f"POST /education/: {response.status_code}")
    if response.status_code == 201:
        print("✓ Education entry created successfully")
        education_id = response.json()["id"]
    else:
        print(f"✗ Error: {response.text}")
        return
    
    # Test GET list
    response = requests.get(f"{BASE_URL}/education/user/{user_id}")
    print(f"GET /education/user/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Education list retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")
    
    # Test GET by ID
    response = requests.get(f"{BASE_URL}/education/{education_id}")
    print(f"GET /education/{education_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Education entry retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")

    # Test PUT
    update_data = {"gpa": 3.9}
    response = requests.put(f"{BASE_URL}/education/{education_id}", json=update_data)
    print(f"PUT /education/{education_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Education entry updated successfully")
        # Check if the GPA was updated
        response = requests.get(f"{BASE_URL}/education/{education_id}")
        if response.status_code == 200 and response.json()["gpa"] == 3.9:
            print("✓ GPA updated correctly")
        else:
            print("✗ GPA was not updated correctly")
    else:
        print(f"✗ Error: {response.text}")

    # Test DELETE
    response = requests.delete(f"{BASE_URL}/education/{education_id}")
    print(f"DELETE /education/{education_id}: {response.status_code}")
    if response.status_code == 204:
        print("✓ Education entry deleted successfully")
    else:
        print(f"✗ Error: {response.text}")

def test_certifications_endpoints():
    """Test Certifications Management endpoints"""
    print("\nTesting Certifications endpoints...")
    
    user_id = "test_user_123"
    certification_data = {
        "user_id": user_id,
        "name": "AWS Certified Developer",
        "issuer": "Amazon Web Services",
        "issue_date": "2023-03",
        "expiry_date": "2026-03",
        "credential_id": "AWS-DEV-123456"
    }
    
    # Test POST
    response = requests.post(f"{BASE_URL}/certifications/", json=certification_data)
    print(f"POST /certifications/: {response.status_code}")
    if response.status_code == 201:
        print("✓ Certification created successfully")
        certification_id = response.json()["id"]
    else:
        print(f"✗ Error: {response.text}")
        return
    
    # Test GET list
    response = requests.get(f"{BASE_URL}/certifications/user/{user_id}")
    print(f"GET /certifications/user/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Certifications list retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")

def test_resume_versions_endpoints():
    """Test Resume Versions endpoints"""
    print("\nTesting Resume Versions endpoints...")
    
    user_id = "test_user_123"
    resume_version_data = {
        "company_name": "TechCorp Inc.",
        "company_email": "hr@techcorp.com",
        "job_title": "Senior Software Engineer",
        "job_description": "We're looking for a senior software engineer...",
        "resume_data": {
            "title": "Senior Software Engineer",
            "summary": "Experienced developer with 5+ years...",
            "experience": [],
            "skills": ["Python", "JavaScript", "React"]
        }
    }
    
    # Test POST
    response = requests.post(f"{BASE_URL}/resume-versions/?user_id={user_id}", json=resume_version_data)
    print(f"POST /resume-versions/: {response.status_code}")
    if response.status_code == 201:
        print("✓ Resume version created successfully")
        version_id = response.json()["id"]
    else:
        print(f"✗ Error: {response.text}")
        return
    
    # Test GET list
    response = requests.get(f"{BASE_URL}/resume-versions/user/{user_id}")
    print(f"GET /resume-versions/user/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Resume versions list retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")

def test_applications_endpoints():
    """Test Applications Tracking endpoints"""
    print("\nTesting Applications endpoints...")
    
    # First create a resume version to use
    user_id = "test_user_123"
    resume_version_data = {
        "company_name": "TestCorp",
        "company_email": "hr@testcorp.com",
        "job_title": "Software Engineer",
        "resume_data": {"title": "Software Engineer", "summary": "Test", "experience": [], "skills": []}
    }
    
    response = requests.post(f"{BASE_URL}/resume-versions/?user_id={user_id}", json=resume_version_data)
    if response.status_code != 201:
        print("✗ Could not create resume version for testing")
        return
    
    version_id = response.json()["id"]
    
    application_data = {
        "resume_version_id": version_id,
        "company": "TestCorp",
        "position": "Software Engineer",
        "application_date": "2024-01-15",
        "status": "applied",
        "notes": "Applied through company website"
    }
    
    # Test POST
    response = requests.post(f"{BASE_URL}/applications/", json=application_data)
    print(f"POST /applications/: {response.status_code}")
    if response.status_code == 201:
        print("✓ Application created successfully")
    else:
        print(f"✗ Error: {response.text}")
    
    # Test GET list
    response = requests.get(f"{BASE_URL}/applications/user/{user_id}")
    print(f"GET /applications/user/{user_id}: {response.status_code}")
    if response.status_code == 200:
        print("✓ Applications list retrieved successfully")
    else:
        print(f"✗ Error: {response.text}")

def main():
    """Run all endpoint tests"""
    print("Resume Editor API Endpoint Tests")
    print("=" * 40)
    
    try:
        # Test health endpoint first
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("✗ API server is not running. Please start the server first.")
            print("Run: python -m uvicorn app.main:app --reload")
            return
        
        print("✓ API server is running")
        
        # Run all tests
        test_personal_info_endpoints()
        test_education_endpoints()
        test_certifications_endpoints()
        test_resume_versions_endpoints()
        test_applications_endpoints()
        
        print("\n" + "=" * 40)
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to API server.")
        print("Please make sure the server is running on http://localhost:8000")
        print("Run: python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")

if __name__ == "__main__":
    main()
