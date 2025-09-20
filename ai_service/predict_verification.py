import sys
import json
import pandas as pd
import joblib
import numpy as np
from pathlib import Path
import logging
import argparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_model(model_path="project_verification_model.pkl"):
    """Load the trained ML model"""
    try:
        if Path(model_path).exists():
            model = joblib.load(model_path)
            logger.info(f"Model loaded from {model_path}")
            return model
        else:
            logger.error(f"Model file {model_path} not found")
            return None
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return None

def preprocess_csv_data(csv_path):
    """Load and preprocess CSV data for prediction"""
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} records from {csv_path}")
        
        # Create required features
        df['title_processed'] = df['title'].fillna('').astype(str)
        df['description_processed'] = df['description'].fillna('').astype(str)
        df['combined_text'] = df['title_processed'] + ' ' + df['description_processed']
        
        # Create additional features
        df['title_length'] = df['title'].astype(str).str.len()
        df['description_length'] = df['description'].astype(str).str.len()
        df['goalAmount_log'] = np.log1p(df['goalAmount'].fillna(0))
        
        return df
        
    except Exception as e:
        logger.error(f"Error preprocessing CSV data: {e}")
        return None

def make_predictions(model, df):
    """Make predictions on the dataset"""
    try:
        # Prepare features for prediction
        X = df[['combined_text', 'category', 'goalAmount_log', 'title_length', 'description_length']]
        
        # Fill any missing values
        X = X.fillna('')
        
        # Get predictions and probabilities
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)
        
        results = []
        for i, (project_id, prediction, prob) in enumerate(zip(df['_id'], predictions, probabilities)):
            confidence = max(prob)
            
            result = {
                'project_id': str(project_id),
                'prediction': int(prediction),
                'confidence': float(confidence),
                'approval_probability': float(prob[1]) if len(prob) > 1 else 0.0,
                'rejection_probability': float(prob[0]) if len(prob) > 0 else 0.0
            }
            results.append(result)
        
        return results
        
    except Exception as e:
        logger.error(f"Error making predictions: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description='Predict project verification status')
    parser.add_argument('csv_file', help='Path to CSV file containing project data')
    parser.add_argument('--model', default='project_verification_model.pkl', help='Path to ML model file')
    parser.add_argument('--output', help='Output file path (optional)')
    
    args = parser.parse_args()
    
    # Load model
    model = load_model(args.model)
    if model is None:
        sys.exit(1)
    
    # Load and preprocess data
    df = preprocess_csv_data(args.csv_file)
    if df is None:
        sys.exit(1)
    
    # Make predictions
    predictions = make_predictions(model, df)
    if not predictions:
        sys.exit(1)
    
    # Output results
    results_json = json.dumps(predictions, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(results_json)
        logger.info(f"Results saved to {args.output}")
    else:
        print(results_json)

if __name__ == "__main__":
    main()
