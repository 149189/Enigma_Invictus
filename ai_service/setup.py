import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def download_nltk_data():
    """Download required NLTK data"""
    print("Downloading NLTK data...")
    import nltk
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)

def create_directories():
    """Create necessary directories"""
    directories = ['models', 'logs', 'temp', 'data']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"Created directory: {directory}")

def check_model():
    """Check if ML model exists"""
    model_path = Path("project_verification_model.pkl")
    if not model_path.exists():
        print("⚠️  ML model not found!")
        print("Please train the model first:")
        print("python train_model.py")
        return False
    else:
        print("✓ ML model found")
        return True

def create_env_file():
    """Create .env file from template"""
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if not env_path.exists() and env_example_path.exists():
        print("Creating .env file from template...")
        with open(env_example_path, 'r') as f:
            content = f.read()
        
        with open(env_path, 'w') as f:
            f.write(content)
        
        print("✓ Created .env file. Please update with your settings.")
    elif env_path.exists():
        print("✓ .env file already exists")

def main():
    """Main setup function"""
    print("Setting up AI Project Verification Service...")
    print("=" * 50)
    
    try:
        # Install requirements
        install_requirements()
        
        # Download NLTK data
        download_nltk_data()
        
        # Create directories
        create_directories()
        
        # Create .env file
        create_env_file()
        
        # Check model
        model_exists = check_model()
        
        print("\n" + "=" * 50)
        print("Setup completed!")
        
        if model_exists:
            print("\n✓ Ready to run the service:")
            print("python verification_api.py")
        else:
            print("\n⚠️  Next steps:")
            print("1. Train the ML model: python train_model.py")
            print("2. Update .env file with your MongoDB connection")
            print("3. Start the service: python verification_api.py")
        
        print("\nOr use the convenience script:")
        print("chmod +x run_service.sh && ./run_service.sh")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()