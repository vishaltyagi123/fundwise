"""
Screening Scheduler Script
Automated scheduling of watchlist screening and compliance checks
"""
import logging
import schedule
import time
from datetime import datetime
from typing import Dict, Any
from api_client import client
from transaction_monitor import TransactionMonitor
from watchlist_importer import WatchlistImporter
from config import SCREENING_INTERVAL_HOURS, TRANSACTION_MONITOR_INTERVAL_MINUTES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ComplianceScheduler:
    """Scheduler for automated compliance operations"""

    def __init__(self):
        self.transaction_monitor = TransactionMonitor()
        self.watchlist_importer = WatchlistImporter()
        self.last_screening: datetime = None
        self.stats = {
            "screening_runs": 0,
            "monitoring_runs": 0,
            "watchlist_matches_found": 0,
            "alerts_generated": 0
        }

    def run_watchlist_screening(self) -> Dict[str, Any]:
        """Run full watchlist screening for all users"""
        logger.info("Starting scheduled watchlist screening...")
        self.last_screening = datetime.now()
        self.stats["screening_runs"] += 1

        result = client.screen_all_users()

        if result:
            matches_count = sum(len(matches) for matches in result.values())
            self.stats["watchlist_matches_found"] += matches_count
            logger.info(f"Screening complete: {len(result)} users with potential matches")

            # Log high-confidence matches
            for user_id, matches in result.items():
                for match in matches:
                    if match.get("matchScore", 0) >= 0.90:
                        logger.warning(
                            f"HIGH CONFIDENCE MATCH: User {user_id} matches "
                            f"{match.get('watchlistEntry', {}).get('fullName')} "
                            f"(Score: {match.get('matchScore', 0):.2%})"
                        )
        else:
            logger.warning("Watchlist screening failed or no results")

        return result or {}

    def run_transaction_monitoring(self) -> Dict[str, Any]:
        """Run transaction monitoring cycle"""
        self.stats["monitoring_runs"] += 1
        result = self.transaction_monitor.run_monitoring_cycle()
        self.stats["alerts_generated"] += result.get("alertsGenerated", 0)
        return result

    def run_watchlist_update(self) -> Dict[str, Any]:
        """Run watchlist update from external sources"""
        logger.info("Starting scheduled watchlist update...")
        return self.watchlist_importer.run_full_update()

    def generate_daily_report(self) -> Dict[str, Any]:
        """Generate daily compliance report"""
        logger.info("Generating daily compliance report...")

        dashboard = client.get_compliance_dashboard()
        open_alerts = client.get_alerts(status="OPEN")
        open_cases = client.get_cases(status="OPEN")

        report = {
            "date": datetime.now().isoformat(),
            "dashboard_summary": dashboard,
            "open_alerts_count": len(open_alerts.get("content", [])) if open_alerts else 0,
            "open_cases_count": len(open_cases.get("content", [])) if open_cases else 0,
            "scheduler_stats": self.stats
        }

        # Log summary
        logger.info("=" * 60)
        logger.info("DAILY COMPLIANCE REPORT")
        logger.info("=" * 60)
        logger.info(f"Date: {report['date']}")
        logger.info(f"Open Alerts: {report['open_alerts_count']}")
        logger.info(f"Open Cases: {report['open_cases_count']}")
        logger.info(f"Screening Runs Today: {self.stats['screening_runs']}")
        logger.info(f"Monitoring Runs Today: {self.stats['monitoring_runs']}")
        logger.info(f"Watchlist Matches Found: {self.stats['watchlist_matches_found']}")
        logger.info(f"Alerts Generated: {self.stats['alerts_generated']}")
        logger.info("=" * 60)

        return report

    def setup_schedule(self):
        """Configure scheduled tasks"""
        # Transaction monitoring every 15 minutes
        schedule.every(TRANSACTION_MONITOR_INTERVAL_MINUTES).minutes.do(
            self.run_transaction_monitoring
        )

        # Watchlist screening every 24 hours
        schedule.every(SCREENING_INTERVAL_HOURS).hours.do(
            self.run_watchlist_screening
        )

        # Watchlist update weekly (Sunday at 2 AM)
        schedule.every().sunday.at("02:00").do(
            self.run_watchlist_update
        )

        # Daily report at 6 AM
        schedule.every().day.at("06:00").do(
            self.generate_daily_report
        )

        logger.info("Compliance scheduler configured:")
        logger.info(f"  - Transaction monitoring: every {TRANSACTION_MONITOR_INTERVAL_MINUTES} minutes")
        logger.info(f"  - Watchlist screening: every {SCREENING_INTERVAL_HOURS} hours")
        logger.info(f"  - Watchlist update: weekly (Sunday 02:00)")
        logger.info(f"  - Daily report: 06:00")

    def run(self):
        """Start the scheduler"""
        self.setup_schedule()

        logger.info("Starting Compliance Scheduler...")
        logger.info("Running initial tasks...")

        # Run initial tasks
        self.run_transaction_monitoring()

        logger.info("Scheduler running. Press Ctrl+C to stop.")

        while True:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except KeyboardInterrupt:
                logger.info("Scheduler stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in scheduler: {e}")
                time.sleep(60)

    def get_statistics(self) -> Dict[str, Any]:
        """Get scheduler statistics"""
        return {
            **self.stats,
            "last_screening": self.last_screening.isoformat() if self.last_screening else None,
            "transaction_monitor_stats": self.transaction_monitor.get_statistics(),
            "watchlist_import_stats": self.watchlist_importer.get_statistics()
        }


def main():
    """Main entry point for compliance scheduler"""
    import argparse

    parser = argparse.ArgumentParser(description="Compliance Scheduling Automation")
    parser.add_argument("--screen-now", action="store_true", help="Run watchlist screening immediately")
    parser.add_argument("--monitor-now", action="store_true", help="Run transaction monitoring immediately")
    parser.add_argument("--report", action="store_true", help="Generate compliance report")
    parser.add_argument("--daemon", action="store_true", help="Run as background scheduler")
    args = parser.parse_args()

    scheduler = ComplianceScheduler()

    if args.screen_now:
        result = scheduler.run_watchlist_screening()
        print(f"\nScreening Results: {len(result)} users with potential matches")
    elif args.monitor_now:
        result = scheduler.run_transaction_monitoring()
        print(f"\nMonitoring Results: {result}")
    elif args.report:
        report = scheduler.generate_daily_report()
        print(f"\nReport Generated: {report}")
    elif args.daemon:
        scheduler.run()
    else:
        print("Please specify an action: --screen-now, --monitor-now, --report, or --daemon")


if __name__ == "__main__":
    main()
