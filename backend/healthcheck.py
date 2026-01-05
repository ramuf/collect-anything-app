"""
Health check script for Docker container.
Returns exit code 0 if the service is healthy, 1 otherwise.
"""
import sys
import urllib.request
import urllib.error

def check_health():
    try:
        # Check if the FastAPI app is responding
        response = urllib.request.urlopen('http://localhost:8000/', timeout=5)
        if response.status == 200:
            print("Health check passed")
            return 0
    except urllib.error.URLError as e:
        print(f"Health check failed: {e}")
        return 1
    except Exception as e:
        print(f"Health check error: {e}")
        return 1
    
    print("Health check failed: unexpected response")
    return 1

if __name__ == "__main__":
    sys.exit(check_health())
