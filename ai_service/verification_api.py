from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import json
from auto_verification_service import MongoDBProjectVerifier
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize verifier
verifier = None

def get_verifier():
    global verifier
    if verifier is None:
        verifier = MongoDBProjectVerifier()
    return verifier

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI Project Verification Service",
        "model_loaded": get_verifier().model is not None
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get verification statistics"""
    try:
        stats = get_verifier().get_verification_stats()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/verify', methods=['POST'])
def run_verification():
    """Run automated verification"""
    try:
        data = request.get_json() or {}
        
        confidence_threshold = data.get('confidence_threshold', 0.75)
        dry_run = data.get('dry_run', False)
        
        results = get_verifier().run_automated_verification(
            confidence_threshold=confidence_threshold,
            dry_run=dry_run
        )
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error in verification: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/verify/project/<project_id>', methods=['POST'])
def verify_single_project(project_id):
    """Verify a single project by ID"""
    try:
        # Get single project from database
        projects_collection = get_verifier().db.projects
        # Ensure we search by ObjectId
        try:
            oid = ObjectId(project_id)
        except Exception:
            return jsonify({"error": "Invalid project ID"}), 400
        project = projects_collection.find_one({"_id": oid})
        
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        # Prepare data
        df = get_verifier().prepare_project_data([project])
        
        # Make prediction
        predictions = get_verifier().predict_projects(df)
        
        if predictions:
            prediction_result = predictions[0]
            
            # Generate notes
            project_data = df.iloc[0].to_dict()
            notes = get_verifier().generate_verification_notes(
                project_data, 
                prediction_result['prediction'], 
                prediction_result['confidence']
            )
            
            # Update database if not dry run
            dry_run = request.get_json().get('dry_run', False) if request.get_json() else False
            
            if not dry_run:
                success = get_verifier().update_project_status(
                    project_id,
                    prediction_result['prediction'],
                    prediction_result['confidence'],
                    notes
                )
                prediction_result['updated'] = success
            
            prediction_result['notes'] = notes
            return jsonify(prediction_result)
        
        else:
            return jsonify({"error": "Failed to make prediction"}), 500
            
    except Exception as e:
        logger.error(f"Error verifying single project: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pending', methods=['GET'])
def get_pending_projects():
    """Get list of pending projects"""
    try:
        projects = get_verifier().get_pending_projects()
        
        # Convert ObjectId to string for JSON serialization
        serialized_projects = []
        for project in projects:
            project['_id'] = str(project['_id'])
            if 'creator' in project:
                project['creator'] = str(project['creator'])
            serialized_projects.append(project)
        
        return jsonify({
            "count": len(serialized_projects),
            "projects": serialized_projects
        })
        
    except Exception as e:
        logger.error(f"Error getting pending projects: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/model/retrain', methods=['POST'])
def retrain_model():
    """Trigger model retraining (placeholder for future implementation)"""
    return jsonify({
        "message": "Model retraining not implemented yet",
        "status": "pending"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI Verification Service API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)