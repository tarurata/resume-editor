#!/usr/bin/env python3
"""
Test script for Resume Editor Authentication API endpoints
"""

import requests
import json
import uuid

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_auth_endpoints():
    """Test Authentication CRUD endpoints"""
    print("Testing Authentication endpoints...")
    
    # Test data
    user_email = f"test_user_{uuid.uuid4().hex[:6]}@example.com"
    user_password = "a_secure_password"
    
    # Test user registration
    register_data = {
        "email": user_email,
        "password": user_password
    }
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"POST /api/v1/auth/register: {response.status_code}")
    if response.status_code == 200:
        print("✓ User registered successfully")
    else:
        print(f"✗ Error: {response.text}")
        return

    # Test user login
    login_data = {
        "username": user_email,
        "password": user_password
    }
    response = requests.post(f"{BASE_URL}/api/v1/auth/token", data=login_data)
    print(f"POST /api/v1/auth/token: {response.status_code}")
    if response.status_code == 200:
        print("✓ User logged in successfully")
        access_token = response.json()["access_token"]
    else:
        print(f"✗ Error: {response.text}")
        return

    # Test accessing a protected endpoint without a token
    response = requests.get(f"{BASE_URL}/api/v1/resumes/")
    print(f"GET /api/v1/resumes/ (without token): {response.status_code}")
    if response.status_code == 401:
        print("✓ Protected endpoint returned 401 without token")
    else:
        print(f"✗ Error: Protected endpoint returned {response.status_code} instead of 401")

    # Test accessing a protected endpoint with a valid token
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/v1/resumes/", headers=headers)
    print(f"GET /api/v1/resumes/ (with token): {response.status_code}")
    if response.status_code == 200:
        print("✓ Protected endpoint accessed successfully with token")
    else:
        print(f"✗ Error: {response.text}")

    # Test user logout
    response = requests.post(f"{BASE_URL}/api/v1/auth/logout", headers=headers)
    print(f"POST /api/v1/auth/logout: {response.status_code}")
    if response.status_code == 200:
        print("✓ User logged out successfully")
    else:
        print(f"✗ Error: {response.text}")

def main():
    """Run all endpoint tests"""
    print("Resume Editor Auth API Endpoint Tests")
    print("=" * 40)
    
    try:
        # Test health endpoint first
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("✗ API server is not running. Please start the server first.")
            return
        
        print("✓ API server is running")
        
        # Run all tests
        test_auth_endpoints()
        
        print("\n" + "=" * 40)
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to API server.")
        print("Please make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")

if __name__ == "__main__":
    main()
