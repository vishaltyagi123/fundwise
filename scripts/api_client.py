"""
API Client for Fundwise Backend Communication
Handles authentication and API calls for compliance operations
"""
import requests
import logging
from typing import Optional, Dict, Any, List
from config import API_BASE_URL, API_USERNAME, API_PASSWORD, MAX_RETRIES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FundwiseAPIClient:
    """Client for interacting with Fundwise Compliance APIs"""

    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()

    def authenticate(self, email: str = API_USERNAME, password: str = API_PASSWORD) -> bool:
        """Authenticate and obtain JWT token"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json={"email": email, "password": password}
            )
            response.raise_for_status()
            data = response.json()
            self.token = data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            logger.info("Successfully authenticated with Fundwise API")
            return True
        except requests.RequestException as e:
            logger.error(f"Authentication failed: {e}")
            return False

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Make authenticated API request with retry logic"""
        if not self.token:
            if not self.authenticate():
                return None

        url = f"{self.base_url}{endpoint}"

        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.request(method, url, **kwargs)
                response.raise_for_status()
                return response.json() if response.content else {}
            except requests.HTTPError as e:
                if e.response.status_code == 401:
                    logger.warning("Token expired, re-authenticating...")
                    if self.authenticate():
                        continue
                logger.error(f"HTTP error on {endpoint}: {e}")
            except requests.RequestException as e:
                logger.error(f"Request failed on attempt {attempt + 1}: {e}")

        return None

    # ==================== Compliance Dashboard ====================

    def get_compliance_dashboard(self) -> Optional[Dict[str, Any]]:
        """Get compliance dashboard statistics"""
        return self._make_request("GET", "/compliance/dashboard")

    # ==================== Alerts ====================

    def get_alerts(self, status: Optional[str] = None, page: int = 0, size: int = 100) -> Optional[Dict[str, Any]]:
        """Get compliance alerts with optional filtering"""
        params = {"page": page, "size": size}
        if status:
            params["status"] = status
        return self._make_request("GET", "/compliance/alerts", params=params)

    def update_alert_status(self, alert_id: int, status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update alert status"""
        body = {"status": status}
        if notes:
            body["notes"] = notes
        return self._make_request("PUT", f"/compliance/alerts/{alert_id}/status", json=body)

    def escalate_alert(self, alert_id: int) -> Optional[Dict[str, Any]]:
        """Escalate alert to a case"""
        return self._make_request("POST", f"/compliance/alerts/{alert_id}/escalate")

    # ==================== Detection Rules ====================

    def get_rules(self) -> Optional[List[Dict[str, Any]]]:
        """Get all detection rules"""
        return self._make_request("GET", "/compliance/rules")

    def toggle_rule(self, rule_id: int) -> Optional[Dict[str, Any]]:
        """Toggle rule enabled status"""
        return self._make_request("POST", f"/compliance/rules/{rule_id}/toggle")

    def create_rule(self, rule_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new detection rule"""
        return self._make_request("POST", "/compliance/rules", json=rule_data)

    # ==================== Watchlist ====================

    def get_watchlist(self, watchlist_type: Optional[str] = None, page: int = 0, size: int = 100) -> Optional[Dict[str, Any]]:
        """Get watchlist entries"""
        params = {"page": page, "size": size}
        if watchlist_type:
            params["type"] = watchlist_type
        return self._make_request("GET", "/compliance/watchlist", params=params)

    def search_watchlist(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Search watchlist by name"""
        return self._make_request("GET", "/compliance/watchlist/search", params={"query": query})

    def add_watchlist_entry(self, entry_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add new watchlist entry"""
        return self._make_request("POST", "/compliance/watchlist", json=entry_data)

    def screen_user(self, user_id: int) -> Optional[List[Dict[str, Any]]]:
        """Screen a specific user against watchlists"""
        return self._make_request("POST", f"/compliance/watchlist/screen/{user_id}")

    def screen_all_users(self) -> Optional[Dict[str, Any]]:
        """Screen all users against watchlists"""
        return self._make_request("POST", "/compliance/watchlist/screen-all")

    # ==================== Transaction Monitoring ====================

    def monitor_transaction(self, transaction_id: int) -> Optional[List[Dict[str, Any]]]:
        """Monitor a specific transaction"""
        return self._make_request("POST", f"/compliance/monitor/transaction/{transaction_id}")

    def monitor_batch(self, limit: int = 100) -> Optional[Dict[str, Any]]:
        """Run batch transaction monitoring"""
        return self._make_request("POST", "/compliance/monitor/batch", params={"limit": limit})

    # ==================== Cases ====================

    def get_cases(self, status: Optional[str] = None, page: int = 0, size: int = 100) -> Optional[Dict[str, Any]]:
        """Get compliance cases"""
        params = {"page": page, "size": size}
        if status:
            params["status"] = status
        return self._make_request("GET", "/compliance/cases", params=params)

    def update_case(self, case_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update case status/notes"""
        return self._make_request("PUT", f"/compliance/cases/{case_id}", json=updates)


# Singleton instance
client = FundwiseAPIClient()
