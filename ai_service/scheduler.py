import schedule
import time
import logging
from auto_verification_service import MongoDBProjectVerifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_verification():
    """Run verification job"""
    try:
        logger.info("Starting scheduled verification...")
        verifier = MongoDBProjectVerifier()
        
        results = verifier.run_automated_verification(
            confidence_threshold=0.75,
            dry_run=False
        )
        
        logger.info(f"Scheduled verification completed: {results}")
        verifier.close_connection()
        
    except Exception as e:
        logger.error(f"Scheduled verification failed: {e}")

def main():
    """Main scheduler function"""
    # Schedule verification every 30 minutes
    schedule.every(30).minutes.do(run_verification)
    
    # Schedule daily stats report
    schedule.every().day.at("09:00").do(lambda: logger.info("Daily verification stats check"))
    
    logger.info("Scheduler started. Verification will run every 30 minutes.")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()