import requests

base_url = "http://127.0.0.1:8000"

def test_auth():
    # Signup
    signup_data = {
        "email": "test_user@example.com",
        "hashed_password": "password123",
        "name": "Test User"
    }
    response = requests.post(f"{base_url}/auth/signup", json=signup_data)
    print(f"Signup Status: {response.status_code}")
    print(f"Signup Response: {response.json()}")

    if response.status_code != 200:
        # If user already exists, try login
        print("User might already exist, proceeding to login...")

    # Login
    login_data = {
        "username": "test_user@example.com",
        "password": "password123"
    }
    response = requests.post(f"{base_url}/auth/login", data=login_data)
    print(f"Login Status: {response.status_code}")
    print(f"Login Response: {response.json()}")

if __name__ == "__main__":
    test_auth()
