"""
Configuration for Fundwise Compliance Automation Scripts
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080/api")
API_USERNAME = os.getenv("API_USERNAME", "admin@fundwise.com")
API_PASSWORD = os.getenv("API_PASSWORD", "admin123")

# Batch Processing
BATCH_SIZE = 100
MAX_RETRIES = 3

# Watchlist Sources
WATCHLIST_SOURCES = {
    "OFAC_SDN": "https://www.treasury.gov/ofac/downloads/sdn.csv",
    "UN_SANCTIONS": "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
    "EU_SANCTIONS": "https://webgate.ec.europa.eu/fsd/fsf/public/files/csvFullSanctionsList/content",
}

# Risk Thresholds
HIGH_RISK_SCORE_THRESHOLD = 75
CRITICAL_RISK_SCORE_THRESHOLD = 90

# Scheduling
SCREENING_INTERVAL_HOURS = 24
TRANSACTION_MONITOR_INTERVAL_MINUTES = 15

# Logging
LOG_FILE = "compliance_automation.log"
LOG_LEVEL = "INFO"
