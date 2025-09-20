import requests
import json
import argparse

class VerificationClient:
    def __init__(self, base_url="http://localhost:5001"):
        self.base_url = base_url
    
    def health_check(self):
        """Check if the service is healthy"""
        response = requests.get(f"{self.base_url}/health")
        return response.json()
    
    def get_stats(self):
        """Get verification statistics"""
        response = requests.get(f"{self.base_url}/stats")
        return response.json()
    
    def run_verification(self, confidence_threshold=0.75, dry_run=False):
        """Run automated verification"""
        data = {
            "confidence_threshold": confidence_threshold,
            "dry_run": dry_run
        }
        response = requests.post(f"{self.base_url}/verify", json=data)
        return response.json()
    
    def get_pending_projects(self):
        """Get pending projects"""
        response = requests.get(f"{self.base_url}/pending")
        return response.json()
    
    def verify_single_project(self, project_id, dry_run=False):
        """Verify a single project"""
        data = {"dry_run": dry_run}
        response = requests.post(f"{self.base_url}/verify/project/{project_id}", json=data)
        return response.json()

def main():
    parser = argparse.ArgumentParser(description='AI Verification Service Client')
    parser.add_argument('--url', default='http://localhost:5001', help='Service URL')
    parser.add_argument('--action', choices=['health', 'stats', 'verify', 'pending'], 
                       default='health', help='Action to perform')
    parser.add_argument('--dry-run', action='store_true', help='Dry run mode')
    parser.add_argument('--confidence', type=float, default=0.75, help='Confidence threshold')
    
    args = parser.parse_args()
    
    client = VerificationClient(args.url)
    
    try:
        if args.action == 'health':
            result = client.health_check()
        elif args.action == 'stats':
            result = client.get_stats()
        elif args.action == 'verify':
            result = client.run_verification(args.confidence, args.dry_run)
        elif args.action == 'pending':
            result = client.get_pending_projects()
        
        print(json.dumps(result, indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to service: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()