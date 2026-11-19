"""
Transaction Monitoring Automation Script
Periodically monitors transactions for suspicious activity patterns
"""
import logging
import time
from datetime import datetime
from typing import Dict, Any, List
from api_client import client
from config import (
    BATCH_SIZE,
    HIGH_RISK_SCORE_THRESHOLD,
    CRITICAL_RISK_SCORE_THRESHOLD,
    TRANSACTION_MONITOR_INTERVAL_MINUTES
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TransactionMonitor:
    """Automated transaction monitoring for AML/KYC compliance"""

    def __init__(self):
        self.last_run: datetime = None
        self.stats = {
            "transactions_processed": 0,
            "alerts_generated": 0,
            "high_risk_alerts": 0,
            "critical_alerts": 0
        }

    def run_monitoring_cycle(self) -> Dict[str, Any]:
        """Execute a complete monitoring cycle"""
        logger.info("Starting transaction monitoring cycle...")
        self.last_run = datetime.now()

        # Run batch monitoring
        result = client.monitor_batch(limit=BATCH_SIZE)

        if result:
            self.stats["transactions_processed"] += result.get("transactionsProcessed", 0)
            self.stats["alerts_generated"] += result.get("alertsGenerated", 0)

            logger.info(
                f"Monitoring cycle complete: "
                f"{result.get('transactionsProcessed', 0)} transactions processed, "
                f"{result.get('alertsGenerated', 0)} alerts generated"
            )

            # Check for high-severity alerts
            self._process_new_alerts()
        else:
            logger.warning("Transaction monitoring cycle failed")

        return result or {}

    def _process_new_alerts(self):
        """Process and categorize new alerts"""
        # Get open alerts
        alerts_response = client.get_alerts(status="OPEN")

        if not alerts_response:
            return

        alerts = alerts_response.get("content", [])

        for alert in alerts:
            risk_score = alert.get("riskScore", 0)
            severity = alert.get("severity", "")

            if risk_score >= CRITICAL_RISK_SCORE_THRESHOLD or severity == "CRITICAL":
                self.stats["critical_alerts"] += 1
                logger.warning(
                    f"CRITICAL ALERT: {alert.get('alertNumber')} - "
                    f"{alert.get('description')} (Risk Score: {risk_score})"
                )
                # Auto-escalate critical alerts
                self._auto_escalate_critical(alert)

            elif risk_score >= HIGH_RISK_SCORE_THRESHOLD or severity == "HIGH":
                self.stats["high_risk_alerts"] += 1
                logger.info(
                    f"HIGH RISK ALERT: {alert.get('alertNumber')} - "
                    f"{alert.get('description')} (Risk Score: {risk_score})"
                )

    def _auto_escalate_critical(self, alert: Dict[str, Any]):
        """Automatically escalate critical alerts to cases"""
        alert_id = alert.get("id")
        if alert_id:
            result = client.escalate_alert(alert_id)
            if result:
                logger.info(f"Auto-escalated critical alert {alert.get('alertNumber')} to case {result.get('caseNumber')}")

    def get_statistics(self) -> Dict[str, Any]:
        """Get monitoring statistics"""
        return {
            **self.stats,
            "last_run": self.last_run.isoformat() if self.last_run else None
        }

    def run_continuous(self, interval_minutes: int = TRANSACTION_MONITOR_INTERVAL_MINUTES):
        """Run continuous monitoring at specified interval"""
        logger.info(f"Starting continuous transaction monitoring (interval: {interval_minutes} minutes)")

        while True:
            try:
                self.run_monitoring_cycle()
                time.sleep(interval_minutes * 60)
            except KeyboardInterrupt:
                logger.info("Transaction monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in monitoring cycle: {e}")
                time.sleep(60)  # Wait 1 minute before retry


def main():
    """Main entry point for transaction monitoring"""
    import argparse

    parser = argparse.ArgumentParser(description="Transaction Monitoring Automation")
    parser.add_argument("--once", action="store_true", help="Run single monitoring cycle")
    parser.add_argument("--interval", type=int, default=TRANSACTION_MONITOR_INTERVAL_MINUTES,
                        help="Monitoring interval in minutes")
    args = parser.parse_args()

    monitor = TransactionMonitor()

    if args.once:
        result = monitor.run_monitoring_cycle()
        print(f"\nMonitoring Results: {result}")
        print(f"Statistics: {monitor.get_statistics()}")
    else:
        monitor.run_continuous(interval_minutes=args.interval)


if __name__ == "__main__":
    main()
