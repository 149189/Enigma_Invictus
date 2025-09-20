# ai_service/auto_verification_service.py
import pymongo
import pandas as pd
import joblib
import numpy as np
from datetime import datetime, timezone
import json
import logging
from typing import List, Dict, Tuple
import os
from dotenv import load_dotenv
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBProjectVerifier:
    def __init__(self, connection_string=None, database_name="crowdfunding"):
        """
        Initialize MongoDB connection and load ML model
        """
        self.connection_string = connection_string or os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        self.database_name = database_name
        self.client = None
        self.db = None
        self.model = None
        
        # Text preprocessing
        try:
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
        except:
            logger.warning("NLTK data not available, using basic preprocessing")
            self.lemmatizer = None
            self.stop_words = set()
        
        self.connect_to_mongodb()
        self.load_model()
    
    def connect_to_mongodb(self):
        """Connect to MongoDB database"""
        try:
            self.client = pymongo.MongoClient(self.connection_string)
            self.db = self.client[self.database_name]
            # Test connection
            self.client.server_info()
            logger.info(f"Connected to MongoDB database: {self.database_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def load_model(self, model_path="project_verification_model.pkl"):
        """Load the trained ML model"""
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info(f"Model loaded from {model_path}")
            else:
                logger.warning(f"Model file {model_path} not found. Please train the model first.")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None
    
    def get_pending_projects(self) -> List[Dict]:
        """Retrieve all pending projects from MongoDB"""
        try:
            projects_collection = self.db.projects
            pending_projects = list(projects_collection.find({"status": "pending"}))
            logger.info(f"Retrieved {len(pending_projects)} pending projects")
            return pending_projects
        except Exception as e:
            logger.error(f"Error retrieving pending projects: {e}")
            return []
    
    def preprocess_text(self, text):
        """Preprocess text data for ML model"""
        if pd.isna(text) or text is None:
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        words = text.split()
        
        # Remove stopwords and lemmatize if available
        if self.lemmatizer and self.stop_words:
            words = [self.lemmatizer.lemmatize(word) for word in words if word not in self.stop_words]
        else:
            # Basic filtering
            words = [word for word in words if len(word) > 2]
        
        return ' '.join(words)
    
    def prepare_project_data(self, projects: List[Dict]) -> pd.DataFrame:
        """Convert MongoDB project data to DataFrame for ML prediction"""
        processed_data = []
        
        for project in projects:
            # Handle ObjectId conversion
            project_id = str(project['_id'])
            creator_id = str(project.get('creator', ''))
            
            # Process text fields
            title = project.get('title', '')
            description = project.get('description', '')
            
            title_processed = self.preprocess_text(title)
            description_processed = self.preprocess_text(description)
            combined_text = f"{title_processed} {description_processed}"
            
            # Create feature set matching training data
            processed_project = {
                '_id': project_id,
                'creator_id': creator_id,
                'title': title,
                'description': description,
                'category': project.get('category', 'Other'),
                'goalAmount': project.get('goalAmount', 0),
                'raisedAmount': project.get('raisedAmount', 0),
                'status': project.get('status', 'pending'),
                'media_attachments': json.dumps(project.get('images', [])),
                'createdAt': project.get('createdAt', datetime.now()),
                'verified_status': 'pending',
                'verification_notes': '',
                
                # Processed features
                'title_processed': title_processed,
                'description_processed': description_processed,
                'combined_text': combined_text,
                'title_length': len(str(title)),
                'description_length': len(str(description)),
                'goalAmount_log': np.log1p(project.get('goalAmount', 1))
            }
            
            processed_data.append(processed_project)
        
        df = pd.DataFrame(processed_data)
        logger.info(f"Prepared {len(df)} projects for prediction")
        return df
    
    def predict_projects(self, df: pd.DataFrame) -> List[Dict]:
        """Make predictions on project data"""
        if self.model is None:
            logger.error("Model not loaded. Cannot make predictions.")
            return []
        
        try:
            # Prepare features for prediction
            X = df[['combined_text', 'category', 'goalAmount_log', 'title_length', 'description_length']]
            
            # Get predictions and probabilities
            predictions = self.model.predict(X)
            probabilities = self.model.predict_proba(X)
            
            results = []
            for i, (project_id, prediction, prob) in enumerate(zip(df['_id'], predictions, probabilities)):
                confidence = max(prob)  # Confidence is the highest probability
                
                result = {
                    'project_id': project_id,
                    'prediction': int(prediction),
                    'confidence': float(confidence),
                    'approval_probability': float(prob[1]) if len(prob) > 1 else 0.0,
                    'rejection_probability': float(prob[0]) if len(prob) > 0 else 0.0
                }
                results.append(result)
            
            logger.info(f"Made predictions for {len(results)} projects")
            return results
            
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            return []
    
    def generate_verification_notes(self, project_data: Dict, prediction: int, confidence: float) -> str:
        """Generate verification notes based on prediction and project analysis"""
        notes = []
        
        if prediction == 0:  # Rejected
            # Analyze common rejection reasons
            if project_data.get('description_length', 0) < 50:
                notes.append("Description too brief")
            
            if project_data.get('goalAmount', 0) > 100000:
                notes.append("Goal amount appears unrealistic")
            
            title = str(project_data.get('title', '')).lower()
            personal_indicators = ['buy me', 'personal', 'vacation', 'luxury', 'birthday', 'trip']
            if any(indicator in title for indicator in personal_indicators):
                notes.append("Appears to be personal request rather than community project")
            
            media_attachments = project_data.get('media_attachments', '[]')
            try:
                attachments = json.loads(media_attachments)
                if not attachments or len(attachments) == 0:
                    notes.append("No supporting media provided")
            except:
                pass
            
            vague_patterns = ['trust me', 'urgent', 'need money', 'please help']
            description = str(project_data.get('description', '')).lower()
            if any(pattern in description for pattern in vague_patterns):
                notes.append("Vague or insufficient project details")
        
        else:  # Approved
            notes.append("Project meets community funding criteria")
            
            if confidence > 0.9:
                notes.append("High confidence approval")
            elif confidence > 0.8:
                notes.append("Good confidence approval")
        
        base_note = f"Auto-verified with {confidence*100:.1f}% confidence"
        if notes:
            return f"{base_note}. {'; '.join(notes)}"
        else:
            return base_note
    
    def update_project_status(self, project_id: str, prediction: int, confidence: float, notes: str) -> bool:
        """Update project status in MongoDB"""
        try:
            projects_collection = self.db.projects
            
            new_status = "approved" if prediction == 1 else "rejected"
            
            update_data = {
                "status": new_status,
                "verificationNotes": notes,
                "verifiedAt": datetime.now(timezone.utc),
                "autoVerified": True,
                "verificationConfidence": confidence
            }
            
            result = projects_collection.update_one(
                {"_id": pymongo.ObjectId(project_id)},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated project {project_id} to {new_status}")
                return True
            else:
                logger.warning(f"Failed to update project {project_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating project {project_id}: {e}")
            return False
    
    def run_automated_verification(self, confidence_threshold: float = 0.75, dry_run: bool = False) -> Dict:
        """Main function to run automated verification"""
        try:
            logger.info("Starting automated project verification...")
            
            # Step 1: Get pending projects
            pending_projects = self.get_pending_projects()
            if not pending_projects:
                logger.info("No pending projects found")
                return {"processed": 0, "approved": 0, "rejected": 0, "manual_review": 0}
            
            # Step 2: Prepare data for ML
            df = self.prepare_project_data(pending_projects)
            
            # Step 3: Make predictions
            predictions = self.predict_projects(df)
            if not predictions:
                logger.error("Failed to make predictions")
                return {"processed": 0, "approved": 0, "rejected": 0, "manual_review": 0}
            
            # Step 4: Process results
            approved = 0
            rejected = 0
            manual_review = 0
            processed_projects = []
            
            for i, prediction_result in enumerate(predictions):
                project_id = prediction_result['project_id']
                prediction = prediction_result['prediction']
                confidence = prediction_result['confidence']
                
                # Get original project data for note generation
                project_data = df[df['_id'] == project_id].iloc[0].to_dict()
                
                if confidence >= confidence_threshold:
                    # Generate verification notes
                    notes = self.generate_verification_notes(project_data, prediction, confidence)
                    
                    if not dry_run:
                        # Update database
                        success = self.update_project_status(project_id, prediction, confidence, notes)
                        if success:
                            if prediction == 1:
                                approved += 1
                            else:
                                rejected += 1
                    else:
                        # Dry run - just count
                        if prediction == 1:
                            approved += 1
                        else:
                            rejected += 1
                    
                    processed_projects.append({
                        'project_id': project_id,
                        'title': project_data.get('title', ''),
                        'prediction': 'approved' if prediction == 1 else 'rejected',
                        'confidence': confidence,
                        'notes': notes
                    })
                    
                else:
                    manual_review += 1
                    logger.info(f"Project {project_id} requires manual review (confidence: {confidence:.3f})")
            
            result = {
                "processed": len(processed_projects),
                "approved": approved,
                "rejected": rejected,
                "manual_review": manual_review,
                "projects": processed_projects
            }
            
            logger.info(f"Verification complete: {approved} approved, {rejected} rejected, {manual_review} for manual review")
            return result
            
        except Exception as e:
            logger.error(f"Error in automated verification: {e}")
            return {"error": str(e)}
    
    def get_verification_stats(self) -> Dict:
        """Get current verification statistics from database"""
        try:
            projects_collection = self.db.projects
            
            # Get status counts
            pipeline = [
                {"$group": {"_id": "$status", "count": {"$sum": 1}}}
            ]
            
            status_counts = list(projects_collection.aggregate(pipeline))
            total_projects = projects_collection.count_documents({})
            
            stats = {
                "total_projects": total_projects,
                "status_breakdown": {item["_id"]: item["count"] for item in status_counts}
            }
            
            # Get auto-verification stats if available
            auto_verified = projects_collection.count_documents({"autoVerified": True})
            stats["auto_verified"] = auto_verified
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting verification stats: {e}")
            return {"error": str(e)}
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

def main():
    """Main function for running the verification service"""
    # Initialize the verifier
    verifier = MongoDBProjectVerifier()
    
    try:
        # Get current stats
        logger.info("Current verification statistics:")
        stats = verifier.get_verification_stats()
        print(json.dumps(stats, indent=2))
        
        # Run automated verification
        results = verifier.run_automated_verification(
            confidence_threshold=0.75,
            dry_run=False  # Set to True for testing without database updates
        )
        
        print("\nVerification Results:")
        print(json.dumps(results, indent=2))
        
    finally:
        verifier.close_connection()

if __name__ == "__main__":
    main()